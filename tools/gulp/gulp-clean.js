'use strict';

var clean = require('gulp-rimraf');

module.exports = function (gulp, gutil, options) {
  /*
   * Clean tasks
   */
  gulp.task('clean', ['clean-assets', 'clean-coverage', 'clean-test', 'clean-logs']);

  gulp.task('clean-assets', function () {
    return gulp.src(options.dir + '/.tmp/assets/**').pipe(clean());
  });

  gulp.task('clean-coverage', function () {
    return gulp.src(options.dir + 'tests/e2e/spec/coverage').pipe(clean());
  });

  gulp.task('clean-test', function () {
    return gulp.src(options.dir + '/test-reports').pipe(clean());
  });

  gulp.task('clean-db2', function () {
    require('../../api/services/DbService').recreateDb().then(function () {
      gutil.log(gutil.colors.green('Successfully recreated the li_widgets database.'));
    }).catch(function (err) {
      gutil.log(gutil.colors.red(err));
    });
  });

  gulp.task('clean-db', function () {
    var adapters = require(options.dir + '/config/locals').adapters, db = adapters['default'];
      //TODO if env === 'prod', don't let this happen
    if (db === 'mysql') {
      var mysql = require('mysql');
      var connection = mysql.createConnection({
        host: adapters.mysql.host,
        user: adapters.mysql.user,
        password: adapters.mysql.password
      });

      connection.connect();

      connection.query('drop database li_widgets', function(err) {
        if (err) {
          gutil.log(gutil.colors.red(err));
          connection.end();
          process.exit(1);
        }

        gutil.log(gutil.colors.green('Successfully dropped the li_widgets database.'));

        connection.query('create database li_widgets', function(err) {
          if (err) {
            gutil.log(gutil.colors.red(err));
            process.exit(1);
          }

          gutil.log(gutil.colors.green('Successfully created the li_widgets database.'));

        });

        connection.end();
      });
    } else if (db === 'disk') {
      return gulp.src(options.dir + '/.tmp/disk.db').pipe(clean());
    } else {
      gutil.log(gutil.colors.red.bold(db) + ' : clean not supported!');
    }
  });

//gulp.task('clean-docs', function () {
//  return gulp.src(options.dir + '/docs').pipe(clean());
//});

  gulp.task('clean-logs', function () {
    return gulp.src(options.dir + '/.tmp/log').pipe(clean());
  });
};