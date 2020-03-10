const renamePorps = require( '../shared/utils/renameProps' )

// app window 和 page 配置项
const APP_WINDOW_NAME_MAP = {
  navigationBarTitleText: 'defaultTitle',
  navigationBarBackgroundColor: 'titleBarColor',
  enablePullDownRefresh: 'pullRefresh'
}

const APP_TAB_BAR_NAME_MAP = {
  color: 'textColor',
  list: 'items'
}

const APP_TAB_BAR_ITEM_NAME_MAP = {
  text: 'name',
  iconPath: 'icon',
  selectedIconPath: 'activeIcon'
}

function convertAppConfig( config = {} ) {
  const converted = Object.assign({}, config);
  const { window, tabBar } = converted
  if (window) {
    converted.window = renamePorps( window, APP_WINDOW_NAME_MAP )
  }
  if (tabBar) {
    converted.tabBar = renamePorps( tabBar, APP_TAB_BAR_NAME_MAP )
    converted.tabBar.items = converted.tabBar.items.map( e => renamePorps( e, APP_TAB_BAR_ITEM_NAME_MAP ) )
  }
  
  return converted
}

function convertPageConfig( config ) {
  const converted = renamePorps( config, APP_WINDOW_NAME_MAP )
  return converted
}

module.exports.convertAppConfig = convertAppConfig
module.exports.convertPageConfig = convertPageConfig