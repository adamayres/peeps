(function () {

  'use strict';

  angular.module('li.app.directives.user', [])
    .directive('liUser', function () {
      return {
        restrict: 'AE',
        scope: {
          user: '='
        },
        templateUrl: 'js/directives/user/user.tpl.html'
      };
    });
})();