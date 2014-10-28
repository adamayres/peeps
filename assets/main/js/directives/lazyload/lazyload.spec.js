'use strict';

describe('lazyload directive', function() {
  var $compile, $rootScope;

  beforeEach(module('li.app.directives.lazyload', 'li.rnr.tpls'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should render', function () {
    var element;

    element = $compile('<li:lazyload></li:lazyload>')($rootScope);
    $rootScope.$digest();

    expect(element.find('.li-lazyload').size()).toBe(1);
    expect(element.find('.li-lazyload').text()).toBe('lazyload Component');
  });
});
