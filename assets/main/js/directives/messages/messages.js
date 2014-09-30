(function () {

  'use strict';

  angular.module('li.app.directives.messages', ['sails.io'])
    .directive('liMessages', function ($sailsSocket) {
      return {
        restrict: 'AE',
        templateUrl: 'js/directives/messages/messages.tpl.html',
        link: function ($scope) {
          $scope.messages = [];

          function handleErr (err) {
            console.log(err);
          }

          $sailsSocket.get('/api/messages', {
            sort: 'id ASC'
          }).then(function (messages) {
            $scope.messages = messages.data;
          }).catch(handleErr);

          $scope.edit = function (message) {
            $scope.message = message;
          };

          $scope.delete = function (idx, message) {
            $sailsSocket.delete('/api/messages/' + message.id).catch(handleErr);
            $scope.messages.splice(idx, 1);
          };

          $scope.submit = function () {
            if ($scope.message.id) {
              // update a message
              $sailsSocket.put('/api/messages/' + $scope.message.id, $scope.message).catch(handleErr);
            } else {
              // create a message
              $sailsSocket.post('/api/messages', $scope.message).then(function (response) {
                $scope.messages.push(response.data);
              }).catch(handleErr);
            }

            // clear the form after submitting
            $scope.message = {};
            $scope.form.$setPristine();
          };

          $sailsSocket.subscribe('messages', function (event) {
            console.log(event);

            if (event.verb === 'created') {
              $scope.messages.push(event.data);
            } else if (event.verb === 'destroyed') {
              angular.forEach($scope.messages, function (message, idx) {
                if (message.id === parseInt(event.id)) {
                  $scope.messages.splice(idx, 1);
                }
              });
            } else if (event.verb === 'updated') {
              angular.forEach($scope.messages, function (message, idx) {
                if (message.id === parseInt(event.id)) {
                  $scope.messages[idx] = event.data;
                }
              });
            }
          });
        }
      };
    });
})();