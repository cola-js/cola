const composePlatformConfig = require( '../../shared/utils/composePlatformConfig' )
const {
  convertAppConfig,
  convertPageConfig
} = require( '../convert-config' )

let appConfig = {}

module.exports = function ( { config = {}, file } ) {
  const _config = composePlatformConfig( config, 'alipay' )
  let converted = {}
  if (file === 'app') {
    converted = appConfig = convertAppConfig( _config )
    // 全局自定义导航栏
    if (converted.window.navigationStyle === 'custom') {
      converted.window.titlePenetrate = 'NO'
      converted.window.transparentTitle = 'none'
    }
    // 兼容 subpakages 字段
    if (converted.subpackages && !converted.subPackages) {
      converted.subPackages = converted.subpackages
      delete converted.subpackages
    }
  } else {
    converted = convertPageConfig( _config )
    // 页面自定义导航栏
    if (
      (appConfig.window.navigationStyle === 'custom' && converted.navigationStyle !== 'default') ||
      converted.navigationStyle === 'custom'
    ) {
      converted.defaultTitle = ''
      converted.titlePenetrate = 'YES'
      if (!converted.transparentTitle) {
        converted.transparentTitle = 'always'
      }
    }
  }
  return JSON.stringify( converted, 0, 2 )
}
