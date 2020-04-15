const getEnglishDateString = () => {
  const today = new Date()
  return `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
}

const getFileDateString = () => {
  const today = new Date()
  return `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}--${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`
}

module.exports = { getEnglishDateString, getFileDateString }
