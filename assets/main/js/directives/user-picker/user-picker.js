(function () {

  'use strict';

  angular.module('li.app.directives.user-picker', ['li.app.services.authentication-manager'])
    .directive('liUserPicker', function ($log, liAuthenticationManager) {
      return {
        restrict: 'AE',
        templateUrl: 'js/directives/user-picker/user-picker.tpl.html',
        link: function ($scope) {
//          liAuthenticationManager.users().then(function (users) {
//            $scope.users = users;
//          });
//
//          $scope.setPicked = function (user) {
//            liAuthenticationManager.switchUser(user); //this simulates the 'logged in' user
//          };
//
//          $scope.$watch(function () {
//            return liAuthenticationManager.currentUser;
//          }, function (currentUser) {
//            $scope.currenUser = currentUser;
//          }, true);
        }
      };
    });
})();
