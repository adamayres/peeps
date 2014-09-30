'use strict';

describe('unsafe', function() {
  beforeEach(module('li.app.filters.unsafe'));

  it('should allow unsafe markup', inject(function(unsafeFilter, $sce) {
    var unsafeValues = [
      '<script>alert("hello")</script>',
      '<iframe src="http://foo"></iframe>'
    ];

    for (var i = 0; i < unsafeValues.length; i++) {
      var unsafeValue = unsafeValues[i];
      var unsafe = unsafeFilter(unsafeValue);
      expect($sce.getTrustedHtml(unsafe)).toBe(unsafeValue);
    }
  }));
});