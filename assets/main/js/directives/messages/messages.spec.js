'use strict';

describe('messages directive', function() {
  var $compile, $rootScope;

  beforeEach(module('li.app.directives.messages', 'li.rnr.tpls'));

  beforeEach(inject(function (_$compile_, _$rootScope_) {
    $compile = _$compile_;
    $rootScope = _$rootScope_;
  }));

  it('should render', function () {
    var element;

    element = $compile('<li:messages></li:messages>')($rootScope);
    $rootScope.$digest();

    expect(element.find('.li-messages').size()).toBe(1);
  });
});
