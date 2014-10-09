/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  identity: 'Users',

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
      type: 'string'
    },
    department: {
      type: 'string'
    },
    eStaff: {
      type: 'string'
    }
  }
};

