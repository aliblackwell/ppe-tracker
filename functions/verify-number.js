const app = require("./helpers/express")
const serverless = require("serverless-http")
const { twilio } = require("./helpers/twilio")
const upload = require("./helpers/upload")
const { body, validationResult } = require("express-validator")
const { fieldRequired } = require("./helpers/form-validators")

app.post(
  "*",
  [
    upload.none(), // enable req.body.{form[name]} below using multer
    body("verification").not().isEmpty().withMessage("Please enter the code."),
  ],
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) })
    }
    try {
      const verification = await twilio.verify
        .services(process.env.TWILIO_VERIFY_SERVICE)
        .verificationChecks.create({ to: req.body.mobile, code: req.body.verification })

      res.status(200).json({ message: verification.status })
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
