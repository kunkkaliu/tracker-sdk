import babel from 'rollup-plugin-babel';
import license from 'rollup-plugin-license';
import resolve from 'rollup-plugin-node-resolve';
import json from 'rollup-plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
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

export default [{
    input: 'src/index.js',
    output: [
        {
            file: 'dist/tracker.min.js',
            name: 'Tracker',
            format: 'iife',
            indent: false,
        }
    ],
    plugins: [
        postcss({ extensions: ['.css'] }),
        resolve(),
        commonjs(),
        json(),
        babel({
            runtimeHelpers: true,
            exclude: 'node_modules/**'  // 排除node_modules 下的文件
        }),
        uglify(),
        license({ banner })
    ]
}, {
    input: 'src/index.js',
    output: [
        {
            file: 'lib/index.js',
            format: 'cjs',
            indent: false,
        }, {
            file: 'es/index.js',
            format: 'es',
            indent: false,
        }
    ],
    plugins: [
        postcss({ extensions: ['.css'] }),
        resolve({
          jsnext: true,
        }),
        commonjs(),
        json(),
        babel({
            runtimeHelpers: true,
            exclude: 'node_modules/**'  // 排除node_modules 下的文件
        }),
        license({ banner })
    ]
}]