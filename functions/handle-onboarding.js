const express = require("express")
const serverless = require("serverless-http")

const CONTEXT = require('./helpers/inject-context');

var multer = require("multer") // required for handling FormData objects
var upload = multer()

const dbUser = CONTEXT != 'production' ? process.env.STAGING_DB_USER : process.env.LIVE_DB_USER;
const dbPw = CONTEXT != 'production' ? process.env.STAGING_DB_PW : process.env.LIVE_DB_PW;
const dbName = CONTEXT != 'production' ? process.env.STAGING_DB_NAME : process.env.LIVE_DB_NAME;
const crypto = require("crypto")
const { body, validationResult, check } = require("express-validator")
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // support encoded bodies
const Cloudant = require("@cloudant/cloudant")
const cloudant = Cloudant(
  `https://${dbUser}:${dbPw}@${process.env.DB_HOST}`
)
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

    const timeBaseIdentifier = crypto
      .createHmac("sha256", process.env.SALT_THREE)
      .update(Date.now().toString())
      .digest("hex")

    const mobiles = {
      _id: `mobiles:${identifibleHash}`,
      mobile,
    }

    const user = {
      _id: `user:${anonymousHash}`,
      gender: req.body.gender,
      nationality: req.body.nationality,
      jobTitle: req.body["job-title"],
    }

    const answerBlock = {
      _id: `answers:${timeBaseIdentifier}`,
      user: anonymousHash,
      timestamp: Date.now(), // make just day/month/year
      answerOne: req.body["answer-one"],
      answerTwo: req.body["answer-two"],
      answerThree: req.body["answer-three"],
      hospital: req.body.hospital,
    }

    const documents = {
      docs: [mobiles, user, answerBlock],
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
