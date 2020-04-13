const app = require("./helpers/express")
const serverless = require("serverless-http")
const createHash = require("./helpers/crypto")
const { db } = require("./helpers/database")
const { twilio } = require("./helpers/twilio")

app.post(
  "*",
  async (req, res) => {
    try {
      const mobile = req.body.userMobile
      const identifibleHash = createHash(mobile, process.env.SALT_ONE)

      const doc = await db.get(`user:${identifibleHash}`)
      const revision = {
        _id: `user:${identifibleHash}`,
        _rev: doc._rev,
        gmc_number: doc.gmc_number,
        mobile: null
      }

      const response = await db.insert(revision)
      res.status(200).json({ message: response })
    } catch (error) {
      return res.status(504).json({ error })
    }
  }
)

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  let myHandler = await handler(event, context)
  return myHandler
}
