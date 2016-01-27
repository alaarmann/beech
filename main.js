/*
 * Beech 
 * Object-tree processor
*/

/*globals module */

var isScalar = function(aCandidate){
  'use strict';
  return (/^string|number|boolean|function$/).test(typeof aCandidate);
};

var isArray = function(aCandidate){
  'use strict';
  return Object.prototype.toString.call( aCandidate ) === '[object Array]';
};

var processRawCollection = function(aCollection, aResult, aStrategy, aCurrentLevel) {
  'use strict';

  var processScalar = function(aScalar, aResult, aStrategy, aCurrentLevel){
    aResult = aStrategy.apply(null, [{'value' : aScalar}, aResult, aCurrentLevel]);
    return aResult;
  };

  var processArray = function(aArray, aResult, aStrategy, aCurrentLevel){
    var index;
    var arrayLength = aArray.length;

    for (index = 0; index < arrayLength;index += 1) {
      aResult = aStrategy.apply(null, [{'value' : aArray[index]}, aResult, aCurrentLevel]);
    }
    return aResult;
  };

  var processOwnedMembersOf = function(aCollection, aResult, aStrategy, aCurrentLevel){
    var each;

    for (each in aCollection) {
      if (!aCollection.hasOwnProperty(each)) {
        continue;
      }
      aResult = aStrategy.apply(null, [{'key' : each, 'value' : aCollection[each]}, aResult, aCurrentLevel]);
    }
    return aResult;
  };

  if(isScalar(aCollection)){
    return processScalar(aCollection, aResult, aStrategy, aCurrentLevel);
  } else if (isArray(aCollection)){
    return processArray(aCollection, aResult, aStrategy, aCurrentLevel);
  } else {
    return processOwnedMembersOf(aCollection, aResult, aStrategy, aCurrentLevel);
  }
};

/*
 * Function processes 'beech collection' (array of objects that have member 'value' and possibly also 'key')
 */
var processBeechCollection = function(aArray, aResult, aStrategy, aCurrentLevel) {
  'use strict';

  var index;
  var arrayLength = aArray.length;

  for (index = 0; index < arrayLength;index += 1) {
    aResult = aStrategy.apply(null, [aArray[index], aResult, aCurrentLevel]);
  }
  return aResult;
};

/* 
 * Function is responsible for creating the argument array (for use with apply())
*/
var createArgumentArray = function(aItem){
  'use strict';
  var result;

  if (aItem.hasOwnProperty('key')){
    result = [aItem.key, aItem.value];
  } else {
    result = [aItem.value];
  }
  return result;
};

var createCanonicalItem = function(aItem){
  'use strict';
  var result;

  if (aItem.hasOwnProperty('key')){
    result = [aItem.key, aItem.value];
  } else {
    result = aItem.value;
  }
  return result;
};

/* 
 * Function is responsible for processing a single item
*/
var processItem = function(aContext, aFunction, aItem){
  'use strict';
  var argumentArray = createArgumentArray(aItem);
  return aFunction.apply(aContext, argumentArray);
};

var isEqual = function(aItem, aOtherItem){
  'use strict';
  var key = aItem.key;
  var value = aItem.value;
  var otherKey = aOtherItem.key;
  var otherValue = aOtherItem.value;

  if (value === otherValue){
    if (typeof key !== 'undefined' && typeof otherKey !== 'undefined'){
      return key === otherKey;
    } else {
      return (typeof key === 'undefined' && typeof otherKey === 'undefined');
    }
  }
  return false;
};

module.exports = function (aCollection){
  'use strict';
  var currentCollection = aCollection || [];
  var processor;
  var applyToCollection;
  var processCollection;
  var map;
  var filter;
  var reduce;
  var flatten;
  var concat;
  var difference;
  var intersection;

  // Initial state is a 'raw' JavaScript-collection
  processCollection = processRawCollection;

  applyToCollection = function (processFunction, aEmptyResultCollection) {
    var resultCollection = aEmptyResultCollection || [];
    var rootLevel = 1;

    currentCollection = processCollection(currentCollection, resultCollection, processFunction, rootLevel);

    if (processCollection === processRawCollection){
      processCollection = processBeechCollection;
    }
    return processor;
  };

  map = function (aFunction) {
    var mapStrategy = function(aItem, aResultCollection){
      var context = {};
      var each;
      var resultValue = processItem(context, aFunction, aItem);

      if (typeof resultValue !== 'undefined'){
        aResultCollection.push({value :  resultValue});
      } else { // if no return-value delivered, add members of context
        for (each in context) {
          if (!context.hasOwnProperty(each)) {
            continue;
          }
          aResultCollection.push({key : each, value :  context[each]});          
        }
      }
      return aResultCollection;
    };
    return applyToCollection(mapStrategy);
  };

  filter = function (aFunction) {
    var filterStrategy = function(aItem, aResultCollection){
      if (processItem(null, aFunction, aItem)){
        aResultCollection.push(aItem);
      }
      return aResultCollection;
    };

    return applyToCollection(filterStrategy);
  };

  reduce = function (startValueArg, functionArg) {
    var accumulator = {};
    accumulator.value = startValueArg;
    var reduceStrategy = function(aItem){
      accumulator.value = functionArg.apply(null, [accumulator.value].concat(createArgumentArray(aItem)));
      return [accumulator];
    };

    return applyToCollection(reduceStrategy);
  };

  flatten = function (aLevel) {
    var isLevelReached = function(aLevelToCheck){
      return typeof aLevel !== 'undefined' && aLevelToCheck > aLevel; 
    };

    var flattenStrategy = function(aItem, aResultCollection, aCurrentLevel){
      var item = createCanonicalItem(aItem);

      if (isScalar(item) || isLevelReached(aCurrentLevel)){
        // root level in output is always a 'beech' collection
        aResultCollection.push(aItem);
        return aResultCollection;
      }
      // next level is always a 'raw' JavaScript collection
      return processRawCollection(item, aResultCollection, flattenStrategy, aCurrentLevel + 1);
    };
    return applyToCollection(flattenStrategy); 
  };

  concat = function () {
    var index;
    var insertStrategy = function(aItem, aResultCollection){
      aResultCollection.push(aItem);
      return aResultCollection;
    };
    // insert items of currentCollection into result
    applyToCollection(insertStrategy);
    // concat sees supplied arguments as collections
    // insert items of supplied collections into result
    for (index = 0; index < arguments.length;index += 1) {
      processRawCollection(arguments[index], currentCollection, insertStrategy);
    }

    return processor;
  };

  difference = function () {
    var index;
    var insertStrategy = function(aItem, aResultCollection){
      aResultCollection.push(aItem);
      return aResultCollection;
    };
    var removeStrategy = function(aItem, aResultCollection){
      var index;
      for (index = 0; index < aResultCollection.length;index += 1) {
        if (isEqual(aResultCollection[index], aItem)){
          break;
        }
      }
      if (index === aResultCollection.length){
        return aResultCollection;
      } else {
        aResultCollection.splice(index, 1);
        return removeStrategy(aItem, aResultCollection);
      }
    };
    // insert items of currentCollection into result
    applyToCollection(insertStrategy);
    // difference sees supplied arguments as collections
    // remove items of supplied collections from result
    for (index = 0; index < arguments.length;index += 1) {
      processRawCollection(arguments[index], currentCollection, removeStrategy);
    }

    return processor;
  };

  intersection = function () {
    var index;
    var createRetainStrategy = function (aSuppliedCollection){
      // function processes each item of current collection
      return function(aItem, aResultCollection){
        // function processes each item of supplied collection
        var retainItem = function(aItemOfSuppliedCollection, aResultCollection){
          if (isEqual(aItemOfSuppliedCollection, aItem)){
            aResultCollection.push(aItem);
          }
          return aResultCollection;
        };
        aResultCollection = processRawCollection(aSuppliedCollection, aResultCollection, retainItem);
        return aResultCollection;
      };
    };
    // intersection sees supplied arguments as collections
    // retain items of supplied collection in respective result
    for (index = 0; index < arguments.length;index += 1) {
      applyToCollection(createRetainStrategy(arguments[index]));
    }

    return processor;
  };

  processor = {
    'map' : map,
    'filter' : filter,
    'reduce' : reduce,
    'flatten' : flatten,
    'concat' : concat,
    'difference' : difference,
    'intersection' : intersection
  };

  return processor;
};

