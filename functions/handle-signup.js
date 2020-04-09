const fetch = require("isomorphic-fetch")
const createHash = require("./helpers/crypto")
const app = require("./helpers/express")
const serverless = require("serverless-http")
const upload = require("./helpers/upload")
const { body, validationResult } = require("express-validator")

app.post(
  "*",
  [
    upload.none(), // enable req.body.{form[name]} below using multer
    body("first-name").not().isEmpty().withMessage("This field is required."),
    body("surname").not().isEmpty().withMessage("This field is required."),
    body("email").isEmail().normalizeEmail().withMessage("Please check this is a valid email."),
  ],
  async (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const dbId = createHash(req.body.email, process.env.SALT_ONE)

    const signup = {
      person: {
        identifiers: [`signup:${dbId}`],
        family_name: req.body.surname,
        given_name: req.body["first-name"],
        email_addresses: [{ address: req.body.email }],
      },
    }

    try {
      const anResponse = await fetch("https://actionnetwork.org/api/v2/", {
        headers: {
          "Content-Type": "application/json",
          "OSDI-API-Token": process.env.ACTION_NETWORK_API_KEY,
        },
      })
      const connectionSuccess = await anResponse.json()
      const createPersonLink = connectionSuccess._links["osdi:person_signup_helper"].href
      const signupCreationSuccess = await fetch(createPersonLink, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "OSDI-API-Token": process.env.ACTION_NETWORK_API_KEY,
        },
        body: JSON.stringify(signup), // body data type must match "Content-Type" header
      })
      const success = await signupCreationSuccess.json()
      res.json({ success })
    } catch (error) {
      console.error(error)
      return res.status(504).json({ error })
    }

 
  }
)

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  let myHandler = await handler(event, context)
  return myHandler
}
