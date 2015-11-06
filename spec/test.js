/*
 * Beech Unit Tests
*/
/*jshint         strict : true, browser : false,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, undef : true,
  white  : true
*/
/*globals require, describe, it, expect, jasmine, beforeEach */

var createObjectTreeProcessor = require('../main');

describe("ObjectTreeProcessor", function() {
  'use strict';
 
  describe("applyToEach", function() {
    var someFunction; 
    var collection;
    var processor;
    var processIt;

    beforeEach(function() {
      someFunction = function () {};
      collection = {
        'one' : 1,
        'two' : someFunction,
        'three' : 'A string value'
      };
      processor = createObjectTreeProcessor(collection);
      processIt = jasmine.createSpy();
    });

    it("applies function to each owned member", function() {
      processor.applyToEach(processIt);
      expect(processIt).toHaveBeenCalledWith('one', 1);
      expect(processIt).toHaveBeenCalledWith('two', someFunction);
      expect(processIt).toHaveBeenCalledWith('three', 'A string value');
      expect(processIt.calls.count()).toEqual(3);
    });

    it("returns ObjectTreeProcessor object", function() {
      var result = processor.applyToEach(processIt);
      expect(result).toBe(processor);
    });

    describe("when object-tree is empty", function() {
      beforeEach(function() {
        collection = {};
        processor = createObjectTreeProcessor(collection);
      });
      it("does not apply function", function() {
        processor.applyToEach(processIt);
        expect(processIt).not.toHaveBeenCalled();
      });
      it("returns ObjectTreeProcessor object", function() {
        var result = processor.applyToEach(processIt);
        expect(result).toBe(processor);
      });
    });

    describe("when object-tree is null", function() {
      beforeEach(function() {
        collection = null;
        processor = createObjectTreeProcessor(collection);
      });
      it("does not apply function", function() {
        processor.applyToEach(processIt);
        expect(processIt).not.toHaveBeenCalled();
      });
      it("returns ObjectTreeProcessor object", function() {
        var result = processor.applyToEach(processIt);
        expect(result).toBe(processor);
      });
    });

    describe("when this-pointer provided", function() {
      var thisContextProvided;
      var thisContextInFunction;

      beforeEach(function() {
        thisContextProvided = {a : 'R'};
        thisContextInFunction = undefined;
        processIt = function (key, value) {
	  thisContextInFunction = this;
          this.a +=  value;
        };
        collection = {b : 'OMA'};
        processor = createObjectTreeProcessor(collection);
      });
      it("applies function bound to this-pointer provided", function() {
        processor.applyToEach(processIt, thisContextProvided);
        expect(thisContextInFunction).toBe(thisContextProvided);
        expect(thisContextProvided.a).toEqual('ROMA');
      });
    });

    describe("when this-pointer not provided", function() {
      var thisContextInFunction;

      beforeEach(function() {
        thisContextInFunction = undefined;
        processIt = function (key, value) {
	  thisContextInFunction = this;
        };
        collection = {b : 'OMA'};
        processor = createObjectTreeProcessor(collection);
      });
      it("applies function bound to null-context", function() {
        processor.applyToEach(processIt);
        expect(thisContextInFunction).toBe(null);
      });
    });
  });
});


