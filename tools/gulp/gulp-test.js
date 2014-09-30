'use strict';

var nOpen = require('open');
var http = require('http');
var connect = require('connect');
var fs = require('fs');
var q = require('q');

module.exports = function (gulp, gutil, options) {

  function testTask (params) {
    var karma = require('gulp-karma');

    var karmaConfig = {
      configFile: options.dir + '/tests/spec/karma.conf.js',
      action: params.isWatch ? 'watch' : 'run'
    };

    if (params.coverageReporter) {
      karmaConfig.coverageReporter = params.coverageReporter;
    }

    if (params.reporters) {
      karmaConfig.reporters = params.reporters;
    }

    if (params.browsers) {
      karmaConfig.browsers = params.browsers;
    }

    return gulp.src('DO_NOT_MATCH') //use the files in the karma.conf.js
      .pipe(karma(karmaConfig));
  }

  /**
   * Run the karma spec tests
   */
  gulp.task('test', ['scripts', 'scripts-syndicate', 'tpl'], function () {
    testTask({
      isWatch: gutil.env.hasOwnProperty('watch'),
      browsers: gutil.env.hasOwnProperty('browser') ? gutil.env.browser.split(',') : ['PhantomJS']
    });
  });

  gulp.task('coverage', ['build'], function () {

    function getTestFile (path) {
      var testFile = null;

      if (fs.existsSync(path)) {
        var files = fs.readdirSync(path);

        if (files) {
          files.forEach(function (file) {
            if (fs.lstatSync(path + '/' + file).isDirectory()) {
              testFile = file;
            }
          });
        }
      }

      return testFile;
    }

    function openCoverage () {
      var coverageFile = getTestFile(options.dir + '/tests/spec/coverage');

      if (coverageFile !== null) {
        var app = connect();
        app.use(connect.static(options.dir));

        http.createServer(app).listen('1338', function openPage () {
          nOpen('http://localhost:1338/tests/spec/coverage/' + coverageFile);
        });
      }
    }

    var stream = testTask({
      isWatch: gutil.env.hasOwnProperty('watch'),
      reporters: ['progress', 'coverage', 'threshold']
    });

    if (options.isWatch) {
      setTimeout(openCoverage, 5000);
    } else {
      stream.on('end', function () {
        openCoverage();
      });
    }

  });

  gulp.task('lcov', function () {
    return testTask({
      isWatch: gutil.env.hasOwnProperty('watch'),
      coverageReporter: {
        type: 'lcovonly',
        dir: 'tests/spec/lcov',
        file: 'lcov.info'
      }
    });
  });

  gulp.task('coveralls', ['lcov'], function () {
    var coveralls = require('gulp-coveralls');

    gulp.src(options.dir + '/tests/spec/lcov/**/lcov.info')
      .pipe(coveralls());
  });

  gulp.task('jsonlint', function () {
    var jsonlint = require('gulp-jsonlint');

    return gulp.src([options.dir + '/tools/**/*.json', '!' + options.dir + '/tools/test_builder/sandbox/*.json'])
      .pipe(jsonlint())
      .pipe(jsonlint.reporter())
      .pipe(gutil.buffer(function (err, files) {
        files.forEach(function (file) {
          if (file.jsonlint && !file.jsonlint.success) {
            process.exit(1);
          }
        });
      }));
  });

  function reset () {
    var deferred = q.defer();

    var resetOptions = {
      host: 'localhost',
      port: options.devPort,
      path: '/api/reset',
      method: 'GET'
    };

    http.request(resetOptions, function(res) {
      res.setEncoding('utf8');

      var resetData = '';
      res.on('data', function (chunk) {
        resetData += chunk;
      });

      res.on('error', function (err) {
        gutil.log(gutil.colors.red(err.toString()));
      });

      res.on('end', function () {
        var resetResponse = JSON.parse(resetData);

        if (resetResponse.status === 'success') {
          gutil.log(gutil.colors.green('Success: Database Reset'));
          deferred.resolve();
        } else {
          deferred.reject();
        }
      });
    }).end();

    return deferred.promise;
  }

  function upload (contentFile) {
    var uploadOptions = {
      host: 'localhost',
      port: options.devPort,
      path: '/api/upload',
      method: 'POST'
    };

    if (!fs.existsSync(contentFile)) {
      gutil.log(gutil.colors.red('Upload failed, file does not exists: [') +
        gutil.colors.magenta(contentFile) + gutil.colors.red(']'));
    } else {
      var contents = fs.readFileSync(contentFile, {encoding: 'utf-8'});

      var uploadReq = http.request(uploadOptions, function (uploadRes) {
        uploadRes.setEncoding('utf8');

        var uploadData = '';
        uploadRes.on('data', function (chunk) {
          uploadData += chunk;
        });

        uploadRes.on('error', function (err) {
          gutil.log(gutil.colors.red(err.toString()));
        });

        uploadRes.on('end', function () {
          var uploadResponse = JSON.parse(uploadData);

          if (('' + uploadRes.statusCode).match(/^2\d\d$/)) {
            gutil.log(gutil.colors.green('Success: Test Data Upload Complete'));
            if (uploadResponse.idMap) {
              Object.keys(uploadResponse.idMap).forEach(function (model) {
                gutil.log(gutil.colors.green('  [' + model + '] seeded with ' +
                  '[' + Object.keys(uploadResponse.idMap[model]).length + '] records.'));
              });
            }
          } else if (('' + uploadRes.statusCode).match(/^5\d\d$/)) {
            gutil.log(gutil.colors.red('Error uploading seed data, see server logs for more details.'));
          }
        });
      });

      uploadReq.write(contents);
      uploadReq.end();
    }
  }

  gulp.task('test-builder', ['jsonlint'], function () {
    var path = options.dir + '/tools/test_builder/defs/';
    var outputPath = options.dir + '/tools/test_builder/tests/';

    if (!gutil.env.hasOwnProperty('file')) {
      gutil.log(gutil.colors.red('Error: You must specify a --file option.'));
      gutil.log(gutil.colors.red('Example: gulp test-builder --file=simple.json'));
      process.exit(1);
    }
    if (!fs.existsSync(path + gutil.env.file)) {
      gutil.log(gutil.colors.red('Error: Specified file does not exists [' + gutil.env.file + ']. in ' + path));
      process.exit(1);
    }

    require(options.dir + '/tools/test_builder/lib/test_builder_lib').run(path + gutil.env.file, outputPath)
      .then(function (data) {

        function doUpload () {
          if (gutil.env.hasOwnProperty('upload')) {
            upload(data.file);
          }
        }

        if (gutil.env.hasOwnProperty('reset')) {
          reset().then(function () {
            doUpload();
          });
        } else {
          doUpload();
        }

      }).catch(function (err) {
        gutil.log(err.stack);
      });
  });

  gulp.task('smoketest', ['build'], function (next) {
    var path, args, sails, protractor, file;

    path = options.dir + '/tests/*.e2e.js';

    args = [
      '--baseUrl', 'http://localhost:' + options.devPort,
      '--browser', options.browser
    ];

    sails = require('sails');
    protractor = require('gulp-protractor').protractor;

    if (options.chromeOnly === true) {
      args.push('--chromeOnly');
    }

    if (options.debug === true) {
      args.push('debug');
    }

    if (options.file) {
      file = options.dir + '/' + options.file;
      if (!fs.existsSync(file)) {
        gutil.log(gutil.colors.red('File does not exist: ' + file));
        process.exit(1);
      }
      path = file;
    }

    sails.lift({
      log: {
        level: gutil.env.hasOwnProperty('applog') ? gutil.env.applog : 'error'
      }
    }, function () {
      var stream = gulp.src([path])
        .pipe(protractor({
          configFile: options.dir + '/tests/e2e/protractor.config.js',
          args: args
        }));

      stream.on('error', function(e) {
        console.log(e);
        sails.lower(function () {
          next();
          process.exit(1);
        });

      })
      .on('end', function () {
        sails.lower(function () {
          next();
          process.exit(0);
        });
      });
    });
  });
};