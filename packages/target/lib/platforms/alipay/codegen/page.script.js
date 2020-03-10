const relativeToRoot = require( '../../shared/utils/relativeToRoot' )

const fixGlobalSnippet = `
if (!my.__megalo) {
  my.__megalo = {
    App: App,
  }
}
`

module.exports = function ({ file, files = {}, entryComponent } = {}) {
  const split = files.split.js || []
  const main = files.main.js || []
  let res
  if (!entryComponent.root) {
    res = split
      .concat(main)
      .map(j => `require('${ relativeToRoot( file ) }${ j }')`)
  } else {
    res = split
      .concat(main)
      .filter(pth => pth.includes(entryComponent.root))
      .map(j => `require('${ relativeToRoot( file ) }${ j }')`)
  }

  res.unshift(fixGlobalSnippet)
  return res.join('\n')
}