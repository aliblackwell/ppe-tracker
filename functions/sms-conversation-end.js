const app = require("./helpers/express")
const serverless = require("serverless-http")
const createHash = require("./helpers/crypto")
const { db } = require("./helpers/database")

const formatAnswer = (answer) => (answer.toLowerCase().includes("y") ? "yes" : "no")

app.post("*", async (req, res) => {
  try {
    const mobile = req.body.userMobile
    const answerOne = formatAnswer(req.body.question1)
    const answerTwo = formatAnswer(req.body.question2)
    const answerThree = formatAnswer(req.body.question3)

    const anonymousHash = createHash(mobile, process.env.SALT_TWO)

    const today = new Date()
    const englishDateString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`

    const todayBasedIdentifier = createHash(
      `${englishDateString}-${mobile}`,
      process.env.SALT_THREE
    )

    const dailyResponse = {
      _id: `sms:${todayBasedIdentifier}`,
      user: anonymousHash,
      timestamp: Date.now(), // make just day/month/year
      readableDate: englishDateString,
      answerOne,
      answerTwo,
      answerThree,
    }

    const response = await db.insert(dailyResponse)
    res.status(200).json({ message: response })
  } catch (error) {
    return res.status(504).json({ error })
  }
})

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  let myHandler = await handler(event, context)
  return myHandler
}
