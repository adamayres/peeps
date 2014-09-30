'use strict';

describe('site-nav directive', function() {
  var $compile, $rootScope;

  beforeEach(module('li.app.directives.site-nav', 'li.rnr.tpls'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should render', function () {
    var element;

    element = $compile('<li:site-nav></li:site-nav>')($rootScope);
    $rootScope.$digest();

    expect(element.find('.li-app-site-nav').size()).toBe(1);
    expect(element.find('.li-app-site-nav').text()).toBe('site-nav Component');
  });
});
