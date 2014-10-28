'use strict';

angular.module('li.main.directives.main-nav', [])
  .directive('liMainNav', function () {
    return {
      restrict: 'AE',
      templateUrl: 'js/directives/main-nav/main-nav.tpl.html'
    };
  });
