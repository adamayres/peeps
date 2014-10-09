'use strict';

var rename = require('gulp-rename');

module.exports = function (gulp, gutil, options) {

  gulp.task('directive', function (done) {
    var inquirer = require('inquirer');
    var template = require('gulp-template');
    var wrap = require('gulp-wrap');
    var replace = require('gulp-replace');
    var S = require('string');
    var Q = require('q');

    function getAdditionalPath (answers) {
      return '/' + answers.type;
    }

    function create (answers, ext) {
      return gulp.src(options.dir + '/tools/scaffold/directive/_directive' + ext)
        .pipe(template(answers))
        .pipe(rename(answers.name + ext))
        .pipe(gulp.dest(options.dir + '/assets/' + getAdditionalPath(answers) + '/js/directives/' + answers.name));
    }

    function addScript (answers) {
      var scr = '\n    <!-- ' + answers.name + ' -->\n    <script type="text/javascript" src="/assets' +
        getAdditionalPath(answers) + '/js/directives/' + answers.name + '/' + answers.name + '.js"></script>';

      return gulp.src(options.dir + '/views' + getAdditionalPath(answers) + '/index.html')
        .pipe(replace('<!-- __new_directive_placeholder__ -->', scr + '\n    <!-- __new_directive_placeholder__ -->'))
        .pipe(gulp.dest(options.dir + '/views' + getAdditionalPath(answers)));
    }

    function addStyle (answers) {
      var style = '@import "../js/directives/' + answers.name + '/' + answers.name + '.scss";';

      return gulp.src(options.dir + '/assets' + getAdditionalPath(answers) + '/styles/main.scss')
        .pipe(wrap('<%= contents %>\n' + style))
        .pipe(gulp.dest(options.dir + '/assets' + getAdditionalPath(answers) + '/styles'));
    }

    function addModule (answers) {
      var mdl = ',\n  \'li.' + answers.type + '.directives.' + answers.name + '\'///__new_directive_placeholder__///';

      return gulp.src(options.dir + '/assets/' + getAdditionalPath(answers) + '/js/app.js')
        .pipe(replace('///__new_directive_placeholder__///', mdl))
        .pipe(gulp.dest(options.dir + '/assets/' + getAdditionalPath(answers) + '/js'));
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
      {
        type: 'input',
        name: 'name',
        message: 'Directive name? (e.g. hello-world):',
        validate: validate
      },
      {
        type: 'list',
        name: 'type',
        message: 'Which app?:',
        choices: ['main'],
        validate: validate
      }
    ], function (answers) {
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

      var magenta = gutil.colors.magenta;

      var path = answers.name + '/' + answers.name;
      Q.all(promises).then(function () {
        gutil.log('');
        gutil.log(gutil.colors.green.bold(answers.camelizedName) + ' directive created!');
        gutil.log('');
        gutil.log('- Use the directive in a template: ' +
          '' + gutil.colors.blue.bold('<li:' + answers.name + '></li:' + answers.name + '>'));
        gutil.log('');
        gutil.log('- The following files have been created');
        gutil.log('  - ' + magenta('assets' + getAdditionalPath(answers) + '/js/directives/' + path + '.js'));
        gutil.log('  - ' + magenta('assets' + getAdditionalPath(answers) + '/js/directives/' + path + '.tpl.html'));
        gutil.log('  - ' + magenta('assets' + getAdditionalPath(answers) + '/js/directives/' + path + '.scss'));
        gutil.log('  - ' + magenta('assets' + getAdditionalPath(answers) + '/js/directives/' + path + '.spec.js'));
        gutil.log('');
        gutil.log('- Details');
        gutil.log('  - Directive module name: ' + gutil.colors.blue.bold('li.' +
          answers.type + '.directives.' + answers.name));
        gutil.log('  - Directive name: ' + gutil.colors.blue.bold(answers.camelizedName));
        gutil.log('');
        gutil.log('- A script tag for the directive has been added to: ' +
          '' + gutil.colors.yellow('views' + getAdditionalPath(answers) + '/main/index.html'));
        gutil.log('- An @import to the directive styles has been added to: ' +
          '' + gutil.colors.yellow('assets' + getAdditionalPath(answers) + '/styles/main.scss'));
        gutil.log('- The directive module has been added as a dependency to the main Angular app module in: ' +
          '' + gutil.colors.yellow('assets' + getAdditionalPath(answers) + '/app.js'));
        gutil.log('');
        done();
      });
    });
  });
};