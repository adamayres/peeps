'use strict';

/**
 * Main App Module
 */
var app = angular.module('li.main.app', [
  'ngSanitize',
  'ngAnimate',
  'ui.router',
  'ui.bootstrap',
  'li.main.tpls',
  'li.app.filters.unsafe',
  'li.app.directives.welcome',
  'li.main.directives.user-import',
  'li.main.directives.users',
  'li.main.directives.main-nav',
  'li.main.directives.user',
  'li.main.directives.lazyload'///__new_directive_placeholder__///
]);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

  $locationProvider.html5Mode(true);

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      template: '<li:users></li:users>',
      data: {
        title: 'Peeps - Home',
        tab: 'home'
      }
    })
    .state('users', {
      url: '/users/:id',
      template: '<li:user></li:user>',
      data: {
        title: 'Peeps - User',
        tab: 'user'
      }
    })
    .state('import', {
      url: '/user-import',
      template: '<li:user-import></li:user-import>',
      data: {
        title: 'Peeps - Import',
        tab: 'import'
      }
    });

});

app.run(function($rootScope, $state) {
  $rootScope.$state = $state;
});
