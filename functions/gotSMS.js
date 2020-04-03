const express = require("express")
const serverless = require("serverless-http")
const app = express()
app.use(express.json())

const MessagingResponse = require('twilio').twiml.MessagingResponse;

app.post("*", (req, res, next) => {
  try {
    const twiml = new MessagingResponse();
    console.log(req.body.toString())

    twiml.message('The Robots are coming! Bread for the mills!!');
  
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
  } catch (err) {
    res.send(err)
  }
})


const handler = serverless(app)
module.exports.handler = async (event, context) => {
  let myHandler = await handler(event, context)
  return myHandler
}
