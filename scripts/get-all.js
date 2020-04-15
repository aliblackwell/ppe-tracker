const dbUser = process.env.STAGING_DB_USER
const dbPw = process.env.STAGING_DB_PW
const dbName = process.env.STAGING_DB_NAME
const Cloudant = require("@cloudant/cloudant")
const dbString = `https://${dbUser}:${dbPw}@${process.env.DB_HOST}`
const cloudant = Cloudant(dbString)
const db = cloudant.db.use(dbName)
const createCsvWriter = require("csv-writer").createObjectCsvWriter
const answerWriter = createCsvWriter({
  path: "answer.csv",
  header: [
    { id: "readableDate", title: "Created: Readable" },
    { id: "answerOne", title: "Answer One" },
    { id: "answerTwo", title: "Answer Two" },
    { id: "answerThree", title: "Answer Three" },
    { id: "hospital", title: "Trust/CCG" },
    { id: "specialty", title: "Specialty" },
    { id: "grade", title: "Grade" },
    { id: "care", title: "Works mostly in" },
    { id: "user", title: "User ID" },
    { id: "timestamp", title: "Created: Timestamp" },
  ],
})

const smsWriter = createCsvWriter({
  path: "sms.csv",
  header: [
    { id: "readableDate", title: "Created: Readable" },
    { id: "answerOne", title: "Answer One" },
    { id: "answerTwo", title: "Answer Two" },
    { id: "answerThree", title: "Answer Three" },
    { id: "user", title: "User ID" },
    { id: "timestamp", title: "Created: Timestamp" },
  ],
})

// db.list({ include_docs: true }).then((body) => {
//   body.rows.forEach((doc) => {
//     // output each document's body
//     console.log(doc.doc)
//   })
// })

// db.partitionedFind("answer", { selector: { specialty: "Allergy" } }).then((body) => {
//   // body.docs.forEach((doc) => {
//   //   // output each document's body
//   //   console.log(doc)
//   // })
//   csvWriter.writeRecords(body.docs).then(() => console.log("The CSV file was written successfully"))
// })

db.partitionedList("answer", { include_docs: true }).then((body) => {
  const docs = body.rows.map((doc) => doc.doc)
  answerWriter
    .writeRecords(docs)
    .then(() => console.log("The Answer file was written successfully"))
})

db.partitionedList("sms", { include_docs: true }).then((body) => {
  const docs = body.rows.map((doc) => doc.doc)
  smsWriter.writeRecords(docs).then(() => console.log("The SMS file was written successfully"))
})
