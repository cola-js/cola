var loaderUtils = require('loader-utils')
var Px2rpx = require('./lib/px2rpx')

module.exports = function (source) {
  var options = loaderUtils.getOptions(this)
  var px2rpxIns = new Px2rpx(options)
  return px2rpxIns.generateRpx(source)
}
