'use strict';

/**
 * Main App Module
 */
var app = angular.module('li.main.app', [
  'ngRoute',
  'ngSanitize',
  'ngAnimate',
  'ui.bootstrap',
  'li.main.tpls',
  'li.app.filters.unsafe',
  'li.app.directives.welcome'
  ///__new_directive_placeholder__///
]);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      navId: 'welcome',
      title: 'Welcome',
      template: '<li:welcome></li:welcome>'
    })
    .otherwise({
      navId: 'welcome',
      title: 'Welcome',
      template: '<li:welcome></li:welcome>'
    });

  $locationProvider.html5Mode(true);
});

app.run(function($location, $rootScope) {
  $rootScope.$on('$routeChangeSuccess', function (event, current) {
    $rootScope.title = current.$$route.title;
    $rootScope.navId = current.$$route.navId;
  });
});
