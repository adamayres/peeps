'use strict';

describe('user directive', function() {
  var $compile, $rootScope;

  beforeEach(module('li.app.directives.user', 'li.rnr.tpls'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should render', function () {
    var element;

    element = $compile('<li:user></li:user>')($rootScope);
    $rootScope.$digest();

    expect(element.find('.li-user').size()).toBe(1);
    expect(element.find('.li-user').text()).toBe('user Component');
  });
});
