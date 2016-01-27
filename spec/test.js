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

    describe("when collection is a hash", function() {
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

      it("puts return value of callback into resulting collection", function() {
        var callback = function(aKey, aValue){
          return aKey + ' ' + typeof(aValue);
        };
        this.processor.map(callback).map(this.processIt);
        expect(this.processIt).toHaveBeenCalledWith('one number');
        expect(this.processIt).toHaveBeenCalledWith('two function');
        expect(this.processIt).toHaveBeenCalledWith('three string');
        expect(this.processIt.calls.count()).toEqual(3);
      });

      it("puts key-value-pairs assigned to this into resulting collection", function() {
        var callback = function(aKey, aValue){
          this[aKey] = aValue;
          this[aKey + 'x'] = aValue;
        };
        this.processor.map(callback).map(this.processIt);
        expect(this.processIt).toHaveBeenCalledWith('one', 1);
        expect(this.processIt).toHaveBeenCalledWith('onex', 1);
        expect(this.processIt).toHaveBeenCalledWith('two', this.someFunction);
        expect(this.processIt).toHaveBeenCalledWith('twox', this.someFunction);
        expect(this.processIt).toHaveBeenCalledWith('three', 'A string value');
        expect(this.processIt).toHaveBeenCalledWith('threex', 'A string value');
        expect(this.processIt.calls.count()).toEqual(6);
      });
    });

    describe("when collection is an array", function() {
      beforeEach(function() {
        this.complexThing = {
          'key1' : 'value1',
          'key2' : 'value2'
        };
 
        this.collection = [
          1,
          this.someFunction,
          'A string value',
          this.complexThing
        ];
        this.processor = createObjectTreeProcessor(this.collection);
        this.processIt = jasmine.createSpy();
      });

      it("applies function to each owned member", function() {
        this.processor.map(this.processIt);
        expect(this.processIt).toHaveBeenCalledWith(1);
        expect(this.processIt).toHaveBeenCalledWith(this.someFunction);
        expect(this.processIt).toHaveBeenCalledWith('A string value');
        expect(this.processIt).toHaveBeenCalledWith(this.complexThing);
        expect(this.processIt.calls.count()).toEqual(4);
      });
    });

    describe("when collection is a scalar value", function() {
      describe("that is a string", function() {
        beforeEach(function() {
          this.collection = "joke";
          this.processor = createObjectTreeProcessor(this.collection);
          this.processIt = jasmine.createSpy();
        });

        it("applies function to each owned member", function() {
          this.processor.map(this.processIt);
          expect(this.processIt).toHaveBeenCalledWith(this.collection);
          expect(this.processIt.calls.count()).toEqual(1);
        });
      });

      describe("that is a number", function() {
        beforeEach(function() {
          this.collection = 123;
          this.processor = createObjectTreeProcessor(this.collection);
          this.processIt = jasmine.createSpy();
        });

        it("applies function to each owned member", function() {
          this.processor.map(this.processIt);
          expect(this.processIt).toHaveBeenCalledWith(this.collection);
          expect(this.processIt.calls.count()).toEqual(1);
        });
      });

      describe("that is a function", function() {
        beforeEach(function() {
          this.collection = function(){return 'nonsense';};
          this.processor = createObjectTreeProcessor(this.collection);
          this.processIt = jasmine.createSpy();
        });

        it("applies function to each owned member", function() {
          this.processor.map(this.processIt);
          expect(this.processIt).toHaveBeenCalledWith(this.collection);
          expect(this.processIt.calls.count()).toEqual(1);
        });
      });
      describe("that is a boolean", function() {
        beforeEach(function() {
          this.collection = true;
          this.processor = createObjectTreeProcessor(this.collection);
          this.processIt = jasmine.createSpy();
        });

        it("applies function to each owned member", function() {
          this.processor.map(this.processIt);
          expect(this.processIt).toHaveBeenCalledWith(this.collection);
          expect(this.processIt.calls.count()).toEqual(1);
        });
      });
    });

    describe("when collection is empty", function() {
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

    describe("when collection is null", function() {
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

    describe("when collection is not empty", function() {
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

    describe("when collection is empty", function() {
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

    describe("when collection is null", function() {
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

  describe("reduce", function() {

    beforeEach(function() {
      this.someFunction = function () {};
    });

    describe("when collection is not empty", function() {
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
        this.processor.reduce(undefined, this.processIt);
        expect(this.processIt).toHaveBeenCalledWith(undefined, 'one', 1);
        expect(this.processIt).toHaveBeenCalledWith(undefined, 'two', this.someFunction);
        expect(this.processIt).toHaveBeenCalledWith(undefined, 'three', 'A string value');
        expect(this.processIt.calls.count()).toEqual(3);
      });

      it("reduces members to single object", function() {
        var testReducer = function(aAccumulator, aKey, aValue){
          return aAccumulator + aKey + ' is of type "' + typeof aValue + '" ';
        };
        this.processor.reduce('', testReducer).map(this.processIt);
        expect(this.processIt).toHaveBeenCalledWith('one is of type "number" two is of type "function" three is of type "string" ');
        expect(this.processIt.calls.count()).toEqual(1);
      });


      it("returns ObjectTreeProcessor object", function() {
        var result = this.processor.reduce(undefined, this.processIt);
        expect(result).toBe(this.processor);
      });
    });
  });

  describe("flatten", function() {

    beforeEach(function() {
      this.someFunction = function () {};
    });

    describe("when collection is not empty", function() {
      beforeEach(function() {
        this.collection = {
          'one' : 1,
          'two' : this.someFunction,
          'three' : 'A string value',
          'four' : true,
          'five' : {
            'key1' : 'value1',
            'key2' : 'value2'
          },
          'six' : [
            'uno',
            ['inside', 'arr'],
            {'nice' : 'yes', 'hash' : 'it is'}
          ]
        };
        this.processor = createObjectTreeProcessor(this.collection);
        this.processIt = jasmine.createSpy();
      });

      it("flattens out collection tree entirely", function() {
        this.processor.flatten().map(this.processIt);
        expect(this.processIt).toHaveBeenCalledWith('one');
        expect(this.processIt).toHaveBeenCalledWith(1);
        expect(this.processIt).toHaveBeenCalledWith('two');
        expect(this.processIt).toHaveBeenCalledWith(this.someFunction);
        expect(this.processIt).toHaveBeenCalledWith('three');
        expect(this.processIt).toHaveBeenCalledWith('A string value');
        expect(this.processIt).toHaveBeenCalledWith('four');
        expect(this.processIt).toHaveBeenCalledWith(true);
        expect(this.processIt).toHaveBeenCalledWith('five');
        expect(this.processIt).toHaveBeenCalledWith('key1');
        expect(this.processIt).toHaveBeenCalledWith('value1');
        expect(this.processIt).toHaveBeenCalledWith('key2');
        expect(this.processIt).toHaveBeenCalledWith('value2');
        expect(this.processIt).toHaveBeenCalledWith('six');
        expect(this.processIt).toHaveBeenCalledWith('uno');
        expect(this.processIt).toHaveBeenCalledWith('inside');
        expect(this.processIt).toHaveBeenCalledWith('arr');
        expect(this.processIt).toHaveBeenCalledWith('nice');
        expect(this.processIt).toHaveBeenCalledWith('yes');
        expect(this.processIt).toHaveBeenCalledWith('hash');
        expect(this.processIt).toHaveBeenCalledWith('it is');
        expect(this.processIt.calls.count()).toEqual(21);
      });

      it("flattens out to a specified level of collection tree", function() {
        this.processor.flatten(2).map(this.processIt);
        expect(this.processIt).toHaveBeenCalledWith('one');
        expect(this.processIt).toHaveBeenCalledWith(1);
        expect(this.processIt).toHaveBeenCalledWith('two');
        expect(this.processIt).toHaveBeenCalledWith(this.someFunction);
        expect(this.processIt).toHaveBeenCalledWith('three');
        expect(this.processIt).toHaveBeenCalledWith('A string value');
        expect(this.processIt).toHaveBeenCalledWith('four');
        expect(this.processIt).toHaveBeenCalledWith(true);
        expect(this.processIt).toHaveBeenCalledWith('five');
        expect(this.processIt).toHaveBeenCalledWith('key1', 'value1');
        expect(this.processIt).toHaveBeenCalledWith('key2', 'value2');
        expect(this.processIt).toHaveBeenCalledWith('six');
        expect(this.processIt).toHaveBeenCalledWith('uno');
        expect(this.processIt).toHaveBeenCalledWith(['inside', 'arr']);
        expect(this.processIt).toHaveBeenCalledWith({'nice' : 'yes', 'hash' : 'it is'});
        expect(this.processIt.calls.count()).toEqual(15);
      });
    });
    describe("when collection is an array of array of array of array", function() {
      beforeEach(function() {
        this.collection = [
          'one',
          [
            [
              ['two']
            ]
          ],
          'three'
        ];
        this.processor = createObjectTreeProcessor(this.collection);
        this.processIt = jasmine.createSpy();
      });

      it("flattens out collection by one level", function() {
        this.processor.flatten(1).map(this.processIt);
        expect(this.processIt).toHaveBeenCalledWith('one');
        expect(this.processIt).toHaveBeenCalledWith([['two']]);
        expect(this.processIt).toHaveBeenCalledWith('three');
        expect(this.processIt.calls.count()).toEqual(3);
      });
    });
  });

  describe("concat", function() {

    beforeEach(function() {
      this.someFunction = function () {};
    });

    describe("when collections are hashes", function() {
      beforeEach(function() {
        this.collection = {
          'one' : 1,
          'two' : this.someFunction,
          'three' : 'A string value'
        };
        this.otherCollection = {
          'one' : 1,
          'deux' : this.someFunction,
          'tre' : 'A string value'
        };
        this.processor = createObjectTreeProcessor(this.collection);
        this.processIt = jasmine.createSpy();
      });

      it("concatenates the members (key-value-pairs)", function() {
        this.processor.concat(this.otherCollection).map(this.processIt);
        expect(this.processIt).toHaveBeenCalledWith('one', 1);
        expect(this.processIt).toHaveBeenCalledWith('two', this.someFunction);
        expect(this.processIt).toHaveBeenCalledWith('three', 'A string value');
        expect(this.processIt).toHaveBeenCalledWith('one', 1);
        expect(this.processIt).toHaveBeenCalledWith('deux', this.someFunction);
        expect(this.processIt).toHaveBeenCalledWith('tre', 'A string value');
        expect(this.processIt.calls.count()).toEqual(6);
      });
    });
  });
});


