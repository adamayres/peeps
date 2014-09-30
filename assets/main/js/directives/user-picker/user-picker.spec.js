'use strict';

describe('user-picker directive', function() {
  var $compile, $rootScope;

  beforeEach(module('li.app.directives.user-picker', 'li.rnr.tpls'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should render', function () {
    var element;

    element = $compile('<li:user-picker></li:user-picker>')($rootScope);
    $rootScope.$digest();

    expect(element.find('.li-user-picker').size()).toBe(1);
    expect(element.find('.li-user-picker').text()).toBe('user-picker Component');
  });
});
