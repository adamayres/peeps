'use strict';

/**
 * Message
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

var util = require('util');

module.exports = {
  attributes: {
    subject: {
      type: 'string',
      required: true
    },
    body: {
      type: 'string',
      required: true
    },
    userId: {
      type: 'integer',
      required: true
    },
    user: function (callback) {
      /* global Users */
      Users.findOne(this.userId, function(err, user) {
        callback(user);
      });
    },
    toJSON: function() {
      var obj = this.toObject();

      this.user(function(user) {
        obj.user = user;
        if (this) {
          delete this.userId;
        }
      });

      return obj;
    }
  },
  beforeValidation: function (values, next) {
    /*
     * Delete empty arrays since sails considers this
     * a validation error even when the attribute is not required.
     */
    Object.keys(values).forEach(function(key) {
      var value = values[key];
      if (util.isArray(value) && value.length === 0) {
        delete values[key];
      }
    });

    next();
  },
  beforeUpdate: function (values, next) {
    // remove values we do not want to update
    delete values.userId;
    next();
  }
};
