import babel from 'rollup-plugin-babel';
import license from 'rollup-plugin-license';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import { version, name, author } from './package.json';

const banner = `/*!
* ${name} v${version}
*
* Copyright 2018-${new Date().getFullYear()}, ${author}
* Licensed under the MIT license
* http://www.opensource.org/licenses/mit-license
*
*/`;

const { NODE_ENV } = process.env;

const config = {
  input: 'src/index.js',
  output: {
    file: 'dist/tracker.js',
    format: 'umd',
    name: 'Tracker',
  },
  plugins: [
    postcss({ extensions: ['.css'] }),
    nodeResolve(),
    commonjs(),
    json(),
    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**'  // 排除node_modules 下的文件
    }),
    license({ banner }),
  ]
}

if (NODE_ENV === 'production') {
  config.output.file = 'dist/tracker.min.js';
  config.plugins.push(
    terser()
  )
}

export default config;
