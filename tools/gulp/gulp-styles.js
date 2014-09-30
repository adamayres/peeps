'use strict';

var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var changed = require('gulp-changed');

module.exports = function (gulp, gutil, watched, options) {
  function stylesTask (params) {
    var sass = require('gulp-sass');

    var stream = gulp.src(params.src)
      .pipe(params.dest && (options.env !== 'qa' || options.env !== 'prod') ? changed(params.dest) : gutil.noop())
      .pipe(sass({
        includePaths: params.paths,
        sourceComments: 'normal'
      }))
      .pipe(plumber())
      .pipe(params.file ? rename(params.file) : gutil.noop())
      .pipe(params.dest ? gulp.dest(params.dest) : gutil.noop())
      .pipe(params.isReload ? options.livereload() : gutil.noop());

    if (params.isReload && options.isWatch && watched.indexOf(params.src) === -1) {
      watched.push(params.src);
      gulp.watch(params.src, function () {
        stylesTask(params);
      });
    }

    return stream;
  }

  gulp.task('styles', function () {
    return options.apps(function (app) {
      return stylesTask({
        src: options.dir + '/assets/' + app + '/styles/main.scss',
        file: undefined,
        dest: options.dir + '/.tmp/assets/' + app + '/styles/',
        paths: [options.dir + '/assets/' + app + '/styles/', options.dir],
        isReload: true,
        isWatch: true
      });
    }).then(function () {
      options.apps(function (app) {
        if (options.isWatch && watched.indexOf(options.dir + '/assets/' + app + '/**/*.scss') === -1) {
          watched.push(options.dir + '/assets/' + app + '/**/*.scss');
          gulp.watch(options.dir + '/assets/' + app + '/**/*.scss', ['styles']);
        }
      });
    });
  });

  // TODO: move to gulp-docs.js
  gulp.task('doc-styles', function () {
    return stylesTask({
      src: options.dir + '/tools/docs/styles.scss',
      file: undefined,
      dest: options.dir + '/.tmp/assets/widgets/docs',
      paths: [options.dir + '/assets/widgets/styles', options.dir],
      isReload: false
    });
  });
};