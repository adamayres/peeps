'use strict';

describe('user-import directive', function() {
  var $compile, $rootScope;

  beforeEach(module('li.app.directives.user-import', 'li.rnr.tpls'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should render', function () {
    var element;

    element = $compile('<li:user-import></li:user-import>')($rootScope);
    $rootScope.$digest();

    expect(element.find('.li-user-import').size()).toBe(1);
    expect(element.find('.li-user-import').text()).toBe('user-import Component');
  });
});
