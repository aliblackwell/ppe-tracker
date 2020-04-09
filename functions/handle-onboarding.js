const db = require("./helpers/database")
const createHash = require("./helpers/crypto")
const app = require("./helpers/express")
const serverless = require("serverless-http")
const upload = require("./helpers/upload")
const twilio = require("./helpers/twilio")
const { body, validationResult, check } = require("express-validator")
const {
  fieldRequired,
  validateAnswer,
  formatMobile,
  gotSpecialty,
  gotGrade,
  gotCare,
} = require("./helpers/form-validators")

app.post(
  "*",
  [
    upload.none(), // enable req.body.{form[name]} below using multer
    body("area-code").not().isEmpty().withMessage("Please select an area code."),
    body("mobile", "We need your mobile to regularly text you the questions.")
      .not()
      .isEmpty()
      .withMessage("We need your mobile to text you the questions.")
      .isLength({ min: 10 })
      .withMessage("This number is not long enough.")
      .not()
      .contains("+")
      .withMessage("Please remove the area code.")
      .custom((phone, { req }) => {
        const mobile = formatMobile(req.body["area-code"], req.body.mobile)
        return twilio.lookups
          .phoneNumbers(mobile)
          .fetch({ type: ["carrier"] })
          .then((data) => {
            console.log(data)
            return Promise.resolve(true)
          })
          .catch((error) => {
            console.log("ERROR")
            console.log(error)
            return Promise.reject("Your number is incorrect.")
          })
      }),
    body("gmc-number")
      .not()
      .isEmpty()
      .withMessage("This field is required")
      .isLength({ min: 7, max: 7 })
      .withMessage("Please enter the correct format."),
    fieldRequired("guidance-read"),
    validateAnswer("answer-one"),
    validateAnswer("answer-two"),
    validateAnswer("answer-three"),
    body("hospital", "Please ensure you choose from the list.")
      .not()
      .isEmpty()
      .withMessage("Please ensure you choose from the list."),

    body("grade", "Please ensure you choose from the list.")
      .not()
      .isEmpty()
      .custom((grade) => gotGrade(grade)),

    body("care", "Please ensure you choose from the list.")
      .not()
      .isEmpty()
      .custom((care) => gotCare(care)),

    body("specialty", "Please ensure you choose from the list.")
      .not()
      .isEmpty()
      .custom((specialty) => gotSpecialty(specialty)),
  ],
  async (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) })
    }
    next()
  }
)
app.post(
  "*",
  [
    check("mobile").custom((phone, { req }) => {
      const mobile = formatMobile(req.body["area-code"], req.body.mobile)
      return twilio.verify
        .services(process.env.TWILIO_VERIFY_SERVICE)
        .verifications.create({ to: mobile, channel: "sms" })
        .then((data) => {
          console.log(data)
          return Promise.resolve(true)
        })
        .catch((error) => {
          console.log("ERROR")
          console.log(error)
          return Promise.reject(error.message)
        })
    }),
  ],
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) })
    }
    const mobile = formatMobile(req.body["area-code"], req.body.mobile)

    const identifibleHash = createHash(mobile, process.env.SALT_ONE)
    const anonymousHash = createHash(mobile, process.env.SALT_TWO)

    const today = new Date()
    const englishDateString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`

    const todayBasedIdentifier = createHash(
      `${englishDateString}-${mobile}`,
      process.env.SALT_THREE
    )

    const user = {
      _id: `user:${identifibleHash}`,
      mobile,
      ["gmc-number"]: req.body["gmc-number"],
    }

    req.body["first-name"] && (user["first-name"] = req.body["first-name"])
    req.body["surname"] && (user["surname"] = req.body["surname"])
    req.body["email"] && (user["email"] = req.body["email"])
    req.body["signup"] && (user["marketing-consent"] = req.body["signup"])

    const answerBlock = {
      _id: `answer:${todayBasedIdentifier}`,
      user: anonymousHash,
      timestamp: Date.now(), // make just day/month/year
      readableDate: englishDateString,
      answerOne: req.body["answer-one"],
      answerTwo: req.body["answer-two"],
      answerThree: req.body["answer-three"],
      hospital: req.body.hospital,
      grade: req.body.grade,
      specialty: req.body.specialty,
    }

    const documents = {
      docs: [user, answerBlock],
    }

    try {
      const success = await db.bulk(documents)
      const response = {
        message: "success",
        mobile,
        update: success,
      }
      res.json(response)
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
