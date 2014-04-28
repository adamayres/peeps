(function () {

  'use strict';

  angular.module('li.app.directives.messages', ['li.app.services.messages-manager',
    'li.app.services.authentication-manager'])
    .directive('liMessages', function (liMessagesManager, liAuthenticationManager) {
      return {
        restrict: 'AE',
        templateUrl: 'js/directives/messages/messages.tpl.html',
        link: function ($scope) {
          $scope.messages = [];
          $scope.newMessages = 0;

          /*
           * Get the messages
           */
          liMessagesManager.get({
            sort: 'id ASC'
          }).then(function (messages) {
            $scope.messages = messages;
          });

          /*
           * Edit a message
           */
          $scope.edit = function (message) {
            $scope.message = message;
          };

          /*
           * Delete a message
           */
          $scope.delete = function (idx, message) {
            liMessagesManager.delete(message);
            $scope.messages.splice(idx, 1);
          };

          /*
           * Submit the message form
           */
          $scope.submit = function () {
            if ($scope.message.id) {
              // update a message
              liMessagesManager.put($scope.message);
            } else {
              // create a message
              liMessagesManager.post($scope.message);
              $scope.messages.push($scope.message);
            }

            // clear the form after submitting
            $scope.message = {};
            $scope.form.$setPristine();
          };

          liAuthenticationManager.currentUserCb(function (currentUser) {
            $scope.currentUser = currentUser;
          });
        }
      };
    });
})();