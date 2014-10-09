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
  'li.main.directives.user-import'///__new_directive_placeholder__///
]);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

  $locationProvider.html5Mode(true);

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('home', {
      url: '/',
      template: '<li:welcome></li:welcome>',
      data: {
        title: 'Peeps!'
      }
    })
    .state('import', {
      url: '/user-import',
      template: '<li:user-import></li:user-import>',
      data: {
        title: 'Import Peeps!'
      }
    });

});

app.run(function($rootScope, $state) {
  $rootScope.$state = $state;
});
