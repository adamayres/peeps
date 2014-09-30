'use strict';

var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var filelog = require('gulp-filelog');
var changed = require('gulp-changed');

module.exports = function (gulp, gutil, watched, options) {

  function fontsTask (src, file, dest, isReload) {
    var stream = gulp.src(src)
      .pipe(dest && (options.env !== 'qa' || options.env !== 'prod') ? changed(dest) : gutil.noop())
      .pipe(file ? rename(file) : gutil.noop())
      .pipe(dest ? gulp.dest(dest) : gutil.noop())
      .pipe(options.isWatch ? options.livereload() : gutil.noop());

    if (isReload && options.isWatch && watched.indexOf(src) === -1) {
      watched.push(src);
      gulp.watch(src, function () {
        fontsTask(src, file, dest, isReload);
      });
    }

    return stream;
  }

  function imagesTask (src, file, dest, isReload, isImagemin) {
    var stream = gulp.src(src)
      .pipe(dest && (options.env !== 'qa' || options.env !== 'prod') ? changed(dest) : gutil.noop())
      .pipe(options.isFilelog ? filelog() : gutil.noop())
      .pipe(file ? rename(file) : gutil.noop())
      .pipe(plumber())
      .pipe(isImagemin ? require('gulp-imagemin')() : gutil.noop())
      .pipe(dest ? gulp.dest(dest) : gutil.noop())
      .pipe(options.isWatch ? options.livereload(options.lrServer) : gutil.noop());

    if (isReload && options.isWatch && watched.indexOf(src) === -1) {
      watched.push(src);
      gulp.watch(src, function () {
        imagesTask(src, file, dest, isReload);
      });
    }

    return stream;
  }

  gulp.task('fonts', function () {
    return options.apps(function (app) {
      return [
        fontsTask(options.dir + '/assets/' + app + '/fonts/*.*', undefined,
            '.tmp/assets/' + app + '/fonts', false),
        fontsTask(options.dir + '/bower_components/font-awesome/fonts/*.*', undefined,
            options.dir + '/.tmp/assets/' + app + '/fonts/', false)
      ];
    });
  });

  gulp.task('images', function () {
    return options.apps(function (app) {
      return imagesTask(options.dir + '/assets/' + app + '/images/**/*.*', undefined,
          options.dir + '/.tmp/assets/' + app + '/images/', false, false);
    });
  });

  gulp.task('images-emoji', function () {
    return imagesTask(options.dir + '/node_modules/emoji-images/pngs/*.png', undefined,
        options.dir + '/.tmp/assets/widgets/images/emoji', false,
      false);
  });

  gulp.task('favicon', function () {
    return gulp.src(options.dir + '/assets/favicon.png').pipe(gulp.dest(options.dir + '/.tmp/assets'));
  });

  gulp.task('robots', function () {
    return gulp.src(options.dir + 'assets/robots.txt').pipe(gulp.dest(options.dir + '/.tmp/assets'));
  });
};