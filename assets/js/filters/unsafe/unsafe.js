(function () {

  'use strict';

  angular.module('li.app.filters.unsafe', [])
    .filter('unsafe', function($sce) {
      return function(val) {
        return $sce.trustAsHtml(val);
      };
    });

}());
