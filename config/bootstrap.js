'use strict';

/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

var async = require('async');
var fs = require('fs');
var Q = require('q');

/* global User, sails */
module.exports.bootstrap = function (cb) {
  // It's very important to trigger this callack method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  //cb();

  process.stdout.write('--- APP STARTED ---\n');

  sails.log.error('HELLO');

  // ********************************************
  // Create Seed Data
  // ********************************************
  function createItems(modelName) {
    var Model = sails.config.hooks.orm && sails.models[modelName.toLowerCase()];
    var items;
    var file;
    var deferred = Q.defer();

    try {
      file = __dirname + '/seed/' + modelName + '.json';
      items = JSON.parse(fs.readFileSync(__dirname + '/seed/' + modelName + '.json'));
    } catch (e) {
      sails.log.error('Error when parsing the db seed file [%s]', file, e);
    }

    if (Model && items) {
      Model.count().exec(function(err, count) {

        if (err) {
          deferred.reject(new Error(err));
        } else if (count > 0) {
          deferred.resolve();
        } else {
          Model.create(items).exec(function (err, response) {
            if (err) {
              deferred.reject({
                msg: err,
                modelName: modelName,
                file: file
              });
            } else {
              sails.log.info('Seeded %s item(s) for the [%s] model', items.length, modelName);
              deferred.resolve(response);
            }
          });
        }
      });
    }
    return deferred.promise;
  }

  function seedDb (done) {
    var seeds = fs.readdirSync(__dirname + '/seed');
    var deferreds = [];

    for (var i = 0; i < seeds.length; i++) {
      var seed = seeds[i];
      var idx = seed.indexOf('.json');
      if (idx > 0) {
        var modelName = seed.substring(0, idx);
        deferreds.push(createItems(modelName));
      }
    }
    Q.all(deferreds).then(function () {
      done();
    }, function (error) {
      sails.log.error('Invalid seed for [%s] in [%s].', error.modelName, error.file, error.msg);
      done();
    });
  }

  // ********************************************
  // Bootstrap Passport Middleware
  // Credit:
  // @theangryangel https://gist.github.com/theangryangel/5060446
  // @Mantish https://gist.github.com/Mantish/6366642
  // @anhnt https://gist.github.com/anhnt/8297229
  // @adityamukho https://gist.github.com/adityamukho/6260759
  // ********************************************
  function boostrapPassportMiddleware(done) {

    var passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy;

    // Passport session setup.
    // To support persistent login sessions, Passport needs to be able to
    // serialize users into and deserialize users out of the session. Typically,
    // this will be as simple as storing the user ID when serializing, and finding
    // the user by ID when deserializing.
    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      User.findOne(id).done(function (err, user) {
        done(err, user);
      });
    });


    // Use the LocalStrategy within Passport.
    // Strategies in passport require a `verify` function, which accept
    // credentials (in this case, a username and password), and invoke a callback
    // with a user object. In the real world, this would query a database;
    // however, in this example we are using a baked-in set of users.
    passport.use(new LocalStrategy(
      function(username, password, done) {
        // Find the user by username. If there is no user with the given
        // username, or the password is not correct, set the user to `false` to
        // indicate failure and set a flash message. Otherwise, return the
        // authenticated `user`.
        User.findOneByUsername(username).done(function(err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
          user.validPassword(password, function(err, res) {
            if (err) { return done(err); }
            if (!res) { return done(null, false, { message: 'Invalid password' }); }
            done(null, user);
          });
        });
      }
    ));

    done();
  }

  //
  // Bootstrap
  //
  async.parallel([
    seedDb,
    boostrapPassportMiddleware
  ], cb);

};