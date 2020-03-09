const path = require('path')
const buble = require('rollup-plugin-buble')
const alias = require('rollup-plugin-alias')
// const cjs = require('rollup-plugin-commonjs')
const replace = require('rollup-plugin-replace')
// const node = require('rollup-plugin-node-resolve')
const flow = require('rollup-plugin-flow-no-whitespace')
const version = process.env.VERSION || require('../package.json').version
const featureFlags = require('./feature-flags')
const vueCoreVersion = '2.6.10'

// const banner =
//   '/*!\n' +
//   ` * Vue.js v${version}\n` +
//   ` * (c) 2014-${new Date().getFullYear()} Evan You\n` +
//   ' * Released under the MIT License.\n' +
//   ' */'

const mpBanner =
`// fix env
try {
  if (!global) global = {};
  global.process = global.process || {};
  global.process.env = global.process.env || {};
  global.App = global.App || App;
  global.Page = global.Page || Page;
  global.Component = global.Component || Component;
  global.getApp = global.getApp || getApp;
} catch (e) {}
`

// const weexFactoryPlugin = {
//   intro () {
//     return 'module.exports = function weexFactory (exports, document) {'
//   },
//   outro () {
//     return '}'
//   }
// }

const aliases = require('./alias')
const resolve = p => {
  const base = p.split('/')[0]
  if (aliases[base]) {
    return path.resolve(aliases[base], p.slice(base.length + 1))
  } else {
    return path.resolve(__dirname, '../', p)
  }
}

const builds = {
  // mp runtime
  'mp-runtime-esm': {
    entry: resolve('mp/entry-runtime.js'),
    dest: resolve('dist/cola.mp.esm.js'),
    format: 'umd',
    env: 'production',
    banner: mpBanner
  },
  // mp compiler (CommonJS)
  'mp-template-compiler': {
    mp: true,
    entry: resolve('mp/entry-compiler.js'),
    dest: resolve('packages/template-compiler/build.js'),
    format: 'cjs',
    external: Object.keys(require('../packages/template-compiler/package.json').dependencies)
  }
}

function genConfig (name) {
  const opts = builds[name]
  const config = {
    input: opts.entry,
    external: opts.external,
    plugins: [
      flow(),
      alias(Object.assign({}, aliases, opts.alias))
    ].concat(opts.plugins || []),
    output: {
      file: opts.dest,
      format: opts.format,
      banner: opts.banner,
      name: opts.moduleName || 'Vue'
    },
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg)
      }
    }
  }

  // built-in vars
  const vars = {
    __VERSION__: vueCoreVersion,
    __COLAJS_VERSION__: version
  }
  // feature flags
  Object.keys(featureFlags).forEach(key => {
    vars[`process.env.${key}`] = featureFlags[key]
  })
  // build-specific env
  if (opts.env) {
    vars['process.env.NODE_ENV'] = JSON.stringify(opts.env)
  }
  config.plugins.push(replace(vars))

  if (opts.transpile !== false) {
    config.plugins.push(buble())
  }

  Object.defineProperty(config, '_name', {
    enumerable: false,
    value: name
  })

  return config
}

if (process.env.TARGET) {
  module.exports = genConfig(process.env.TARGET)
} else {
  exports.getBuild = genConfig
  exports.getAllBuilds = () => Object.keys(builds).map(genConfig)
}
