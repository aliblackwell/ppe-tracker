const express = require("express")
const serverless = require("serverless-http")
const app = express()
app.use(express.json())

const accountSid = process.env.TWILIO_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const client = require("twilio")(accountSid, authToken)

// TODO before launch update env variables in here to production
const dbUser = process.env.PRODUCTION_HOST ? process.env.STAGING_CLOUDANT_USER : process.env.STAGING_CLOUDANT_USER;
const dbPw = process.env.PRODUCTION_HOST ? process.env.STAGING_CLOUDANT_PW : process.env.STAGING_CLOUDANT_PW;
const dbUrl = process.env.DB_HOST;
const dbName = process.env.PRODUCTION_HOST ? 'ed-staging' : 'ed-live';

const Cloudant = require("@cloudant/cloudant")
const cloudant = Cloudant(
  `https://${dbUser}:${dbPw}@${dbUrl}`
)
const db = cloudant.db.use(dbName)

app.get("*", (req, res, next) => {
  db.partitionedList("mobiles", { include_docs: true })
    .then((partition) => {
      Promise.all(
        partition.rows.map((row) => {
          return client.messages.create({
            to: row.doc.phone,
            from: process.env.TWILIO_MESSAGING_SERVICE_SID,
            body: "Hey sexy datababe. tb xxx",
          })
        })
      )
        .then((messages) => {
          res.send(`success! message sid: ${messages}`)
        })
        .catch((err) => {
          console.error(err)
          res.send(err)
        })
    })
    .catch((err) => {
      res.send(err)
    })
})

app.post("*", (req, res, next) => {
  try {
    LogEvent(req, res)
  } catch (err) {
    res.send(err)
  }
})

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  let myHandler = await handler(event, context)
  return myHandler
}
