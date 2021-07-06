module.exports = function ( { imports, bodies } ) {
  imports = Array.from(new Set(imports))
  let slotsOutput = imports.map(im => `<import src="${ im }" />`).join(`\n`)
  slotsOutput += `\n`
  slotsOutput += bodies.join(`\n\n`)

  return slotsOutput
}
