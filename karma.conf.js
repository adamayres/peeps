'use strict';

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
//    basePath: './',

    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      'bower_components/jquery/dist/jquery.js',
      'bower_components/ng-file-upload/angular-file-upload-html5-shim.js',
      'bower_components/angular/angular.js',
      'bower_components/ng-file-upload/angular-file-upload.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-animate/angular-animate.js',
      'bower_components/angular-elastic/elastic.js',
      'bower_components/matchmedia-ng/matchmedia-ng.js',
      'bower_components/momentjs/moment.js',
      'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
      'bower_components/socket.io-client/dist/socket.io.js',
      'bower_components/highlightjs/highlight.pack.js',
      'bower_components/angular-highlightjs/angular-highlightjs.js',
      'bower_components/script.js/dist/script.js',
      'assets/js/**/*.js',
      '.tmp/assets/js/app-tpls.js'
    ],

    // list of files to exclude
    exclude: [
    ],

    preprocessors: {
      'assets/js/directives/**/!(module|*.demo|*.spec|*.mock).js': 'coverage',
      'assets/js/services/**/!(module|*.demo|*.spec|*.mock).js': 'coverage',
      'assets/js/filters/**/!(module|*.demo|*.spec|*.mock).js': 'coverage'
    },

    // use dots reporter, as travis terminal does not support escaping sequences
    // possible values: 'dots', 'progress'
    // CLI --reporters progress
    reporters: ['junit','progress','coverage','threshold'],

    junitReporter: {
      outputFile: 'test-reports/junit.xml',
      suite: 'li-rnr-app'
    },

    thresholdReporter: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90
    },

    coverageReporter: {
      type : 'html',
      dir : 'coverage/'
    },

    // web server port
    // CLI --port 9876
    port: 8085,

    // enable / disable colors in the output (reporters and logs)
    // CLI --colors --no-colors
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // CLI --log-level debug
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    // CLI --auto-watch --no-auto-watch
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    // CLI --browsers Chrome,Firefox,Safari
    browsers: ['PhantomJS'],

    // If browser does not capture in given timeout [ms], kill it
    // CLI --capture-timeout 5000
    captureTimeout: 20000,

    // Auto run tests on start (when browsers are captured) and exit
    // CLI --single-run --no-single-run
    singleRun: true,

    // report which specs are slower than 500ms
    // CLI --report-slower-than 500
    reportSlowerThan: 500,

    plugins: [
      'karma-jasmine',
      'karma-coverage',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-junit-reporter',
      'karma-threshold-reporter',
      'karma-commonjs',
      'karma-chrome-launcher',
      'karma-spec-reporter',
      'karma-story-reporter',
      'karma-growl-reporter'
    ]
  });
};

