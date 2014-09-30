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
  'li.app.directives.welcome'
  ///__new_directive_placeholder__///
]);

app.config(function($stateProvider, $urlRouterProvider, $locationProvider) {

  $locationProvider.html5Mode(true);

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('slash', {
      url: '/',
      template: '<li:welcome></li:welcome>',
      data: {
        title: 'Peeps!'
      }
    });

});

app.run(function($rootScope, $state) {
  $rootScope.$state = $state;
});
