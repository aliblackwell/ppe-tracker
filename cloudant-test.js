const Cloudant = require("@cloudant/cloudant")
const cloudant = Cloudant(
  `https://${process.env.CLOUDANT_PARTICIPANTS_READER}:${process.env.PARTICIPANTS_READER_PW}@${process.env.CLOUDANT_HOST}`
)
const db = cloudant.db.use("participants")

db.partitionedList("mobiles", { include_docs: true }).then((partition) => {
  console.log(partition)
  partition.rows.map(record => console.log(record.doc.phone))
})
