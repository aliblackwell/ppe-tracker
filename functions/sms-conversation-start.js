const app = require("./helpers/express")
const serverless = require("serverless-http")
const { getEnglishDateString } = require("./helpers/time")
const createHash = require("./helpers/crypto")
const { db } = require("./helpers/database")
const { twilio, twilioEnvironment } = require("./helpers/twilio")

app.get("*", async (req, res, next) => {
  try {
    const englishDateString = getEnglishDateString()
    const todayBasedIdentifier = createHash(englishDateString, process.env.SALT_THREE)
    const burstIdentifier = `sms-mailshot:${todayBasedIdentifier}`

    const smsBurst = {
      _id: burstIdentifier,
      readableDate: todayBasedIdentifier,
      created: Date.now(),
    }

    const success = await db.insert(smsBurst)
    req["sms-burst"] = success
    req["sms-bd"] = burstIdentifier
    next()
  } catch (error) {
    console.log(error)
    return res.status(504).json({ error: "Already sent today" })
  }
})

app.get("*", async (req, res) => {
  try {
    const englishDateString = getEnglishDateString()
    const docs = await db.partitionedList("user", { include_docs: true })
    const executions = []
    const updated_docs = []
    for (const doc of docs.rows) {
      // output each document's body
      if (doc.doc.mobile && doc.doc.readableDate !== englishDateString) {
        // they didn't sign up today

        const parameters = {
          environment: twilioEnvironment,
          firstTime: doc.doc.texted ? "no" : "yes",
        }

        const execution = await twilio.studio.v1
          .flows(process.env.TWILIO_FLOW_ID)
          .executions.create({
            to: doc.doc.mobile,
            from: process.env.TWILIO_MESSAGING_SERVICE_SID,
            parameters,
          })
        executions.push(execution)
        const updated_doc = { ...doc.doc }
        updated_doc.texted = true
        updated_docs.push(updated_doc)
      }
    }

    const newDoc = {
      _rev: req["sms-burst"].rev,
      _id: req["sms-bd"],
      executions,
    }
    updated_docs.push(newDoc)
    const success = await db.bulk({ docs: updated_docs })
    res.json(success)
  } catch (error) {
    res.status(504).json({
      message: "Error sending messages and writing to DB. Please check twilio logs",
      error,
    })
  }
})

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  let myHandler = await handler(event, context)
  return myHandler
}
