Beech
=====

A JavaScript object-tree processor, i.e. a 'collection pipeline' as described by Fowler [here](http://martinfowler.com/articles/collection-pipeline/).

## Installation

  `npm install beech --save`

## Usage

### General Description

Beech allows processing of a collection's items and applying different kinds of transformations to it.

* Method chaining: every method returns the beech object, which allows chaining.
* Constructor accepts a JavaScript value (scalar, array, hash) as argument. This value is taken as initial collection inside the beech object.
* Beech's methods don't modify the initial collection but construct new collection instances at every transformation. Callbacks can modify items of the initial collection however.
* Internally the current collection is seen as an array consisting of single values and/or special key-value pairs at root level (allowing duplicate key-value pairs). Higher levels stay the JavaScript values they are.
* Beech uses the initial collection at first (processing/transformation) method call. That means: any modification to the initial collection (root-level) outside of beech is effective to beech only before the first method call and ignored afterwards.

Below descriptions of beech's methods, cf. Fowler's [Operation Catalog](http://martinfowler.com/articles/collection-pipeline/#op-catalog).

### Method `map()`

* The method accepts a callback function as argument. 
* Beech applies the callback to all items of the current collection. 
* Beech passes the item to the callback: if single value as one argument, if key-value pair as two arguments.
* Beech appends the callback's return value to the resulting collection, if presented.
* If no return value is passed, beech will add all members added to the callback's `this` to the resulting collection.
 
```javascript
  var createBeechObjectTreeProcessor = require('beech');

  var someFunction = function () {};
  var collection = {
    'one' : 1,
    'two' : someFunction,
    'three' : 'A string value'
  };

  var mapIt = function (key, value) {
    return value;
  };

  var processor = createBeechObjectTreeProcessor(collection);

  processor.map(mapIt);
  // Internally beech now holds [1, someFunction, 'A string value']

  mapIt = function (key, value) {
    this[key + 'x'] = value;
  };

  processor = createBeechObjectTreeProcessor(collection);

  processor.map(mapIt);
  // Internally beech now holds a collection consisting of key-value pairs: ('onex' : 1), ('twox' : someFunction), ('threex' : 'A string value')

```

### Method `filter()`

* The method accepts a callback function as argument. 
* Beech applies the callback to all items of the current collection. 
* Beech passes the item to the callback: if single value as one argument, if key-value pair as two arguments.
* Beech appends the current item to the resulting collection, if the callback's return value is a truthy value.
 
```javascript
  var createBeechObjectTreeProcessor = require('beech');

  var someFunction = function () {};
  var collection = {
    'one' : 1,
    'two' : someFunction,
    'three' : 'A string value'
  };

  var filterIt = function (key, value) {
    return (key === 'one' || key === 'three');
  };

  var processor = createBeechObjectTreeProcessor(collection);

  processor.filter(filterIt);
  // Internally beech is now holding a collection consisting of key-value pairs: ('one' : 1), ('three' : 'A string value')

```

### Method `reduce()`

* The method accepts a callback function as argument. 
* Beech applies the callback to all items of the current collection. 
* Beech passes an accumulator-value and the item to the callback: if item is single value as one additional argument, if it is a key-value pair as two additional arguments.
* Beech takes the callback's return value as the new accumulator-value that it passes to the next call.
 
```javascript
  var createBeechObjectTreeProcessor = require('beech');

  var someFunction = function () {};
  var collection = {
    'one' : 1,
    'two' : someFunction,
    'three' : 'A string value'
  };

  var reduceIt = function(aAccumulator, aKey, aValue){
    return aAccumulator + aKey + ' is of type "' + typeof aValue + '" ';
  };

  var processor = createBeechObjectTreeProcessor(collection);

  processor.reduce(reduceIt);
  // Internally beech is now holding a collection consisting of one single value (a string): 'one is of type "number" two is of type "function" three is of type "string" '

```

### Method `flatten()`

* The method accepts as an optional argument the level (numeric value, starting at 1) to which it should flatten out the collection. 
* Beech adds all 'leaf'-values of the collection-tree to the resulting collection thereby flattening the tree. 
 
```javascript
  var createBeechObjectTreeProcessor = require('beech');

  var collection = {
    'one' : 1,
    'two' : {'keyx' : 'valuex'},
    'three' : 'A string value'
  };

  var processor = createBeechObjectTreeProcessor(collection);

  processor.flatten();
  // Internally beech is now holding a collection consisting of single values: 'one', 1, 'two', 'keyx', 'valuex', 'three', 'A string value'

```

### Method `concat()`

* The method accepts as argument a further collection. 
* Beech adds all items of the supplied collection to the current collection thereby concatenating the current and the supplied collection.
* Concatenation can lead to duplicate items in the resulting collection.  
 
```javascript
  var createBeechObjectTreeProcessor = require('beech');

  var someFunction = function () {};
  var collection = {
    'one' : 1,
    'two' : someFunction,
    'three' : 'A string value'
  };

  var furtherCollection = {
    'one' : 100,
    'deux' : someFunction,
    'three' : 'A string value'
  };

  var processor = createBeechObjectTreeProcessor(collection);

  processor.concat(furtherCollection);
  // Internally beech is now holding a collection consisting of key-value pairs: ('one' : 1), ('two' : someFunction), ('three' : 'A string value'), ('one' : 100), ('deux' : someFunction), ('three' : 'A string value')

```

### Method `difference()`

* The method accepts as argument a further collection. 
* Beech removes all items of the supplied collection from the current collection resulting in a collection that contains the difference between the latter and the first.
 
```javascript
  var createBeechObjectTreeProcessor = require('beech');

  var someFunction = function () {};
  var collection = {
    'one' : 1,
    'two' : someFunction,
    'three' : 'A string value'
  };

  var furtherCollection = {
    'one' : 100,
    'deux' : someFunction,
    'three' : 'A string value'
  };

  var processor = createBeechObjectTreeProcessor(collection);

  processor.difference(furtherCollection);
  // Internally beech is now holding a collection consisting of key-value pairs: ('one' : 1), ('two' : someFunction)

```

### Method `intersection()`

* The method accepts as argument a further collection. 
* Beech retains all items of the current collection that are also contained in the supplied collection resulting in a collection that contains the intersection of both.
 
```javascript
  var createBeechObjectTreeProcessor = require('beech');

  var someFunction = function () {};
  var collection = {
    'one' : 1,
    'two' : someFunction,
    'three' : 'A string value'
  };

  var furtherCollection = {
    'one' : 100,
    'deux' : someFunction,
    'three' : 'A string value'
  };

  var processor = createBeechObjectTreeProcessor(collection);

  processor.intersection(furtherCollection);
  // Internally beech is now holding a collection consisting of one key-value pair: ('three' : 'A string value')

```

## Tests

  `npm test`


## License

Published under the MIT-License, see [LICENSE-MIT.txt](https://github.com/alaarmann/beech/blob/master/LICENSE-MIT.txt) file.


## Contact

Your feedback is appreciated, please e-mail me at [alaarmann@gmx.net](mailto:alaarmann@gmx.net)

## Release History

* 0.1.0 Initial release
* 0.2.0 Implementation of map(), filter(), reduce(), flatten(), concat(), difference(), intersection()
