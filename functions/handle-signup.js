const db = require("./helpers/database")
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
    body("signup").not().isEmpty().withMessage("Please provide your consent."),
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
      _id: `signup:${dbId}`,
      email: req.body.email,
      "first-name": req.body["first-name"],
      surname: req.body.surname,
      "marketing-consent": req.body.signup,
    }

    try {
      const success = await db.insert(signup)
      res.json({ message: "success", update: success })
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
