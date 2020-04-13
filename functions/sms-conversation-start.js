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
    const burstIdentifier = `tmailshot:${todayBasedIdentifier}`

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
    //next()
    return res.status(504).json({ error: "Already sent today" })
  }
})

app.get("*", async (req, res) => {
  const docs = await db.partitionedList("user", { include_docs: true })
  const executions = []
  for (const doc of docs.rows) {
    // output each document's body
    if (doc.doc.mobile && doc.doc.readableDate !== englishDateString) {
      const execution = await twilio.studio.v1.flows(process.env.TWILIO_FLOW_ID).executions.create({
        to: doc.doc.mobile,
        from: process.env.TWILIO_MESSAGING_SERVICE_SID,
        parameters: {
          environment: twilioEnvironment,
        },
      })
      executions.push(execution)
    }
  }

  const newDoc = {
    _rev: req["sms-burst"].rev,
    _id: req["sms-bd"],
    executions,
  }
  const success = await db.insert(newDoc)

  res.json(success)
})

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  let myHandler = await handler(event, context)
  return myHandler
}
