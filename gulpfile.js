const gulp = require('gulp');
const babel = require('gulp-babel');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const through2 = require('through2');
const concat = require('gulp-concat');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');

const paths = {
  dest: {
    lib: 'lib',
    es: 'es',
    dist: 'dist',
  },
  styles: 'src/**/*.less',
  scripts: ['src/**/*.{js, jsx}'],
}

/**
 * 当前组件样式 import './index.less' => import './index.css'
 * 依赖的其他组件样式 import '../test-comp/style' => import '../test-comp/style/css.js'
 * 依赖的其他组件样式 import '../test-comp/style/index.js' => import '../test-comp/style/css.js'
 * @param {string} content
 */
function cssInjection(content) {
  return content
    .replace(/\/style\/?'/g, '/style/css\'')
    .replace(/\/style\/?"/g, '/style/css"')
    .replace(/\.less/g, '.css');
}

/**
 * 编译脚本文件
 * @param {*} babelEnv babel环境变量
 * @param {*} destDir 目标目录
 */
function compileScripts(babelEnv, destDir) {
  const { scripts } = paths;
  process.env.BABEL_ENV = babelEnv;
  return gulp
    .src(scripts)
    .pipe(babel())
    .pipe(
      through2.obj(function z(file, encoding, next) {
        this.push(file.clone());
        // 找到目标
        if (file.path.match(/(\/|\\)style(\/|\\)index\.js/)) {
          const content = file.contents.toString(encoding);
          file.contents = Buffer.from(cssInjection(content)); // 文件内容处理
          file.path = file.path.replace(/index\.js/, 'css.js'); // 文件重命名
          this.push(file); // 新增该文件
          next();
        } else {
          next();
        }
      }),
    )
    .pipe(gulp.dest(destDir));
}

/**
 * 编译cjs
 */
function compileCJS() {
  const { dest } = paths;
  return compileScripts('cjs', dest.lib);
}

/**
 * 编译esm
 */
function compileES() {
  const { dest } = paths;
  return compileScripts('es', dest.es);
}

/**
 * 拷贝less文件
 */
function copyLESS() {
  return gulp
    .src(paths.styles)
    .pipe(gulp.dest(paths.dest.lib))
    .pipe(gulp.dest(paths.dest.es));
}

/**
 * 生成css文件
 */
function less2css() {
  return gulp
    .src(paths.styles)
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(gulp.dest(paths.dest.lib))
    .pipe(gulp.dest(paths.dest.es))
    .pipe(concat('tracker.css'))
    .pipe(gulp.dest(paths.dest.dist))
    .pipe(cssnano())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(paths.dest.dist));
}

const buildScripts = gulp.series(compileCJS, compileES);
const build = gulp.parallel(buildScripts, copyLESS, less2css);
exports.build = build;

exports.default = build;
