'use strict';

var passport = require('passport');
var connectLr = require('connect-livereload');
var express = require('express');
var modRewrite = require('connect-modrewrite');

module.exports.express = {
  customMiddleware: function (app) {
    if (process.env.NODE_ENV === 'development') {
      app.use(connectLr({
        port: 35729
      }));

      app.use(function(req, res, next) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', 0);
        return next();
      });

      app.use('/.tmp',  express.static('.tmp'));
      app.use('/bower_components', express.static('./bower_components'));
    }

    app.use(express.static('.tmp/data'));

    app.use('/assets',  express.static('.tmp/assets'));
    app.use('/styles',  express.static('.tmp/assets/styles'));
    app.use('/fonts',  express.static('.tmp/assets/fonts'));
    app.use('/js',  express.static('.tmp/assets/js'));

    app.get('/status/version', function(req, res){
      res.sendfile('.tmp/assets/html/status/version.html');
    });

    app.get('/status/changelog', function(req, res){
      res.sendfile('.tmp/assets/html/status/changelog.html');
    });

    app.use(modRewrite([
      '!\\.html|\\.js|\\.css|\\.woff|\\.ttf|\\.png|\\.jpg|\\.gif|\\.svg|\\.json|\\api/(.*)$ / [L]'
    ]));
  }
};