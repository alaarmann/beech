/*
 * Beech Unit Tests
*/

/*globals require, describe, it, expect, jasmine, beforeEach */

var createObjectTreeProcessor = require('../main');

describe("ObjectTreeProcessor", function() {
  'use strict';
 
  describe("map", function() {

    beforeEach(function() {
      this.someFunction = function () {};
    });

    describe("when object-tree is not empty", function() {
      beforeEach(function() {
        this.collection = {
          'one' : 1,
          'two' : this.someFunction,
          'three' : 'A string value'
        };
        this.processor = createObjectTreeProcessor(this.collection);
        this.processIt = jasmine.createSpy();
      });

      it("applies function to each owned member", function() {
        this.processor.map(this.processIt);
        expect(this.processIt).toHaveBeenCalledWith('one', 1);
        expect(this.processIt).toHaveBeenCalledWith('two', this.someFunction);
        expect(this.processIt).toHaveBeenCalledWith('three', 'A string value');
        expect(this.processIt.calls.count()).toEqual(3);
      });

      it("returns ObjectTreeProcessor object", function() {
        var result = this.processor.map(this.processIt);
        expect(result).toBe(this.processor);
      });
    });

    describe("when object-tree is empty", function() {
      beforeEach(function() {
        this.collection = {};
        this.processor = createObjectTreeProcessor(this.collection);
        this.processIt = jasmine.createSpy();
      });
      it("does not apply function", function() {
        this.processor.map(this.processIt);
        expect(this.processIt).not.toHaveBeenCalled();
      });
      it("returns ObjectTreeProcessor object", function() {
        var result = this.processor.map(this.processIt);
        expect(result).toBe(this.processor);
      });
    });

    describe("when object-tree is null", function() {
      beforeEach(function() {
        this.collection = null;
        this.processor = createObjectTreeProcessor(this.collection);
        this.processIt = jasmine.createSpy();
      });
      it("does not apply function", function() {
        this.processor.map(this.processIt);
        expect(this.processIt).not.toHaveBeenCalled();
      });
      it("returns ObjectTreeProcessor object", function() {
        var result = this.processor.map(this.processIt);
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
        this.processor.map(this.processIt, thisContextProvided);
        expect(thisContextInFunction).toBe(thisContextProvided);
        expect(thisContextProvided.a).toEqual('ROMA');
      });
    });

    describe("when this-pointer not provided", function() {
      var thisContextInFunction;

      beforeEach(function() {
        thisContextInFunction = undefined;
        this.processIt = function () {
	  thisContextInFunction = this;
        };
        this.collection = {b : 'OMA'};
        this.processor = createObjectTreeProcessor(this.collection);
      });
      it("applies function bound to null-context", function() {
        this.processor.map(this.processIt);
        expect(thisContextInFunction).toBe(null);
      });
    });

    describe("when no function-argument provided", function() {

      beforeEach(function() {
        this.collection = {b : 'OMA'};
        this.processor = createObjectTreeProcessor(this.collection);
      });
      it("throws error", function() {
        var processor = this.processor;
        expect(function(){processor.map();}).toThrow();
      });
    });

    describe("when wrong type as function-argument provided", function() {

      beforeEach(function() {
        this.collection = {b : 'OMA'};
        this.processor = createObjectTreeProcessor(this.collection);
      });
      it("throws error", function() {
        var processor = this.processor;
        expect(function(){processor.map({wrong : 'type'});}).toThrow();
      });
    });
  });

  describe("filter", function() {

    beforeEach(function() {
      this.someFunction = function () {};
    });

    describe("when object-tree is not empty", function() {
      beforeEach(function() {
        this.collection = {
          'one' : 1,
          'two' : this.someFunction,
          'three' : 'A string value'
        };
        this.processor = createObjectTreeProcessor(this.collection);
        this.processIt = jasmine.createSpy();
      });

      it("applies function to each owned member", function() {
        this.processor.filter(this.processIt);
        expect(this.processIt).toHaveBeenCalledWith('one', 1);
        expect(this.processIt).toHaveBeenCalledWith('two', this.someFunction);
        expect(this.processIt).toHaveBeenCalledWith('three', 'A string value');
        expect(this.processIt.calls.count()).toEqual(3);
      });

      it("filters only members that match filter", function() {
        var testFilter = function(aKey, aValue){
          return aKey === 'one' || typeof aValue === 'function';
        };
        this.processor.filter(testFilter).map(this.processIt);
        expect(this.processIt).toHaveBeenCalledWith('one', 1);
        expect(this.processIt).toHaveBeenCalledWith('two', this.someFunction);
        expect(this.processIt).not.toHaveBeenCalledWith('three', undefined);
        expect(this.processIt).not.toHaveBeenCalledWith('three', 'A string value');
        expect(this.processIt.calls.count()).toEqual(2);
      });


      it("returns ObjectTreeProcessor object", function() {
        var result = this.processor.filter(this.processIt);
        expect(result).toBe(this.processor);
      });
    });

    describe("when object-tree is empty", function() {
      beforeEach(function() {
        this.collection = {};
        this.processor = createObjectTreeProcessor(this.collection);
        this.processIt = jasmine.createSpy();
      });
      it("does not apply function", function() {
        this.processor.filter(this.processIt);
        expect(this.processIt).not.toHaveBeenCalled();
      });
      it("returns ObjectTreeProcessor object", function() {
        var result = this.processor.filter(this.processIt);
        expect(result).toBe(this.processor);
      });
    });

    describe("when object-tree is null", function() {
      beforeEach(function() {
        this.collection = null;
        this.processor = createObjectTreeProcessor(this.collection);
        this.processIt = jasmine.createSpy();
      });
      it("does not apply function", function() {
        this.processor.filter(this.processIt);
        expect(this.processIt).not.toHaveBeenCalled();
      });
      it("returns ObjectTreeProcessor object", function() {
        var result = this.processor.filter(this.processIt);
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
        this.processor.filter(this.processIt, thisContextProvided);
        expect(thisContextInFunction).toBe(thisContextProvided);
        expect(thisContextProvided.a).toEqual('ROMA');
      });
    });

    describe("when this-pointer not provided", function() {
      var thisContextInFunction;

      beforeEach(function() {
        thisContextInFunction = undefined;
        this.processIt = function () {
	  thisContextInFunction = this;
        };
        this.collection = {b : 'OMA'};
        this.processor = createObjectTreeProcessor(this.collection);
      });
      it("applies function bound to null-context", function() {
        this.processor.filter(this.processIt);
        expect(thisContextInFunction).toBe(null);
      });
    });

    describe("when no function-argument provided", function() {

      beforeEach(function() {
        this.collection = {b : 'OMA'};
        this.processor = createObjectTreeProcessor(this.collection);
      });
      it("throws error", function() {
        var processor = this.processor;
        expect(function(){processor.filter();}).toThrow();
      });
    });

    describe("when wrong type as function-argument provided", function() {

      beforeEach(function() {
        this.collection = {b : 'OMA'};
        this.processor = createObjectTreeProcessor(this.collection);
      });
      it("throws error", function() {
        var processor = this.processor;
        expect(function(){processor.filter({wrong : 'type'});}).toThrow();
      });
    });
  });
});


