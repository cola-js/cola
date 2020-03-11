// normalize createColaTarget -> options.compiler
module.exports = function ( compiler ) {
  const normalized = {}

  if ( compiler && compiler.parseComponent && !compiler.vue ) {
    normalized.vue = compiler
  } else {
    if ( compiler && compiler.vue ) {
      normalized.vue = compiler.vue
    } else {
      normalized.vue = require( '@cola-js/template-compiler' )
    }
  }

  return normalized
}
