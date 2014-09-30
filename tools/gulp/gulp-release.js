'use strict';

var fs = require('fs');
var nOpen = require('open');
var http = require('http');
var connect = require('connect');
var Q = require('q');

module.exports = function (gulp, gutil, options) {

  gulp.task('docs', ['clean-docs', 'doc-styles', 'tpl', 'styles'], function () {
    require('gulp-grunt')(gulp);
    gulp.run('grunt-docs');

  });

  gulp.task('docs-server', ['docs'], function () {
    var app = connect()
      .use(connect.static(options.dir + '/.tmp/assets/docs'))
      .use(connect.static(options.dir + '/.tmp/assets'));
    http.createServer(app).listen('1339', function () {
      nOpen('http://localhost:1339');
    });
  });

  gulp.task('version', function (cb) {
//    var exec = require('child_process').exec;
//    var ensureDir = require('ensureDir');
//    var template = require('lodash.template');
//
//    function gitExec (cmd) {
//      var deferred = Q.defer();
//      exec(cmd, function (err, stdout) {
//        if (err) {
//          console.error(err);
//        }
//        deferred.resolve(stdout);
//      });
//
//      return deferred.promise;
//    }
//
//    Q.all([
//      gitExec('git rev-parse --abbrev-ref HEAD'),
//      gitExec('git log -1 --pretty=format:"%h,%ad,%s,%an"'),
//      gitExec('git describe --abbrev=0 --tags')
//    ]).then(function (data) {
//      var versionTpl = fs.readFileSync(options.dir + '/tools/status/version.tpl.html');
//      var logParams = data[1].split(',');
//      var params = {
//        branch: data[0].replace(/(\n|\r|\r\n)$/, ''),
//        timestamp: new Date().toLocaleString(),
//        version: data[2],
//        commit: {
//          hash: logParams[0],
//          date: logParams[1],
//          comment: logParams[2],
//          author: logParams[3]
//        },
//        affinity: require(options.dir + '/config/locals.js').affinity.urlBase,
//        product: require(options.dir + '/config/locals.js').productCatalog.urlBase
//      };
//
//      var output = template(versionTpl, params);
//
//      ensureDir(options.dir + '/.tmp/assets/html/status/', function () {
//        fs.writeFile(options.dir + '/.tmp/assets/html/status/version.html', output);
//      });
//
//    }).done(function (err) {
//      cb(err);
//      if (err) {
//        console.log(err);
//      }
//    });
  });

  gulp.task('changelog', function (cb) {
    var changelog = require('conventional-changelog');
    var ensureDir = require('ensureDir');
    var packagePath = options.dir + '/package.json';

    if (fs.existsSync(packagePath)) {
      var packageJson = require(packagePath);
      changelog({
        repository: packageJson.repository.url,
        version: packageJson.version
      }, function (err, log) {
        var marked = require('marked');
        ensureDir(options.dir + '/.tmp/assets/html/status/', function () {
          fs.writeFile(options.dir + '/.tmp/assets/html/status/changelog.html', marked(log));
        });
      });
      cb();
    } else {
      gutil.log(gutil.colors.red('Error: When creating changelog, ' +
        'no package.json exists in [' + packagePath + ']'));
      cb();
    }
  });
};