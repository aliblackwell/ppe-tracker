const express = require("express")
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // support encoded bodies

module.exports = app