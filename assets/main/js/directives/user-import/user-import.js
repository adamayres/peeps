'use strict';

angular.module('li.main.directives.user-import', ['angularFileUpload'])
  .directive('liUserImport', function ($upload, $timeout, $log) {
    return {
      restrict: 'AE',
      templateUrl: 'js/directives/user-import/user-import.tpl.html',
      link: function ($scope) {
        $scope.onFileSelect = function($files) {

          $scope.file = $files[0];
          $scope.uploadStartTime = (new Date()).getTime();
          $scope.showProgress = true;
          $scope.progress = 0;

          $scope.upload = $upload.upload({
            url: 'api/users/import',
            file: $scope.file
          }).progress(function(evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
          }).success(function() {
            $scope.progress = 100;
            $timeout(function () {
              $scope.showProgress = false;
            }, 1000);
          }).error(function (err) {
            $log.error(err);
          });
        };
      }
    };
  });
