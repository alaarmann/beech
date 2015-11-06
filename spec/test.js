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

    it("returns ObjectTreeProcessor object", function() {
      var processIt = function () {};
      var processor = createObjectTreeProcessor(collection);

      var result = processor.applyToEach(processIt);
      expect(result).toBe(processor);
    });

    describe("when object-tree is empty", function() {
      it("does not apply function", function() {
        var processIt = jasmine.createSpy();
        var processor = createObjectTreeProcessor({});

        processor.applyToEach(processIt);
        expect(processIt).not.toHaveBeenCalled();
      });
    });

    describe("when object-tree is null", function() {
      it("does not apply function", function() {
        var processIt = jasmine.createSpy();
        var processor = createObjectTreeProcessor(null);

        processor.applyToEach(processIt);
        expect(processIt).not.toHaveBeenCalled();
      });
    });

    describe("when this-pointer provided", function() {
      it("applies function bound to this-pointer provided", function() {
        var thisContextProvided = {a : 'R'};
        var thisContextInFunction;
        var processIt = function (key, value) {
	  thisContextInFunction = this;
          this.a +=  value;
        };
        var collection = {b : 'OMA'};
        var processor = createObjectTreeProcessor(collection);

        processor.applyToEach(processIt, thisContextProvided);
        expect(thisContextInFunction).toBe(thisContextProvided);
        expect(thisContextProvided.a).toEqual('ROMA');
      });
    });

    describe("when this-pointer not provided", function() {
      it("applies function bound to null-context", function() {
        var thisContextInFunction;
        var processIt = function (key, value) {
	  thisContextInFunction = this;
        };
        var collection = {b : 'OMA'};
        var processor = createObjectTreeProcessor(collection);

        processor.applyToEach(processIt);
        expect(thisContextInFunction).toBe(null);
      });
    });
  });
});


