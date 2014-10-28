/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

'use strict';

/* globals ImagesService */

module.exports = {

  attributes: {
    positionId: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    firstName: {
      type: 'string'
    },
    preferredName: {
      type: 'string'
    },
    jobTitle: {
      type: 'string'
    },
    hireDate: {
      type: 'date'
    },
    email: {
      type: 'email',
      required: true,
      unique: true
    },
    reportsTo: {
      type: 'string'
    },
    location: {
      model: 'Locations'
    },
    department: {
      model: 'Departments'
    },
    eStaff: {
      type: 'string'
    },
    images: {
      collection: 'Images',
      via: 'user'
    },
    avatar: {
      model: 'Images'
    }
  },

  beforeCreate: function (values, cb) {
    if (!values.preferredName || values.preferredName.trim() === '') {
      values.preferredName = values.firstName;
    }

    cb();
  },

  afterCreate: function (user, cb) {
    if (!user.images || user.images.length === 0) {
        return ImagesService.createImageForUser(user).nodeify(cb);
    } else {
      cb();
    }
  }
};

