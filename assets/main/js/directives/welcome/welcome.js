(function () {

  'use strict';

  angular.module('li.app.directives.welcome', [])
    .directive('liWelcome', function () {
      return {
        restrict: 'AE',
        templateUrl: 'js/directives/welcome/welcome.tpl.html'
      };
    });
})();