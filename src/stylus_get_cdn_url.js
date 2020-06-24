var config = require('./config').default

module.exports = function () {
  return function (style) {
    var nodes = this.nodes
    return style.define('getCdnUrl', function () {
      return new nodes.Literal(config.CDN_URL)
    })
  }
}
