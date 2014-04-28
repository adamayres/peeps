'use strict';

angular.module('li.app.services.authentication-manager', ['sails.io'])
  .factory('liAuthenticationManager', ['$q', 'sailsSocket', '$rootScope', '$log',
    function ($q, sailsSocket, $rootScope, $log) {

      var user;
      var users = [];
      var usersOnline = {};
      var cbs = [];

      /*
       * Init list with users server currently knows about, holds the userIds
       */
      function getUsersOnline () {
        if (!usersOnline) {
          usersOnline = [];
          sailsSocket.get('/api/users/usersOnline').then(function (response) {
            usersOnline = response;
          });
        }
      }

      /*
       * Performs constant time check to see if user is online.
       *
       * @returns 'true' if user is online.
       */
      function isUserOnline (userId){
        getUsersOnline();
        return usersOnline.hasOwnProperty(userId);
      }

      function getUsers () {
        if (users.length > 0) {
          return $q.when(users);
        } else {
          var usersDeferred = $q.defer();

          sailsSocket.get('/api/users', {}).then(function (response) {
            users = response;
            usersDeferred.resolve(users);
            $log.debug('sailsSocket::/user', response);
          });

          return usersDeferred.promise;
        }
      }

      function switchUser (setUser) {
        user = setUser;
        sailsSocket.post('/api/users/login', user).then(function(response){
          $log.debug(response);
        });

        angular.forEach(cbs, function (cb) {
          cb(user);
        });
      }

      function getCurrentUser () {
        var currentUserDeferred = $q.defer();
        if (user) {
          return $q.when(user);
        } else {
          getUsers().then(function (users) {
            var id = Math.floor(Math.random() * 6) + 1;
            switchUser(users[id]);
            currentUserDeferred.resolve(user);
          });
        }

        return currentUserDeferred.promise;
      }

      function currentUserCb (cb) {
        cbs.push(cb);
      }

      // seed a default user
      getCurrentUser();

//      /*
//       * Forward the socket events to the scope.
//       */
//      sailsSocket.forward(['userOnlineEvent', 'userOfflineEvent'], $rootScope);

      /*
       * Update usersOnline when we know a user came online.
       */
//      $rootScope.$on('sailsSocket:userOnlineEvent').then(function(event, userId) {
//        if (userId && !usersOnline[userId]){
//          usersOnline[userId] = userId;
//        }
//      });
//
//      /*
//       * Update usersOnline when we know a user went offline
//       */
//      $rootScope.$on('sailsSocket:userOfflineEvent').then(function(event, userId) {
//        if (userId && usersOnline[userId]){
//          delete usersOnline[userId];
//        }
//      });

      return {
        users: getUsers,
        getCurrentUser: getCurrentUser,
        switchUser: switchUser,
        isUserOnline: isUserOnline,
        currentUserCb: currentUserCb
      };
    }]);
