'use strict';

/*
 * Remixed from:
 *
 *   angular-sails.io.js
 *   https://github.com/cgmartin/sailsjs-angularjs-bootstrap-example
 *
 *   angular-socket-io v0.3.0
 *   (c) 2014 Brian Ford http://briantford.com
 *   License: MIT
 *
 *   sails.io.js v0.9.8
 *   (c) 2012-2014 Mike McNeil http://sailsjs.org/
 *   License: MIT
 */

angular.module('sails.io', [])
  .factory('sailsSocket', function($log, $q, $timeout, $rootScope, $http) {
    var optionDefaults = {
      url: '/',
      defaultScope: $rootScope,
      eventPrefix: 'sailsSocket:',
      eventForwards: ['connect', 'message', 'disconnect', 'error'],
      reconnectionAttempts: 10,
      reconnectionDelay: function(attempt) {
        var maxDelay = 10000;
        var bo = ((Math.pow(2, attempt) - 1) / 2);
        var delay = 1000 * bo; // 1 sec x backoff amount
        return Math.min(delay, maxDelay);
      }
    };

    var options = optionDefaults; //TODO(adamayres): angular.extend({}, optionDefaults, {});
    var canReconnect = true;
    var disconnectRetryTimer = null;
    var ioSocket;

    function request (url, data, method) {
      var deferred = $q.defer();

      var usage = 'Usage:\n socket.' +
        (method || 'request') +
        '( destinationURL, dataToSend, fnToCallWhenComplete )';

      // Remove trailing slashes and spaces
      url = url.replace(/^(.+)\/*\s*$/, '$1');

      // If method is undefined, use 'get'
      method = method || 'get';

      if (typeof url !== 'string') {
        throw new Error('Invalid or missing URL!\n' + usage);
      }

      // Build to request
      var json = angular.toJson({
        url: url,
        data: data
      });

      // Send the message over the socket
      emit(method, json).then(function afterEmitted (result) {
        var parsedResult = result;

        if (result && typeof result === 'string') {
          try {
            parsedResult = angular.fromJson(result);
            deferred.resolve(parsedResult);
          } catch (e) {
            $log.warn('Could not parse:', result, e);
            parsedResult = { error: { message: 'Bad response from server' }};
            deferred.reject(parsedResult);
          }
        }
      });

      return deferred.promise;
    }

    function get (url, data) {
      return request(url, data, 'get');
    }

    function post (url, data) {
      return request(url, data, 'post');
    }

    function put (url, data) {
      return request(url, data, 'put');
    }

    function _delete (url, data) {
      return request(url, data, 'delete');
    }

    function emit (eventName, data) {
      var deferred = $q.defer();
      ioSocket.emit(eventName, data, deferred.resolve);
      return deferred.promise;
    }

    function addSocketListener (eventName, cb) {
      return ioSocket.on(eventName, cb);
    }

    function removeSocketListener (eventName, cb) {
      return ioSocket.removeListener(eventName, cb);
    }

    function onConnect () {
      $log.debug('SailsSocket::connected');
    }

    // *disconnect* occurs after a connection has been made.
    function onDisconnect () {
      $log.warn('SailsSocket::disconnected');
      var attempts = 0;
      var retry = function() {
        if (!canReconnect) {
          return;
        }

        disconnectRetryTimer = $timeout(function() {
          // Make http request before socket connect, to ensure auth/session cookie
          $log.info('SailsSocket::retrying... ', attempts);
          $http.get(options.url).success(function() {
            ioSocket.socket.connect();
          }).error(function() {
            if (attempts < options.reconnectionAttempts) {
              retry();
            } else {
              // send failure event
              $log.error('SailsSocket::failure');
              $rootScope.$broadcast(options.eventPrefix + 'failure');
            }
          });
        }, options.reconnectionDelay(attempts++));
      };

      if (attempts < options.reconnectionAttempts) {
        retry();
      }
    }

    // *error* occurs when the initial connection fails.
    function onError () {
      $timeout(function() {
        $log.error('SailsSocket::failure');
        $rootScope.$broadcast(options.eventPrefix + 'failure');
      }, 0);
    }

    function addRetryListeners () {
      addSocketListener('disconnect', onDisconnect);
      addSocketListener('error', onError);
      addSocketListener('connect', onConnect);
    }

    function removeRetryListeners () {
      removeSocketListener('disconnect', onDisconnect);
      removeSocketListener('error', onError);
      removeSocketListener('connect', onConnect);
    }

    function disconnect () {
      canReconnect = false;
      $timeout.cancel(disconnectRetryTimer);
      removeRetryListeners();
      ioSocket.disconnect();
    }

    function connect (url) {
      if (ioSocket) {
        disconnect();
      }

      /* globals io */
      ioSocket = io.connect(url || options.url, { reconnect: false });
      canReconnect = true;
      addRetryListeners();

      return ioSocket;
    }

    ioSocket = connect();

    return {
      request: request,
      get: get,
      post: post,
      put: put,
      delete: _delete,
      emit: emit,
      on: addSocketListener,
      off: removeSocketListener,
      connect: connect,
      disconnect: disconnect
    };
  });