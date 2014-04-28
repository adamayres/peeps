(function () {

  'use strict';

  angular.module('li.app.directives.<%= name %>', [])
    .directive('<%= camelizedName %>', function () {
      return {
        restrict: 'AE',
        templateUrl: 'js/directives/<%= name %>/<%= name %>.tpl.html'
      };
    });
})();