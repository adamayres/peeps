'use strict';

var clean = require('gulp-clean');

module.exports = function (gulp, gutil, options) {
  function _clean (src, done) {
    return gulp.src(options.dir + src, { read: false })
      .pipe(clean({ force: true }))
      .on('error', done)
      .on('data', function () {}) // fix end emit, listen the data
      .on('end', function () {});
  }

  /*
   * Clean tasks
   */
  gulp.task('clean', ['clean-assets', 'clean-coverage', 'clean-test', 'clean-logs']);

  gulp.task('clean-assets', function (done) {
    return _clean('/.tmp/assets/**', done);
  });

  gulp.task('clean-uploads', function (done) {
    return _clean('/.tmp/uploads/**', done);
  });

  gulp.task('clean-coverage', function (done) {
    return _clean('tests/e2e/spec/coverage', done);
  });

  gulp.task('clean-test', function (done) {
    return _clean('/test-reports', done);
  });

  gulp.task('clean-db2', function () {
    require('../../api/services/DbService').recreateDb().then(function () {
      gutil.log(gutil.colors.green('Successfully recreated the li_widgets database.'));
    }).catch(function (err) {
      gutil.log(gutil.colors.red(err));
    });
  });

  gulp.task('clean-db', function () {
    var connections = require(options.dir + '/config/connections').connections;
    var connectionName = require(options.dir + '/config/models').models.connection;
    var connection = connections[connectionName];

    if (connection.adapter === 'sails-mysql') {
      var mysql = require('mysql');
      var dbConnection = mysql.createConnection({
        host: connection.host,
        user: connection.user,
        password: connection.password
      });

      dbConnection.connect();

      dbConnection.query('drop database ' + connection.database, function(err) {
        if (err) {
          gutil.log(gutil.colors.red(err));
          dbConnection.end();
          process.exit(1);
        }

        gutil.log(gutil.colors.green('Successfully dropped the ' + connection.database + ' database.'));

        dbConnection.query('create database ' + connection.database, function(err) {
          if (err) {
            gutil.log(gutil.colors.red(err));
            process.exit(1);
          }

          gutil.log(gutil.colors.green('Successfully created the ' + connection.database + ' database.'));

        });

        dbConnection.end();
      });
    } else if (connection.adapter === 'sails-disk') {
      return gulp.src(options.dir + '/.tmp/disk.db').pipe(clean());
    } else {
      gutil.log(gutil.colors.red.bold(connection.adapter) + ' : clean not supported!');
    }
  });

//gulp.task('clean-docs', function () {
//  return gulp.src(options.dir + '/docs').pipe(clean());
//});

  gulp.task('clean-logs', function () {
    return gulp.src(options.dir + '/.tmp/log').pipe(clean());
  });
};
