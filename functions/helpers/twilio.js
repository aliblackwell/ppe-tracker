const accountSid = process.env.TWILIO_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const twilio = require("twilio")(accountSid, authToken)
const ctxt = require("./inject-context")

const twilioEnvironment =
  ctxt === "production"
    ? ctxt
    : process.env.ENVIRONMENT === "development"
    ? process.env.ENVIRONMENT
    : "staging"

module.exports = { twilio, twilioEnvironment }
