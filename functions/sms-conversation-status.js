const app = require("./helpers/express")
const serverless = require("serverless-http") 
app.post("*", async (req, res) => {
  try { 
 
    res.status(200).json({message: "success"})
  } catch (error) {
    return res.status(504).json({ error })
  }
})

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  let myHandler = await handler(event, context)
  return myHandler
}
