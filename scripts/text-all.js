const { getEnglishDateString } = require("../functions/helpers/time")
const dbUser = process.env.LIVE_DB_USER
const dbPw = process.env.LIVE_DB_PW
const dbName = process.env.LIVE_DB_NAME
const Cloudant = require("@cloudant/cloudant")
const dbString = `https://${dbUser}:${dbPw}@${process.env.DB_HOST}`
const cloudant = Cloudant(dbString)
const db = cloudant.db.use(dbName)
const { twilio } = require("../functions/helpers/twilio")

async function textAll() {
  try {
    const englishDateString = getEnglishDateString()
    const docs = await db.partitionedList("user", { include_docs: true })
    for (const doc of docs.rows) {
      if (doc.doc.mobile && doc.doc.readableDate !== englishDateString) {
        // output each document's body

        const parameters = {
          environment: "production",
          firstTime: doc.doc.texted ? "no" : "yes",
        }

        await twilio.studio.v1.flows(process.env.TWILIO_FLOW_ID).executions.create({
          to: doc.doc.mobile,
          from: process.env.TWILIO_MESSAGING_SERVICE_SID,
          parameters,
        })
        if (!doc.doc.texted) {
          const updated_doc = { ...doc.doc }
          updated_doc.texted = true
          await db.insert(updated_doc)
          console.log(`${doc.doc.mobile}: updated`)
        }
        console.log(`${doc.doc.mobile}: messaged`)
        console.log(parameters)
      }
    }
  } catch (error) {
    console.log(error)
  }
}

textAll()
