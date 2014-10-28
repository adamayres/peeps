'use strict';

angular.module('li.main.directives.user', [])
  .directive('liUser', function () {
    return {
      restrict: 'AE',
      templateUrl: 'js/directives/user/user.tpl.html',
      scope: {
        user: '='
      },
      link: function ($scope) {
        $scope.inView = false;

        $scope.image = function (inView) {
          if (inView && $scope.user.images.length > 0) {
            return $scope.user.images[$scope.user.images.length-1].src;
          }
        };
      }
    };
  });
