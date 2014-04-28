'use strict';

/**
 * Main App Module
 */
var app = angular.module('li.app', [
  'ngRoute',
  'ngSanitize',
  'ngAnimate',
  'ui.bootstrap',
  'li.app.tpls',
  'li.app.filters.unsafe',
  'li.app.directives.welcome',
  'li.app.directives.site-nav',
  'li.app.directives.messages',
  'li.app.directives.user-picker',
  'li.app.directives.user'///__new_directive_placeholder__///
]);

app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      navId: 'welcome',
      title: 'Welcome',
      template: '<li:welcome></li:welcome>'
    })
    .when('/messages', {
      navId: 'messages',
      title: 'Messages',
      template: '<li:messages></li:messages>'
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
