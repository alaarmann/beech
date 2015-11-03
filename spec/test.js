/*
 * Beech Unit Tests
*/
/*jshint         strict : true, browser : false,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, undef : true,
  white  : true
*/
/*globals require, describe, it, expect, jasmine */

var createObjectTreeProcessor = require('../main');

describe("ObjectTreeProcessor", function() {
  'use strict';
 
  describe("applyToEach", function() {
    var someFunction = function () {};
    var collection = {
      'one' : 1,
      'two' : someFunction,
      'three' : 'A string value'
    };

    it("applies function to each owned member", function() {
      var processIt = jasmine.createSpy();
      var processor = createObjectTreeProcessor(collection);

      processor.applyToEach(processIt);
      expect(processIt).toHaveBeenCalledWith('one', 1);
      expect(processIt).toHaveBeenCalledWith('two', someFunction);
      expect(processIt).toHaveBeenCalledWith('three', 'A string value');
      expect(processIt.calls.count()).toEqual(3);
    });
  });
});


