'use strict';

/* globals lazyload */

angular.module('li.main.directives.lazyload', [])
  .directive('liLazyload', function ($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element, $attrs) {
        $timeout(function () {
          lazyload($element[0], function () {
            $timeout(function () {
              $scope.$eval($attrs.liLazyload);
            });
          });
        });
      }
    };
  });
