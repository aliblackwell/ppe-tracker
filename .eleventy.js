module.exports = function (config) {
  // pass some assets right through
  config.addPassthroughCopy("./website/css")
  config.addPassthroughCopy("./website/img")
  config.addPassthroughCopy("./website/js")
  config.addPassthroughCopy("./website/_redirects")
  config.addPassthroughCopy("./website/humans.txt")
  config.addPassthroughCopy("./website/favicon.png")
  config.addFilter("orderAscending", function (value) {
    value.sort(function (a, b) {
      let first = a.dial_code && parseInt(a.dial_code.split('+')[1])
      let second = b.dial_code && parseInt(b.dial_code.split('+')[1])
      return first < second ? -1 : 1
    })
    return value
  })
  return {
    dir: {
      input: "website",
      output: "ship-site",
    },
  }
}
