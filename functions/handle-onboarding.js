const express = require("express")
const serverless = require("serverless-http")

var multer = require("multer") // required for handling FormData objects
var upload = multer()

const { body, validationResult } = require("express-validator")
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // support encoded bodies
const Cloudant = require("@cloudant/cloudant")
const cloudant = Cloudant(
  `https://${process.env.CLOUDANT_PARTICIPANTS_USER}:${process.env.CLOUDANT_PARTICIPANTS_}@${process.env.CLOUDANT_HOST}`
)
const db = cloudant.db.use("participants")

app.post(
  "*",
  [
    upload.none(), // enable req.body.{form[name]} below using multer
    body("email").isEmail().normalizeEmail(),
    body("phone").custom((p, { req }) => (req.body.phone = parseInt(p))) // remove leading zero if present
    
  ],
  (req, res) => {
    console.log(req.body.phone)
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }
    res.json({ message: "success" })
  }
)

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  let myHandler = await handler(event, context)
  return myHandler
}
