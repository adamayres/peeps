'use strict';

var fs = require('fs');
var filelog = require('gulp-filelog');
//var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var changed = require('gulp-changed');
var concat = require('gulp-concat');
var jsHintFile;

module.exports = function (gulp, gutil, watched, options) {
  function getJsHintFile () {
    if (jsHintFile) {
      return jsHintFile;
    } else if (fs.existsSync('.jshintrc')) {
      jsHintFile = '.jshintrc';
      return jsHintFile;
    }
  }

  function scriptsTask (params) {
    var gjshint = require('gulp-jshint');
    var stylish = require('jshint-stylish');

    var stream = gulp.src(params.src)
      .pipe(options.isFilelog ? filelog() : gutil.noop())
      .pipe(params.dest && (options.env !== 'qa' || options.env !== 'prod') ? changed(params.dest) : gutil.noop())
      .pipe(params.file ? concat(params.file) : gutil.noop())
      .pipe(plumber())
      .pipe(params.isJsHint ? gjshint(getJsHintFile()) : gutil.noop())
      .pipe(params.isJsHint ? gjshint.reporter(stylish) : gutil.noop())
      .pipe(params.dest ? gulp.dest(params.dest) : gutil.noop())
      .pipe(params.isReload ? options.livereload() : gutil.noop());

    if (params.isReload && options.isWatch && watched.indexOf(params.src) === -1) {
      watched.push(params.src);
      gulp.watch(params.src, function () {
        scriptsTask(params);
      });
    }

    return stream;
  }

  gulp.task('scripts', function () {
    return options.apps(function (app) {
      return scriptsTask({
        src: options.dir + '/assets/' + app + '/**/*.js',
        file: undefined,
        dest: options.dir + '/.tmp/assets/' + app,
        isJsHint: true,
        isReload: true
      });
    });
  });

  gulp.task('jshint', ['jshint-app', 'jshint-api']);

  gulp.task('jshint-app', function () {
    scriptsTask({
      src: [options.dir + '/assets/**/*.js'],
      file: undefined,
      dest: undefined,
      isJsHint: true,
      isReload: false
    });
  });

  gulp.task('scripts-syndicate', function () {
    scriptsTask({
      src: [
        // ORDER MATTERS!
        options.dir + '/bower_components/iframe-resizer/src/iframeResizer.js',
        options.dir + '/assets/syndicate/js/namespace-syndicate.js',
        options.dir + '/assets/syndicate/js/utils-syndicate.js',
        options.dir + '/assets/syndicate/js/iframe-syndicate.js',
        options.dir + '/assets/syndicate/js/!(main|namespace|utils|iframe).js',
        options.dir + '/assets/syndicate/js/main-syndicate.js'
      ],
      file: 'syndicate.js',
      // TODO(adamayres): hold over to support legacy location
      dest: '.tmp/assets/widgets/js/scripts',
      isJsHint: false,
      isReload: true
    });
  });

  gulp.task('jshint-api', function () {
    return scriptsTask({
      src: options.dir + '/api/**/*.js',
      file: undefined,
      dest: undefined,
      isJsHint: true,
      isReload: false
    });
  });
};