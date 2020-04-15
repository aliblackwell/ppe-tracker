const app = require("./helpers/express")
const serverless = require("serverless-http")
const createCsvStringifier = require("csv-writer").createObjectCsvStringifier
const {getFileDateString} = require("./helpers/time")
const { db } = require("./helpers/database")

const getHeader = (table) => {
  if (table === "answer") {
    return [
      { id: "user", title: "User ID" },
      { id: "timestamp", title: "Created: Timestamp" },
      { id: "readableDate", title: "Created: Readable" },
      { id: "answerOne", title: "AGP Procedures" },
      { id: "answerTwo", title: "Appropriate PPE" },
      { id: "answerThree", title: "Access to Testing" },
      { id: "hospital", title: "Trust/CCG" },
      { id: "specialty", title: "Specialty" },
      { id: "grade", title: "Grade" },
      { id: "care", title: "Works mostly in" },
    ]
  }

  if (table === "sms") {
    return [
      { id: "user", title: "User ID" },
      { id: "timestamp", title: "Created: Timestamp" },
      { id: "readableDate", title: "Created: Readable" },
      { id: "answerOne", title: "AGP Procedures" },
      { id: "answerTwo", title: "Appropriate PPE" },
      { id: "answerThree", title: "Access to Testing" },
    ]
  }
}

app.get("*", async (req, res) => {
  try {
    let table = req.query.table
    if (table === "answer" || table === "sms") {
      const writer = createCsvStringifier({
        header: getHeader(table),
      })
      const body = await db.partitionedList(table, { include_docs: true })
      docs = body.rows.map((doc) => doc.doc)
      const csv = await writer.stringifyRecords(docs)
      res.setHeader("Content-disposition", `attachment; filename=${table}-${getFileDateString()}.csv`)
      res.set("Content-Type", "text/csv")
      let allCsv = writer.getHeaderString()
      allCsv += csv
      res.status(200).send(allCsv)
    } else {
      throw "Invalid query"
    }
  } catch (error) {
    res.send(error)
  }
})

const handler = serverless(app)
module.exports.handler = async (event, context) => {
  let myHandler = await handler(event, context)
  return myHandler
}
