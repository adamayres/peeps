'use strict';

module.exports = function (gulp, gutil) {
  var request = require('request');
  var fs = require('fs');

  gulp.task('populate', ['populate-users', 'populate-images']);

  gulp.task('populate-users', function () {
    return gulp.src('data/users/PEEPS_9_26_2014.csv', { read: false }).pipe(gutil.buffer(function(err, files) {
      files.forEach(function (file) {
        console.log(0);
        request.post({
          url: 'http://localhost:1337/api/users/import',
          formData: {
            file: fs.createReadStream(file.path)
          }
        }, function (error, response, body) {
          if (error) {
            console.log(error);
          }

          console.log(body);
        });
      });
    }));
  });

  function postImage (firstName, lastName, path) {
    if (firstName && lastName) {
      request.post({
        url: 'http://localhost:1337/api/images',
        formData: {
          firstName: firstName,
          lastName: lastName,
          file: fs.createReadStream(path)
        }
      }, function (error, response, body) {
        if (error) {
          console.log(error);
        }

        console.log(body);
      });
    }
  }

  gulp.task('populate-images', ['populate-images-dated', 'populate-images-non-dated']);

  gulp.task('populate-images-dated', ['populate-images-non-dated'], function () {
    return gulp.src('data/images/dated/*.*', { read: false }).pipe(gutil.buffer(function(err, files) {
      if (err) {
        console.log(err);
        return;
      }

      files.forEach(function (file) {
        var path = file.path;
        var fileName = path.substring(path.lastIndexOf('/') + 1);
        var userName = fileName.substring(0, fileName.lastIndexOf('.'));
        var userNameParts = userName.split(' ');
        var firstName;
        var lastName;

        if (userNameParts.length === 3) {
          firstName = userNameParts[1];
          lastName = userNameParts[2];
        } else if (userNameParts.length === 4) {
          firstName = userNameParts[1];
          lastName = userNameParts[3];
        }

        postImage(firstName, lastName, file.path);
      });
    }));
  });

  gulp.task('populate-images-non-dated', function () {
    return gulp.src('data/images/non-dated/*.*', { read: false }).pipe(gutil.buffer(function(err, files) {
      if (err) {
        console.log(err);
        return;
      }

      files.forEach(function (file) {
        var path = file.path;
        var fileName = path.substring(path.lastIndexOf('/') + 1);
        var userName = fileName.substring(0, fileName.lastIndexOf('.'));
        var userNameParts = userName.split(' ');
        var firstName;
        var lastName;

        if (userNameParts.length === 2) {
          firstName = userNameParts[0];
          lastName = userNameParts[1];
        } else if (userNameParts.length === 3) {
          firstName = userNameParts[0];
          lastName = userNameParts[2];
        }

        postImage(firstName, lastName, file.path);
      });
    }));
  });
};
