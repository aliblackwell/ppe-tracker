const express = require("express")
const serverless = require("serverless-http")

const ctxt = require("./helpers/inject-context")

var multer = require("multer") // required for handling FormData objects
var upload = multer()

const dbUser = ctxt === "production" ? process.env.LIVE_DB_USER : process.env.STAGING_DB_USER
const dbPw = ctxt === "production" ? process.env.LIVE_DB_PW : process.env.STAGING_DB_PW
const dbName = ctxt === "production" ? process.env.LIVE_DB_NAME : process.env.STAGING_DB_NAME
const crypto = require("crypto")
const { body, validationResult, check } = require("express-validator")
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // support encoded bodies
const Cloudant = require("@cloudant/cloudant")
const dbString = `https://${dbUser}:${dbPw}@${process.env.DB_HOST}`
const cloudant = Cloudant(dbString)
const db = cloudant.db.use(dbName)

function formatMobile(ac, mobile) {
  let mobileNoZero = parseInt(mobile)
  let cleanMobile = mobileNoZero.toString().replace(/ /g, "")
  let cleanAc = ac.toString().replace(/ /g, "")
  return `${cleanAc}${cleanMobile}`
}

function validateAnswer(answer) {
  return body(answer).not().isEmpty().withMessage("Please answer the question.")
}

function fieldRequired(field) {
  return body(field).not().isEmpty().withMessage("This field is required.")
}

app.post(
  "*",
  [
    upload.none(), // enable req.body.{form[name]} below using multer
    validateAnswer("answer-one"),
    validateAnswer("answer-two"),
    validateAnswer("answer-three"),
    body("area-code").not().isEmpty().withMessage("Please select an area code."),
    check("mobile", "We need your mobile to regularly text you the questions.")
      .not()
      .isEmpty()
      .withMessage("We need your mobile to text you the questions.")
      .isLength({ min: 10 })
      .withMessage("This number is not long enough.")
      .not()
      .contains("+")
      .withMessage("Please remove the area code."),

    fieldRequired("hospital"),
    fieldRequired("gmc-number"),
    fieldRequired("grade"),
    fieldRequired("guidance-read"),
    fieldRequired("specialty"),
  ],
  async (req, res, next) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array({ onlyFirstError: true }) })
    }

    const mobile = formatMobile(req.body["area-code"], req.body.mobile)

    const identifibleHash = crypto
      .createHmac("sha256", process.env.SALT_ONE)
      .update(mobile)
      .digest("hex")

    const anonymousHash = crypto
      .createHmac("sha256", process.env.SALT_TWO)
      .update(mobile)
      .digest("hex")

    const today = new Date()
    const englishDateString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`

    const todayBasedIdentifier = crypto
      .createHmac("sha256", process.env.SALT_THREE)
      .update(`${englishDateString}-${mobile}`)
      .digest("hex")

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
