(function () {

  'use strict';

  angular.module('li.app.services.messages-manager', ['sails.io', 'li.app.services.authentication-manager'])
    .factory('liMessagesManager', function ($q, $rootScope, sailsSocket, liAuthenticationManager) {
      var MESSAGES_API = '/api/messages';
      var createCbs = [];

      function get (data) {
        return sailsSocket.get(MESSAGES_API, data);
      }

      function post (message) {
        var deferred = $q.defer();

        liAuthenticationManager.getCurrentUser().then(function(currentUser) {
          // this should be done on the server
          message.userId = currentUser.id;

          sailsSocket.post(MESSAGES_API, message).then(function (response) {
            message.id = response.id;
            deferred.resolve(response);
          }, function (response) {
            deferred.reject(response);
          });

          message.user = currentUser;
        });

        return deferred.promise;
      }

      function put (message) {
        return sailsSocket.put(MESSAGES_API, message);
      }

      function _delete (message) {
        return sailsSocket.delete(MESSAGES_API, message);
      }

      function onCreate (cb) {
        createCbs.push(cb);
      }

      sailsSocket.on('message', function(event) {

        if (event.model === 'messages') {
          if (event.verb === 'create') {
            angular.forEach(createCbs, function (cb) {
              cb(event.data);
            });
          }
        }
      });

      return {
        get: get,
        post: post,
        put: put,
        delete: _delete,
        onCreate: onCreate
      };
    });
}());