/**
 * ImagesController
 *
 * @description :: Server-side logic for managing Images
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';

/* globals Users, ImagesService */

var Promise = require('bluebird');

module.exports = {

  create: function (req, res) {
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var fileStream = req.file('file');
    var upload = Promise.promisify(fileStream.upload, fileStream);

    upload({dirname: 'images'}).then(function (uploadedFiles) {
      return [
        uploadedFiles,
        Users.findOne({
          lastName: { contains: lastName },
          or: [
            { firstName: { contains: firstName } },
            { preferredName: { contains: firstName } }
          ]
        })
      ];
    }).spread(function (uploadedFiles, user) {
      if (!user) {
        console.log('DOES NOT EXIST:', firstName, lastName);
        return {};
      } else {
        return ImagesService.createFromFilesForUser(uploadedFiles, user);
      }
    }).then(function (data) {
      res.ok(data);
    }).catch(function (err) {
      res.json(500, err);
    });
  }
};

