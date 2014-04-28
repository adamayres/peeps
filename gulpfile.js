'use strict';

//require('time-require');

var gulp = require('gulp');
var gutil = require('gulp-util');
var nOpen = require('open');
var clean = require('gulp-rimraf');
var livereload = require('gulp-livereload');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var filelog = require('gulp-filelog');

var lrServer = require('tiny-lr')();
var http = require('http');
var connect = require('connect');
var fs = require('fs');
var Q = require('q');
var fs = require('fs');

var task = gutil.env._[0] || 'default';
var env;
var watched = [];
var isWatch;
var isFilelog = gutil.env.hasOwnProperty('filelog');
var jsHintFile;

function getJsHintFile () {
  return (jsHintFile) ? jsHintFile : (fs.existsSync('.jshintrc') ? '.jshintrc' : undefined);
}

(function setupEnv () {
  if (process.env.NODE_ENV) {
    env = process.env.NODE_ENV;
  } else if (gutil.env.hasOwnProperty('prod')) {
    env = 'prod';
  } else {
    env = 'development';
  }
  process.env.NODE_ENV = env;
})();

isWatch = (task === 'app' || task === 'default') && (env === 'development');

function scriptsTask (params) {
  var gjshint = require('gulp-jshint');
  var stylish = require('jshint-stylish');

  var stream = gulp.src(params.src)
    .pipe(isFilelog ? filelog() : gutil.noop())
    .pipe(params.file ? rename(params.file) : gutil.noop())
    .pipe(plumber())
    .pipe(params.isJsHint ? gjshint(getJsHintFile()) : gutil.noop())
    .pipe(params.isJsHint ? gjshint.reporter(stylish) : gutil.noop())
    .pipe(params.dest ? gulp.dest(params.dest) : gutil.noop())
    .pipe(params.isReload ? livereload(lrServer) : gutil.noop());

  if (params.isReload && isWatch && watched.indexOf(params.src) === -1) {
    watched.push(params.src);
    gulp.watch(params.src, function () {
      scriptsTask(params);
    });
  }

  return stream;
}

function stylesTask (params) {
  var sass = require('gulp-sass');

  var stream = gulp.src(params.src)
    .pipe(sass({
      includePaths: params.paths
    }))
    .pipe(plumber())
    .pipe(params.file ? rename(params.file) : gutil.noop())
    .pipe(params.dest ? gulp.dest(params.dest) : gutil.noop())
    .pipe(isWatch ? livereload(lrServer) : gutil.noop());

  if (params.isReload, isWatch && watched.indexOf(params.src) === -1) {
    watched.push(params.src);
    gulp.watch(params.src, function () {
      stylesTask(params);
    });
  }

  return stream;
}

function fontsTask (src, file, dest, isReload) {
  var stream = gulp.src(src)
    .pipe(file ? rename(file) : gutil.noop())
    .pipe(dest ? gulp.dest(dest) : gutil.noop())
    .pipe(isWatch ? livereload(lrServer) : gutil.noop());

  if (isReload && isWatch && watched.indexOf(src) === -1) {
    watched.push(src);
    gulp.watch(src, function () {
      fontsTask(src, file, dest, isReload);
    });
  }

  return stream;
}

function imagesTask (src, file, dest, isReload, isImagemin) {
  var imagemin = require('gulp-imagemin');

  var stream = gulp.src(src)
    .pipe(isFilelog ? filelog() : gutil.noop())
    .pipe(file ? rename(file) : gutil.noop())
    .pipe(plumber())
    .pipe(isImagemin ? imagemin() : gutil.noop())
    .pipe(dest ? gulp.dest(dest) : gutil.noop())
    .pipe(isWatch ? livereload(lrServer) : gutil.noop());

  if (isReload && isWatch && watched.indexOf(src) === -1) {
    watched.push(src);
    gulp.watch(src, function () {
      imagesTask(src, file, dest, isReload);
    });
  }

  return stream;
}

function htmlTask (params) {
  var ngHtml2Js = require('gulp-angular-templatecache');
  var usemin = require('gulp-usemin');
  var rev = require('gulp-rev');
  var uglify = require('gulp-uglify');
  var ngmin = require('gulp-ngmin');
  var cdnizer = require('gulp-cdnizer');
  var csso = require('gulp-csso');

  var stream = gulp.src(params.src)
    .pipe(params.ngModule ? ngHtml2Js({
      module: params.ngModule,
      standalone: true
    }) : gutil.noop())
    .pipe(params.isCdn ? cdnizer({
      //allowRev: false,
      files: [{
        file: '/bower_components/angular/angular.js',
        package: 'angular',
        cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ major }.${ minor }.${ patch }/angular.min.js'
      },{
        file: '/bower_components/angular-animate/angular-animate.js',
        package: 'angular',
        cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ major }.${ minor }.${ patch }/angular-animate.min.js'
      },{
        file: '/bower_components/angular-route/angular-route.js',
        package: 'angular',
        cdn: '//ajax.googleapis.com/ajax/libs/angularjs/${ major }.${ minor }.${ patch }/angular-route.min.js'
      }, {
        file: '/bower_components/socket.io-client/dist/socket.io.js',
        cdn: '//cdnjs.cloudflare.com/ajax/libs/socket.io/0.9.16/socket.io.min.js'
      }]
    }) : gutil.noop())
    .pipe(params.isUsemin ? usemin({
      assetsDir: __dirname,
      css: [csso(), rev()],
      js: [ngmin(), uglify(), rev()]
    }) : gutil.noop())
    .pipe(params.file ? rename(params.file) : gutil.noop())
    .pipe(params.dest ? gulp.dest(params.dest) : gutil.noop())
    .pipe(isWatch ? livereload(lrServer) : gutil.noop());

  if (params.isReload && isWatch && watched.indexOf(params.src) === -1) {
    watched.push(params.src);
    gulp.watch(params.src, function () {
      htmlTask(params);
    });
  }

  return stream;
}

function testTask (isWatch, coverageReporter) {
  var karma = require('gulp-karma');

  var karmaConfig = {
    configFile: './karma.conf.js',
    action: isWatch ? 'watch' : 'run'
  };

  if (coverageReporter) {
    karmaConfig.coverageReporter = coverageReporter;
  }

  return gulp.src('DO_NOT_MATCH') //use the files in the karma.conf.js
    .pipe(karma(karmaConfig));
}

gulp.task('default', 'prod' === env ? ['app-prod'] : ['app']);

gulp.task('app-prod', ['build', 'bower', 'npm', 'version', 'changelog'], function () {
  var spawn = require('child_process').spawn;

  var child = spawn('sails', ['lift'], {
    cwd: process.cwd()
  });
  var stdout = '';
  var stderr = '';

  child.stdout.setEncoding('utf8');

  child.stdout.on('data', function (data) {
    stdout += data;
    gutil.log(data);
  });

  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function (data) {
    stderr += data;
    gutil.log(gutil.colors.red(data));
    gutil.beep();
  });

  child.on('close', function(code) {
    gutil.log('Done with exit code', code);
    gutil.log('You access complete stdout and stderr from here'); // stdout, stderr
  });
});

gulp.task('app', ['build', 'lr'], function () {
  var nodemon = require('gulp-nodemon');

  var firstTime = true;

  nodemon({ script: 'app.js', ext: 'js', stdout: false, ignore: [
    '.tmp/**/*.*', 'assets/*', 'node_modules/*', 'bower_components/*', 'test-reports/*', 'coverage/*', 'views/*'
  ]})
  .on('stdout', function (msg) {
    if (msg.toString() === '--- APP STARTED ---\n') {
      if (firstTime === true) {
        firstTime = false;
        nOpen('http://localhost:1337');
      } else {
        setTimeout(function () {
          livereload(lrServer).changed('server file');
        }, 100);

      }
    }
    process.stdout.write(msg);
  })
  .on('change', ['jshint-api']);
});

gulp.task('build', ['scripts', 'styles', 'styles-app-watch', 'fonts', 'images', 'favicon', 'robots', 'html',
  'jshint-api']);

gulp.task('clean', ['clean-assets', 'clean-coverage', 'clean-test', 'clean-docs']);

gulp.task('clean-assets', function () {
  return gulp.src('.tmp/assets/**').pipe(clean());
});

gulp.task('clean-coverage', function () {
  return gulp.src('coverage').pipe(clean());
});

gulp.task('clean-test', function () {
  return gulp.src('test-reports').pipe(clean());
});

gulp.task('clean-db', function () {
  return gulp.src('.tmp/disk.db').pipe(clean());
});

gulp.task('clean-docs', function () {
  return gulp.src('docs').pipe(clean());
});

gulp.task('scripts', function () {
  return Q.all([
    // only jshint our core files
    scriptsTask({
      src: ['assets/**/*.js', '!assets/**/deps/*.js'],
      file: undefined,
      dest: '.tmp/assets',
      isJsHint: true,
      isReload: true
    }),
    scriptsTask({
      src: ['!assets/js/*.js', 'assets/**/deps/*.js'],
      file: undefined,
      dest: '.tmp/assets',
      isJsHint: false,
      isReload: true
    })
  ]);
});

gulp.task('jshint', function () {
  return Q.all([
    scriptsTask({
      src: ['assets/**/*.js', '!assets/**/deps/*.js'],
      file: undefined,
      dest: undefined,
      isJsHint: true,
      isReload: false
    }),
    scriptsTask({
      src: 'api/**/*.js',
      file: undefined,
      dest: undefined,
      isJsHint: true,
      isReload: false
    })
  ]);
});

gulp.task('jshint-api', function () {
  return scriptsTask({
    src: 'api/**/*.js',
    file: undefined,
    dest: undefined,
    isJsHint: true,
    isReload: false
  });
});

gulp.task('styles', function () {
  return stylesTask({
    src: './assets/styles/main.scss',
    file: undefined,
    dest: '.tmp/assets/styles',
    paths: ['./assets/styles', './'],
    isReload: false
  });
});

gulp.task('styles-app-watch', function () {
  if (isWatch) {
    gulp.watch('./assets/**/*.scss', ['styles']);
  }
});

gulp.task('fonts', function () {
  return Q.all([
    fontsTask('assets/**/fonts/*.*', undefined, '.tmp/assets', false),
    fontsTask('bower_components/font-awesome/fonts/*.*', undefined, '.tmp/assets/fonts', false)
  ]);
});

gulp.task('images', function () {
  return imagesTask('assets/images/**/*.*', undefined, '.tmp/assets/images/', false, true);
});

gulp.task('favicon', function () {
  return gulp.src('assets/favicon.png').pipe(gulp.dest('.tmp/assets'));
});

gulp.task('robots', function () {
  return gulp.src('assets/robots.txt').pipe(gulp.dest('.tmp/assets'));
});


gulp.task('tpl', function () {
  return htmlTask({
    src: 'assets/**/*.tpl.html',
    file: 'app-tpls.js',
    dest: '.tmp/assets/js',
    isReload: true,
    ngModule: 'li.app.tpls'
  });
});

gulp.task('html', ['tpl', 'styles', 'scripts'], function () {
  return htmlTask({
    src: 'views/main/index.html',
    file: undefined,
    dest: '.tmp/assets/',
    isReload: true,
    isUsemin: env === 'prod',
    isCdn: env === 'prod'
  });
});

gulp.task('lr', function (cb) {
  lrServer.listen(35729, function (err) {
    if (err) {
      return gutil.log(err);
    }
  });
  cb();
});

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

gulp.task('bower', function () {
  var defer = Q.defer();
  var bower = require('bower');

  bower.commands.install([], {}, { directory: './bower_components'})
    .on('log', function(result) {
      gutil.log(['bower', gutil.colors.cyan(result.id), result.message].join(' '));
    })
    .on('end', function () {
      defer.resolve();
    });

  return defer.promise;
});


/**
 * Run the karma spec tests
 */
gulp.task('test', ['html'], function () {
  testTask(gutil.env.hasOwnProperty('watch'));
});

gulp.task('coverage', ['test'], function () {
  fs.readdir('coverage', function (err, files) {
    if (err) {
      gutil.log(err);
    }

    function openPage () {
      nOpen('http://localhost:1338');
    }

    if (files) {
      for (var i = 0; i < files.length; i++) {
        if (fs.lstatSync('coverage/' + files[i]).isDirectory()) {
          var app = connect().use(connect.static('./coverage/' + files[i]));
          http.createServer(app).listen('1338', openPage);
          break;
        }
      }
    }
  });
});

gulp.task('lcov', function () {
  return testTask(false, {
    type : 'lcovonly',
    dir : 'coverage',
    file : 'lcov.info'
  });
});

gulp.task('coveralls', ['lcov'], function () {
  var coveralls = require('gulp-coveralls');

  gulp.src('coverage/**/lcov.info')
    .pipe(coveralls());
});

gulp.task('directive', function (done) {
  var inquirer = require('inquirer');
  var template = require('gulp-template');
  var wrap = require('gulp-wrap');
  var replace = require('gulp-regex-replace');
  var S = require('string');
  var Q = require('q');

  function create (answers, ext) {
    return gulp.src('./tools/scaffold/directive/_directive' + ext)
      .pipe(template(answers))
      .pipe(rename(answers.name + ext))
      .pipe(gulp.dest('./assets/js/directives/' + answers.name));
  }

  function addScript (answers) {
    var script = '<script type="text/javascript" src="/assets/js/directives/' +
      answers.name + '/' + answers.name + '.js"></script>';

    return gulp.src('./views/main/index.html')
      .pipe(replace({
        regex: '<!-- __new_directive_placeholder__ -->',
        replace: script + '\n    <!-- __new_directive_placeholder__ -->'
      }))
      .pipe(gulp.dest('./views/main'));
  }

  function addStyle (answers) {
    var style = '@import "../js/directives/' + answers.name + '/' + answers.name + '.scss";';

    return gulp.src('./assets/styles/main.scss')
      .pipe(wrap('<%= contents %>\n' + style))
      .pipe(gulp.dest('./assets/styles'));
  }

  function addModule (answers) {
    var module = ',\n  \'li.app.directives.' + answers.name + '\'///__new_directive_placeholder__///';

    return gulp.src('./assets/js/app.js')
      .pipe(replace({regex:'///__new_directive_placeholder__///', replace: module}))
      .pipe(gulp.dest('./assets/js'));
  }

  function validate (input) {
    if (input !== input.toLowerCase()) {
      return 'The directive name should not contain upper case letters';
    } else if (input.indexOf('li-') === 0) {
      return 'The directive name should not start with li-, this will be added automatically';
    } else if (input.indexOf(' ') > -1) {
      return 'The directive name should not contain spaces';
    }

    return true;
  }

  inquirer.prompt([
      {type: 'input', name: 'name', message: 'Directive name? (e.g. hello-world):', validate: validate}
    ],
    function (answers) {
      var promises = [];

      answers.camelizedName = S('li-' + answers.name).camelize().s;

      Q.all(
        create(answers, '.js'),
        create(answers, '.tpl.html'),
        create(answers, '.scss'),
        create(answers, '.spec.js'),
        addScript(answers),
        addStyle(answers),
        addModule(answers)
      );

      var path = answers.name + '/' + answers.name;
      Q.all(promises).then(function () {
        gutil.log('');
        gutil.log(gutil.colors.green.bold(answers.camelizedName) + ' directive created!');
        gutil.log('');
        gutil.log('- Use the directive in a template: ' +
          '' + gutil.colors.blue.bold('<li:' + answers.name + '></li:' + answers.name + '>'));
        gutil.log('');
        gutil.log('- The following files have been created');
        gutil.log('  - ' + gutil.colors.magenta('assets/js/directives/' + path + '.js'));
        gutil.log('  - ' + gutil.colors.magenta('assets/js/directives/' + path + '.tpl.html'));
        gutil.log('  - ' + gutil.colors.magenta('assets/js/directives/' + path + '.scss'));
        gutil.log('  - ' + gutil.colors.magenta('assets/js/directives/' + path + '.spec.js'));
        gutil.log('');
        gutil.log('- Details');
        gutil.log('  - Directive module name: ' + gutil.colors.blue.bold('li.app.directives.' + answers.name));
        gutil.log('  - Directive name: ' + gutil.colors.blue.bold(answers.camelizedName));
        gutil.log('');
        gutil.log('- A script tag for the directive has been added to: ' +
          '' + gutil.colors.yellow('views/main/index.html'));
        gutil.log('- An @import to the directive styles has been added to: ' +
          '' + gutil.colors.yellow('assets/styles/main.scss'));
        gutil.log('- The directive module has been added as a dependency to the main Angular app module in: ' +
          '' + gutil.colors.yellow('assets/app.js'));
        gutil.log('');
        done();
      });
    });
});

gulp.task('docs', ['clean-docs', 'doc-styles', 'tpl', 'styles'], function () {
  require('gulp-grunt')(gulp);
  gulp.run('grunt-docs');

});

gulp.task('doc-styles', function () {

  return stylesTask({
    src: 'tools/docs/styles.scss',
    file: undefined,
    dest: '.tmp/assets/docs',
    paths: ['./assets/styles', './'],
    isReload: false
  });
});

gulp.task('docs-server', ['docs'], function () {
  var app = connect()
    .use(connect.static('.tmp/assets/docs'))
    .use(connect.static('.tmp/assets'));
  http.createServer(app).listen('1339', function () {
    nOpen('http://localhost:1339');
  });
});

gulp.task('version', function (cb) {
  var exec = require('child_process').exec;
  var ensureDir = require('ensureDir');
  var template = require('lodash.template');

  function gitExec (cmd) {
    var deferred = Q.defer();
    exec(cmd, function (err, stdout) {
      if (err) {
        console.error(err);
      }
      deferred.resolve(stdout);
    });

    return deferred.promise;
  }

  Q.all([
    gitExec('git rev-parse --abbrev-ref HEAD'),
    gitExec('git log -1 --pretty=format:"%h,%ad,%s,%an"'),
    gitExec('git describe --abbrev=0 --tags')
  ]).then(function (data) {
    var versionTpl = fs.readFileSync('./tools/status/version.tpl.html');
    var logParams = data[1].split(',');
    var params = {
      branch: data[0].replace(/(\n|\r|\r\n)$/, ''),
      timestamp: new Date().toLocaleString(),
      version: data[2],
      commit: {
        hash: logParams[0],
        date: logParams[1],
        comment: logParams[2],
        author: logParams[3]
      }
    };

    var output = template(versionTpl, params);

    ensureDir('.tmp/assets/html/status/', function () {
      fs.writeFile('.tmp/assets/html/status/version.html', output);
    });

  }).done(function (err) {
    cb(err);
    if (err) {
      console.log(err);
    }
  });
});

gulp.task('changelog', function (cb) {
  var changelog = require('conventional-changelog');
  var ensureDir = require('ensureDir');

  var packageJson = require(process.cwd() + '/package.json');
  changelog({
    repository: packageJson.repository.url,
    version: packageJson.version
  }, function(err, log) {
    var marked = require('marked');
    ensureDir('.tmp/assets/html/status/', function () {
      fs.writeFile('.tmp/assets/html/status/changelog.html', marked(log));
    });
  });
  cb();
});

