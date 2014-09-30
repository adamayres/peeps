'use strict';

describe('welcome directive', function() {
  var $compile, $rootScope;

  beforeEach(module('li.app.directives.welcome', 'li.rnr.tpls'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should render', function () {
    var element;

    element = $compile('<li:welcome></li:welcome>')($rootScope);
    $rootScope.$digest();

    expect(element.find('.li-app-welcome').size()).toBe(1);
  });
});
