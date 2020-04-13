const ctxt = require("./inject-context")
const dbUser = ctxt === "production" ? process.env.LIVE_DB_USER : process.env.STAGING_DB_USER
const dbPw = ctxt === "production" ? process.env.LIVE_DB_PW : process.env.STAGING_DB_PW
const dbName = ctxt === "production" ? process.env.LIVE_DB_NAME : process.env.STAGING_DB_NAME
const Cloudant = require("@cloudant/cloudant")
const dbString = `https://${dbUser}:${dbPw}@${process.env.DB_HOST}`
const cloudant = Cloudant(dbString)
const db = cloudant.db.use(dbName)

module.exports = {db}