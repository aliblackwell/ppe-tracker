const crypto = require("crypto")

const createHash = (input, salt) => crypto.createHmac("sha256", salt).update(input).digest("hex")

module.exports = createHash