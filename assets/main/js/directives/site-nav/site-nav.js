(function () {

  'use strict';

  angular.module('li.app.directives.site-nav', ['li.app.services.authentication-manager',
    'li.app.services.messages-manager'])
    .directive('liSiteNav', function (liAuthenticationManager, liMessagesManager) {
      return {
        restrict: 'AE',
        templateUrl: 'js/directives/site-nav/site-nav.tpl.html',
        link: function ($scope) {
//          $scope.newMessages = 0;
//
//          liAuthenticationManager.currentUserCb(function (currentUser) {
//            $scope.currentUser = currentUser;
//          });
//
//          liMessagesManager.onCreate(function (message) {
//            if ($scope.currentUser.id !== message.user.id) {
//              $scope.newMessages++;
//              $scope.$digest();
//            }
//          });
        }
      };
    });
})();