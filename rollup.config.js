import { version } from './package.json'
import buble from '@rollup/plugin-buble'

const banner = `/*!
 * vue-link-bus v${version}
 * https://github.com/yangmingshan/vue-bus
 * @license MIT
 */`

export default {
  input: 'src/index.js',
  output: [{
    file: 'dist/vue-link-bus.esm.js',
    format: 'es',
    banner
  }, {
    file: 'dist/vue-link-bus.common.js',
    format: 'cjs',
    banner,
    exports: 'auto'
  }, {
    file: 'dist/vue-link-bus.js',
    format: 'umd',
    name: 'VueLinkBus',
    banner
  }],
  plugins: [buble()]
}
