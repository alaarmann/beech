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

    beforeEach(function() {
      this.someFunction = function () {};
      this.collection = {
        'one' : 1,
        'two' : this.someFunction,
        'three' : 'A string value'
      };
      this.processor = createObjectTreeProcessor(this.collection);
      this.processIt = jasmine.createSpy();
    });

    it("applies function to each owned member", function() {
      this.processor.applyToEach(this.processIt);
      expect(this.processIt).toHaveBeenCalledWith('one', 1);
      expect(this.processIt).toHaveBeenCalledWith('two', this.someFunction);
      expect(this.processIt).toHaveBeenCalledWith('three', 'A string value');
      expect(this.processIt.calls.count()).toEqual(3);
    });

    it("returns ObjectTreeProcessor object", function() {
      var result = this.processor.applyToEach(this.processIt);
      expect(result).toBe(this.processor);
    });

    describe("when object-tree is empty", function() {
      beforeEach(function() {
        this.collection = {};
        this.processor = createObjectTreeProcessor(this.collection);
      });
      it("does not apply function", function() {
        this.processor.applyToEach(this.processIt);
        expect(this.processIt).not.toHaveBeenCalled();
      });
      it("returns ObjectTreeProcessor object", function() {
        var result = this.processor.applyToEach(this.processIt);
        expect(result).toBe(this.processor);
      });
    });

    describe("when object-tree is null", function() {
      beforeEach(function() {
        this.collection = null;
        this.processor = createObjectTreeProcessor(this.collection);
      });
      it("does not apply function", function() {
        this.processor.applyToEach(this.processIt);
        expect(this.processIt).not.toHaveBeenCalled();
      });
      it("returns ObjectTreeProcessor object", function() {
        var result = this.processor.applyToEach(this.processIt);
        expect(result).toBe(this.processor);
      });
    });

    describe("when this-pointer provided", function() {
      var thisContextProvided;
      var thisContextInFunction;

      beforeEach(function() {
        thisContextProvided = {a : 'R'};
        thisContextInFunction = undefined;
        this.processIt = function (key, value) {
	  thisContextInFunction = this;
          this.a +=  value;
        };
        this.collection = {b : 'OMA'};
        this.processor = createObjectTreeProcessor(this.collection);
      });
      it("applies function bound to this-pointer provided", function() {
        this.processor.applyToEach(this.processIt, thisContextProvided);
        expect(thisContextInFunction).toBe(thisContextProvided);
        expect(thisContextProvided.a).toEqual('ROMA');
      });
    });

    describe("when this-pointer not provided", function() {
      var thisContextInFunction;

      beforeEach(function() {
        thisContextInFunction = undefined;
        this.processIt = function (key, value) {
	  thisContextInFunction = this;
        };
        this.collection = {b : 'OMA'};
        this.processor = createObjectTreeProcessor(this.collection);
      });
      it("applies function bound to null-context", function() {
        this.processor.applyToEach(this.processIt);
        expect(thisContextInFunction).toBe(null);
      });
    });
  });
});


