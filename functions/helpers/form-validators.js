const { body } = require("express-validator")
function formatMobile(ac, mobile) {
  areaCode = ac ? ac : 44;
  let mobileNoZero = parseInt(mobile)
  let cleanMobile = mobileNoZero.toString().replace(/ /g, "")
  let cleanAc = areaCode.toString().replace(/ /g, "")
  return `${cleanAc}${cleanMobile}`
}

function validateAnswer(answer) {
  return body(answer).not().isEmpty().withMessage("Please answer the question.")
}

function fieldRequired(field) {
  return body(field).not().isEmpty().withMessage("This field is required.")
}

module.exports = { formatMobile, validateAnswer, fieldRequired }