'use strict';

/* globals Users, sails */

var Promise = require('bluebird');
var fs = require('fs');
var byline = require('byline');
var extend = require('extend');

var keyMap = {
  'Position ID': 'positionId',
  'Last Name': 'lastName',
  'First Name': 'firstName',
  'Preferred Name': 'preferredName',
  'Job Title Description': 'jobTitle',
  'Hire Date': {
    key: 'hireDate',
    cb: function (val) { return new Date(val); }
  },
  'Work E-mail': 'email',
  'Reports To Name': 'reportsTo',
  'Location Description': 'location',
  'Home Department Description': 'department',
  'E-Staff Member': 'eStaff'
};

function csvToJson (file) {
  var firstRow = true;
  var keyOrder = [];

  return new Promise(function (resolve, reject) {
    var readStream = fs.createReadStream(file, { encoding: 'utf8' });
    var stream = byline(readStream);
    var userImports = [];

    readStream.on('error', function (err) {
      reject(err);
    });

    stream.on('data', function (line) {
      var items = line.split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/);

      if (firstRow) {
        firstRow = false;

        items.forEach(function (item) {
          if (keyMap.hasOwnProperty(item)) {
            keyOrder.push(keyMap[item]);
          }
        });
      } else {
        var userImport = {};

        if (items.length === Object.keys(keyMap).length) {
          keyOrder.forEach(function (key, i) {
            var item = items[i].replace('"', '').trim();

            if (key.hasOwnProperty('key') && key.hasOwnProperty('cb')) {
              userImport[key.key] = key.cb(item);
            } else {
              userImport[key] = item;
            }
          });

          // fix empty emails
          if (userImport.email === '') {
            userImport.email = userImport.firstName.toLowerCase() + '.' +
              userImport.lastName.toLowerCase() + '@lithium.com';
          }

          userImports.push(userImport);
        } else {
          sails.log.warn('Invalid number of items on csv from import', items);
        }
      }
    }).on('end', function () {
      resolve(userImports);
    }).on('error', function (err) {
      reject(err);
    });
  });
}

function importUsers (file) {
  var created = [];
  var updated = [];
  var imports = [];

  return csvToJson(file).map(function (userImport) {
    imports.push(extend({}, userImport));
    return Users.findOneByEmail(userImport.email).then(function (user) {
      return {
        user: user,
        import: userImport
      };
    });
  }).map(function (item) {

    if (item.user) {
      return Users.update(item.user.id, item.import).then(function (user) {
        updated.push(user);
      }).catch(function (err) {
        sails.log.error('Unable to update user', item.user, item.import, err);
        return err;
      });
    } else {
      return Users.create(item.import).then(function (user) {
        created.push(user);
      }).catch(function (err) {
        sails.log.error('Unable to create user', item.import, err);
        return err;
      });
    }
  }).then(function () {
    return {
      created: created,
      updated: updated,
      imports: imports
    };
  });
}

module.exports.import = importUsers;