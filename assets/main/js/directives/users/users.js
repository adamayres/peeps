'use strict';

angular.module('li.main.directives.users', ['sails.io'])
  .directive('liUsers', function ($sailsSocket) {
    return {
      restrict: 'AE',
      templateUrl: 'js/directives/users/users.tpl.html',
      link: function ($scope) {

        $scope.quantity = 50;
        $scope.page = 1;
        $scope.sort = 'hireDate';
        $scope.sortDir = 'asc';

        $sailsSocket.get('/api/users/count').then(function (response) {
          $scope.count = response.data.count;
        });

        $scope.updateUsers = function () {
          var data = {
            limit: $scope.quantity,
            skip: ($scope.page - 1) * $scope.quantity,
            sort: $scope.sort + ' ' + $scope.sortDir.toUpperCase()
          };

          if ($scope.searchText && $scope.searchText !== '') {
            data.or = [
              {firstName: {contains: $scope.searchText}},
              {lastName: {contains: $scope.searchText}},
              {preferredName: {contains: $scope.searchText}}
            ];
          }

          $sailsSocket.get('/api/users', {
            data: data
          }).then(function (response) {
            $scope.users = response.data;
          });
        };

        $scope.$watchCollection('[quantity,page,sort]', function () {
          $scope.updateUsers();
        });

        $scope.$watch('searchText', function () {
          $scope.updateUsers();
        });

        $scope.doSort = function (sort) {
          if ($scope.sort === sort) {
            $scope.sortDir = $scope.sortDir === 'asc' ? 'desc' : 'asc';
          } else {
            $scope.sort = sort;
            $scope.sortDir = 'asc';
          }
          $scope.updateUsers();
        };
      }
    };
  });
