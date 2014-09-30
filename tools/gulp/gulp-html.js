'use strict';

var rename = require('gulp-rename');
var changed = require('gulp-changed');

module.exports = function (gulp, gutil, watched, options) {

  function htmlTask (params) {
    var ngHtml2Js = require('gulp-angular-templatecache');
    var usemin = require('gulp-usemin');
    var rev = require('gulp-rev');
    var uglify = require('gulp-uglify');
    var ngAnnotate = require('gulp-ng-annotate');
    var cdnizer = require('gulp-cdnizer');
    var csso = require('gulp-csso');

    var stream = gulp.src(params.src)
      .pipe(params.dest && (options.env !== 'qa' && options.env !== 'prod') ? changed(params.dest) : gutil.noop())
      .pipe(params.ngModule ? ngHtml2Js({
        module: params.ngModule,
        standalone: true
      }) : gutil.noop())
      .pipe(params.isCdn ? cdnizer({
        //allowRev: false,
        files: [
          {
            file: '/bower_components/angular/angular.js',
            package: 'angular',
            cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ major }.${ minor }.${ patch }-beta.18/angular.min.js'

          },
          {
            file: '/bower_components/angular-animate/angular-animate.js',
            package: 'angular',
            cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ major }.${ minor }.${ patch }-beta.18/angular-animate.min.js'
          },
          {
            file: '/bower_components/angular-route/angular-route.js',
            package: 'angular',
            cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ major }.${ minor }.${ patch }-beta.18/angular-route.min.js'
          },
          {
            file: '/bower_components/angular-touch/angular-touch.js',
            package: 'angular',
            cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ major }.${ minor }.${ patch }-beta.18/angular-touch.min.js'
          },
          {
            file: '/bower_components/socket.io-client/dist/socket.io.js',
            cdn: '//cdnjs.cloudflare.com/ajax/libs/socket.io/0.9.16/socket.io.min.js'
          }
        ]
      }) : gutil.noop())
      .pipe(params.isUsemin ? usemin({
        assetsDir: options.dir,
        css: [csso(), rev()],
        js: [ngAnnotate(), uglify({mangle:false}), rev()]
      }) : gutil.noop())
      .pipe(params.file ? rename(params.file) : gutil.noop())
      .pipe(params.dest ? gulp.dest(params.dest) : gutil.noop())
      .pipe(params.isReload ? options.livereload(options.lrServer) : gutil.noop());

    if (params.isReload && options.isWatch && watched.indexOf(params.src) === -1) {
      watched.push(params.src);
      gulp.watch(params.src, function () {
        htmlTask(params);
      });
    }

    return stream;
  }

  gulp.task('tpl', function () {
    return options.apps(function (app) {
      return htmlTask({
        src: options.dir + '/assets/' + app + '/**/*.tpl.html',
        file: 'app-tpls.js',
        dest: options.dir + '/.tmp/assets/' + app + '/js/',
        isReload: true,
        ngModule: 'li.' + app + '.tpls'
      });
    });
  });

  gulp.task('html', ['tpl', 'styles', 'scripts'], function () {
    return options.apps(function (app) {
      return htmlTask({
        src: options.dir + '/views/' + app + '/*.html',
        file: undefined,
        dest: options.dir + '/.tmp/assets/' + app + '/',
        isReload: true,
        isUsemin: (options.env === 'prod' || options.env === 'qa'),
        isCdn: (options.env === 'prod' || options.env === 'qa')
      });
    }).then(function () {
      return options.apps(function (app) {
        return [
          gulp.src(options.dir + '/.tmp/assets/' + app + '/assets/' + app + '/js/*.js')
            .pipe(gulp.dest(options.dir + '/.tmp/assets/' + app + '/js')),
          gulp.src(options.dir + '/.tmp/assets/' + app + '/assets/' + app + '/styles/*.css')
            .pipe(gulp.dest(options.dir + '/.tmp/assets/' + app + '/styles'))
        ];
      });
    });
  });
};