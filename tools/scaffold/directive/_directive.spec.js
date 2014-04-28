'use strict';

describe('<%= name %> directive', function() {
  var $compile, $rootScope;

  beforeEach(module('li.app.directives.<%= name %>', 'li.rnr.tpls'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should render', function () {
    var element;

    element = $compile('<li:<%= name %>></li:<%= name %>>')($rootScope);
    $rootScope.$digest();

    expect(element.find('.li-<%= name %>').size()).toBe(1);
    expect(element.find('.li-<%= name %>').text()).toBe('<%= name %> Component');
  });
});
