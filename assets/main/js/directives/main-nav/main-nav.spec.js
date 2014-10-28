'use strict';

describe('main-nav directive', function() {
  var $compile, $rootScope;

  beforeEach(module('li.app.directives.main-nav', 'li.rnr.tpls'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should render', function () {
    var element;

    element = $compile('<li:main-nav></li:main-nav>')($rootScope);
    $rootScope.$digest();

    expect(element.find('.li-main-nav').size()).toBe(1);
    expect(element.find('.li-main-nav').text()).toBe('main-nav Component');
  });
});
