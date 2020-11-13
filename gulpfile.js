const gulp = require('gulp');
const babel = require('gulp-babel');

const paths = {
  dest: {
    lib: 'lib',
    es: 'es',
    dist: 'dist',
  },
  styles: 'src/**/*.css',
  scripts: ['src/**/*.{js, jsx}'],
}

function compileScripts(babelEnv, destDir) {
  const { scripts } = paths;
  process.env.BABEL_ENV = babelEnv;
  return gulp
    .src(scripts)
    .pipe(babel())
    .pipe(gulp.dest(destDir));
}

function compileCJS() {
  const { dest } = paths;
  return compileScripts('cjs', dest.lib);
}

function compileES() {
  const { dest } = paths;
  return compileScripts('es', dest.es);
}

function copyCSS() {
  return gulp
    .src(paths.styles)
    .pipe(gulp.dest(paths.dest.lib))
    .pipe(gulp.dest(paths.dest.es))
}

const buildScripts = gulp.series(compileCJS, compileES);
const build = gulp.parallel(buildScripts, copyCSS);
exports.build = build;

exports.default = build;
