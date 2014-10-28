'use strict';

var retricon = require('retricon');
var uuid = require('node-uuid');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs-extra'));

var IMAGE_UPLOADS_PATH = 'uploads/images';

/* globals Users, Images */

function ensureUserPopulated (user) {
  if (!user.images) {
    return Users.findOne(user.id).populate('images');
  }
  return Promise.resolve(user);
}

function createFromSrcForUser (src, user) {
  return Images.create({src: src, user: user.id}).then(function (image) {
    return [image, ensureUserPopulated(user)];
  });
}

function createFromFilesForUser (files, user) {
  return Promise.map(files, function (file) {
    var src = file.fd.substring(file.fd.indexOf(IMAGE_UPLOADS_PATH));
    return createFromSrcForUser(src, user);
  });
}

function createImageForUser (user) {
  var basePath = process.cwd() + '/.tmp/';
  var filePath = IMAGE_UPLOADS_PATH + '/' + uuid.v4() + '.png';
  var imageBuffer = retricon(user.id + '', { pixelSize: 150 }).toBuffer();

  return fs.ensureDirAsync(basePath + IMAGE_UPLOADS_PATH).then(function () {
    return fs.writeFileAsync(basePath + filePath, imageBuffer);
  }).then(function () {
    return createFromSrcForUser(filePath, user);
  });
}

module.exports.createFromSrcForUser = createFromSrcForUser;
module.exports.createFromFilesForUser = createFromFilesForUser;
module.exports.createImageForUser = createImageForUser;
