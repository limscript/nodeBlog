function formatDate(date) {
  let year = date.getFullYear()
  let month = date.getMonth() + 1 > 10 ? date.getMonth() : '0' + (date.getMonth() + 1)
  let day = date.getDate() > 10 ? date.getDate() : '0' + date.getDate()
  return `${year}-${month}-${day}`
}

module.exports = formatDate
