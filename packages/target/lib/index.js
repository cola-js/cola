const webpack = require( 'webpack' )
const normalizeCompiler = require( './utils/normalizeCompiler' )

function createColaTarget( options = {} ) {
  options = normalizeOptions( options )

  const { platform = 'wechat', htmlParse } = options

  return function ( compiler ) {
    const FunctionModulePlugin = require( 'webpack/lib/FunctionModulePlugin' )
    const JsonpTemplatePlugin = require( 'webpack/lib/web/JsonpTemplatePlugin' )
    const LoaderTargetPlugin = webpack.LoaderTargetPlugin
    const ColaPlugin = require( './plugins/ColaPlugin' )
    const CopyHtmlparsePlugin = require( './plugins/CopyHtmlparsePlugin' )
    const FrameworkPlugins = [
      require( './frameworks/vue/plugin' )
    ]

    new FunctionModulePlugin().apply( compiler )
    new JsonpTemplatePlugin().apply( compiler )
    new LoaderTargetPlugin( 'mp-' + platform ).apply( compiler )
    new ColaPlugin( options ).apply( compiler )
    FrameworkPlugins.forEach( Plugin => new Plugin( options ).apply( compiler ) )

    if ( !!htmlParse ) {
      new CopyHtmlparsePlugin( { htmlParse, platform } ).apply( compiler )
    }
  }
}

function normalizeOptions( options = {} ) {
  return Object.assign( {}, options, {
    compiler: normalizeCompiler( options.compiler || {} )
  } )
}

module.exports = createColaTarget
