/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';

/* globals UsersService */

module.exports = {
  count: require('../blueprints/count'),

  import: function (req, res) {
    req.file('file').upload({dirname: 'users'}, function (err, uploadedFiles) {
      if (err) {
        return res.send(500, err);
      }

      UsersService.import(uploadedFiles[0].fd).then(function (data) {
        res.ok(data);
      }).catch(function (err) {
        res.ok(err);
      });
    });
  }
};

