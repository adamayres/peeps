'use strict';
/* global sails */

var log = require('winston');
var NodeCache = require('node-cache');

// websocket 'room' for listening to userOnline/Offline events.
var usersOnlineRoomName = 'usersOnline';

// cache to keep track of who is online (this is a poor man's session and should be
// replaced with a real session once we have them).
var usersOnlineCache = new NodeCache({
  stdTTL: 50,
  checkperiod: 10
});

// keep track of what keys the cache might know about, keys in array are not guaranteed to be in
// cache since they may have TTLed.
var possibleKeys = {};

// key is the userId
usersOnlineCache.on('set', function(key){
  possibleKeys[key] = key;
  sails.io.sockets.in(usersOnlineRoomName).emit('userOnlineEvent', key);
});

// key is the userId
usersOnlineCache.on('expired', function(key){
  delete possibleKeys[key];
  sails.io.sockets.in(usersOnlineRoomName).emit('userOfflineEvent', key);
});

module.exports = {
  current: function (req, res) {
    // return one of the 6 random users
    var id = Math.floor(Math.random() * 6) + 1;

    /* global Users */
    Users.findOne(id).done(function (err, val) {
      res.json(val);
    });
  },

  /**
   * Will login the user found on the request
   * @param req
   * @param res
   */
  login: function(req, res){
    Users.findOne(req.body.id).done(function(err, user) {
      // Handle any database errors
      if(err) {
        return res.json({
          result: 'error',
          msg: 'database error'
        });
      }

      // Handle case where parent is not found
      else if(!user) {
        return res.json({
          result: 'error',
          msg: 'user not found'
        });
      }

      usersOnlineCache.set(user.id, user.id, function(err){
        if(err) {
          return res.json({
            result: 'error',
            msg: 'could not load user into cache'
          });
        } else {
          log.debug('user loaded into cache successfully, userID: ' + user.id);
        }
      });

    });
  },

  /**
   * Returns an object where every property is the userId of the users we know are online, for example:
   *
   * {
   *    "2": 2,
   *    "5": 5,
   *    "7": 7
   *  }
   *
   * TODO: this should be using a more efficient datastructure like a bitset (https://www.npmjs.org/package/bitset).
   *
   * @param req
   * @param res
   */
  usersOnline: function(req, res){
    var keysToCheck = [];
    for (var key in possibleKeys){
      if (possibleKeys.hasOwnProperty(key)) {
        keysToCheck.push(key);
      }
    }
    usersOnlineCache.get(keysToCheck, function( err, values){
      if(err) {
        return res.json({
          result: 'error',
          msg: 'error reading cache'
        });
      }
      // subscribe the socket to changes in this list
      req.socket.join(usersOnlineRoomName);
      return res.json(values);
    });
  },

  _config: {}
};
