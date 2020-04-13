const app = require("./helpers/express")
const serverless = require("serverless-http")
const { db } = require("./helpers/database")
app.post("*", async (req, res) => {
  try { 
    const success = await db.insert(req.body)
    res.status(200).json(success)
  } catch (error) {
    return res.status(504).json({ error })
  }
})

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  let myHandler = await handler(event, context)
  return myHandler
}
