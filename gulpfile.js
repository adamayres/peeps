'use strict';

//require('time-require');

var startTime = process.hrtime();

var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpsync = require('gulp-sync')(gulp);
var nOpen = require('open');

var livereload = require('gulp-livereload');
//var lrServer = require('tiny-lr')();
var prettyTime = require('pretty-hrtime');
var util = require('util');
var Q = require('q');

var task = gutil.env._[0] || 'default';
var watched = [];
var isWatch;
var isFilelog = gutil.env.hasOwnProperty('filelog');
var prodPort = gutil.env.hasOwnProperty('port') ? gutil.env.port : 80;
var devPort = gutil.env.hasOwnProperty('port') ? gutil.env.port : 1337;
var browserParam = gutil.env.hasOwnProperty('browser') ? gutil.env.browser : 'Chrome';
var chromeOnly = gutil.env.hasOwnProperty('chromeOnly') ? true : false;
var debug = gutil.env.hasOwnProperty('debug') ? true : false;
var file = gutil.env.hasOwnProperty('file') ? gutil.env.file : undefined;
var env;

if (process.env.NODE_ENV) {
  env = process.env.NODE_ENV;
} else if (gutil.env.hasOwnProperty('env')) {
  env = gutil.env.env;
} else {
  env = 'development';
}
process.env.NODE_ENV = env;
isWatch = gutil.env.hasOwnProperty('watch') || ((task === 'app' || task === 'default') && (env === 'development'));

var options = {
  isWatch: isWatch,
  isFileLog: isFilelog,
  env: env,
  devPort: devPort,
  dir: __dirname,
  browser: browserParam,
  chromeOnly: chromeOnly,
  debug: debug,
  livereload: livereload,
  //lrServer: lrServer,
  file: file,
  apps: function (cb) {
    var apps = ['main'];
    var promises = [];

    apps.forEach(function (app) {
      var streams = cb(app);

      if (streams) {
        streams = util.isArray(streams) ? streams : [streams];

        streams.forEach(function (stream) {
          var deferred = Q.defer();
          stream.on('finish', function () {
            deferred.resolve();
          });

          stream.on('end', function () {
            deferred.resolve();
          });

          promises.push(deferred.promise);
        });
      }
    });

    return Q.allSettled(promises);
  }
};

if (gutil.env.hasOwnProperty('debug')) {
  var filesObj = {};
  var originalWatch = gulp.watch;

  gulp.watch = function (src) {
    originalWatch(src);
    gulp.src(src).pipe(gutil.buffer(function (err, files) {
      if (files) {
        files.forEach(function (file) {
          if (filesObj.hasOwnProperty(file.path)) {
            gutil.log('Dupe file watcher on path: [' + filesObj[file.path] + '] from src [' + src + ']');
          } else {
            filesObj[file.path] = src;
          }
        });
      }
    }));
  };
}

require('./tools/gulp/gulp-assets')(gulp, gutil, watched, options);
require('./tools/gulp/gulp-clean')(gulp, gutil, options);
require('./tools/gulp/gulp-generators')(gulp, gutil, options);
require('./tools/gulp/gulp-html')(gulp, gutil, watched, options);
require('./tools/gulp/gulp-release')(gulp, gutil, options);
require('./tools/gulp/gulp-scripts')(gulp, gutil, watched, options);
require('./tools/gulp/gulp-styles')(gulp, gutil, watched, options);
require('./tools/gulp/gulp-test')(gulp, gutil, options);

/*
 * Default task will start the app
 */
gulp.task('default', 'prod' === env || 'qa' === env ? ['app-prod'] : ['app', 'build']);
//TODO all of this should come from the <env>.js -- we may need to refactor this after r0

/*
 * Start the app in dev mode
 */
gulp.task('app', function () {
  var nodemon = require('gulp-nodemon');

  var firstTime = true;
  var args = process.argv;

  if (!require('optimist').argv.hasOwnProperty('port')) {
    args.push('--port=' + devPort);
  }

  nodemon({
    script: options.dir + '/app.js',
    args: args,
    ext: 'js',
    watch: [options.dir + '/api/**/*.js', options.dir + '/config/**/*.js'],
    cwd: options.dir,
    ignore: [
        options.dir + '/.tmp/**/*.*', options.dir + '/assets/*', options.dir + '/node_modules/*',
        options.dir + '/bower_components/*', options.dir + '/test-reports/*', options.dir + '/coverage/*',
        options.dir + '/views/*'
    ],
    stdout: false
  })
  .on('stdout', function (message) {
    if (message.toString().indexOf('--- APP STARTED ---') > -1) {

      if (firstTime === true) {
        firstTime = false;

        gutil.log('Sever started after: ' + gutil.colors.green(prettyTime(process.hrtime(startTime))));
        nOpen('http://localhost:' + devPort);
        livereload.listen();
      } else {
        livereload.changed('server file');
      }
    }
    process.stdout.write(message);
  })
  .on('stderr', function (message) {
    process.stderr.write(message);
  })
  .on('change', ['jshint-api']);
});

/*
 * Start the app in prod mode
 */
gulp.task('app-prod', gulpsync.sync(['clean', ['build', 'version', 'changelog']]), function () {
  var forever = require('forever-monitor');

  var child = new (forever.Monitor)('app.js', {
    options: ['--port', prodPort],
    cwd: options.dir
  });

  child.on('exit', function () {
    console.log('The app has exited after trying to restart.');
  });

  child.start();
});

/*
 * Build tasks
 */
gulp.task('build', ['scripts', 'scripts-syndicate', 'styles', 'fonts', 'images', 'favicon', 'robots', 'html',
  'favicon', 'robots'], function () {
  gutil.log('Build time: ' + prettyTime(process.hrtime(startTime)));
});

/*
 * Install npm deps
 */
gulp.task('npm', function (cb) {
  var npm = require('npm');

  npm.load(function (err) {
    if (err) {
      gutil.log(err);
      return;
    }

    npm.commands.install([], function () {
      if (err) {
        gutil.log(err);
      }
      cb();
    });
  });
});

/*
 * Install bower deps
 */
gulp.task('bower', function () {
  var defer = Q.defer();
  var bower = require('bower');

  bower.commands.install([], {}, { directory: options.dir + '/bower_components'})
    .on('log', function(result) {
      gutil.log(['bower', gutil.colors.cyan(result.id), result.message].join(' '));
    })
    .on('end', function () {
      defer.resolve();
    });

  return defer.promise;
});
