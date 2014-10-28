'use strict';

describe('users directive', function() {
  var $compile, $rootScope;

  beforeEach(module('li.app.directives.users', 'li.rnr.tpls'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should render', function () {
    var element;

    element = $compile('<li:users></li:users>')($rootScope);
    $rootScope.$digest();

    expect(element.find('.li-users').size()).toBe(1);
    expect(element.find('.li-users').text()).toBe('users Component');
  });
});
