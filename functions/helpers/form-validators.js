const { body } = require("express-validator")
const specialties = require("../../website/_data/specialties")
const grades = require("../../website/_data/grades")
const hospitals = require("../../website/_data/hospitals")
const cares = require("../../website/_data/cares")
function formatMobile(ac, mobile) {
  areaCode = ac ? ac : 44
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

const gotHospital = (hospital) => hospitals.includes(hospital)
const gotSpecialty = (specialty) => specialties.includes(specialty)
const gotGrade = (grade) => grades.includes(grade)
const gotCare = (care) => cares.includes(care)

module.exports = {
  formatMobile,
  validateAnswer,
  fieldRequired,
  gotSpecialty,
  gotGrade,
  gotHospital,
  gotCare
}
