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

var processRawCollection = function(aCollection, aResult, aContext, aStrategy, aCurrentLevel) {
  'use strict';

  var processScalar = function(aScalar, aResult, aContext, aStrategy, aCurrentLevel){
    aResult = aStrategy.apply(null, [aContext, {'value' : aScalar}, aResult, aCurrentLevel]);
    return aResult;
  };

  var processArray = function(aArray, aResult, aContext, aStrategy, aCurrentLevel){
    var index;
    var arrayLength = aArray.length;

    for (index = 0; index < arrayLength;index += 1) {
      aResult = aStrategy.apply(null, [aContext, {'value' : aArray[index]}, aResult, aCurrentLevel]);
    }
    return aResult;
  };

  var processOwnedMembersOf = function(aCollection, aResult, aContext, aStrategy, aCurrentLevel){
    var each;

    for (each in aCollection) {
      if (!aCollection.hasOwnProperty(each)) {
        continue;
      }
      aResult = aStrategy.apply(null, [aContext, {'key' : each, 'value' : aCollection[each]}, aResult, aCurrentLevel]);
    }
    return aResult;
  };

  if(isScalar(aCollection)){
    return processScalar(aCollection, aResult, aContext, aStrategy, aCurrentLevel);
  } else if (isArray(aCollection)){
    return processArray(aCollection, aResult, aContext, aStrategy, aCurrentLevel);
  } else {
    return processOwnedMembersOf(aCollection, aResult, aContext, aStrategy, aCurrentLevel);
  }
};

/*
 * Function processes 'beech collection' (array of objects that have member 'value' and possibly also 'key')
 */
var processBeechCollection = function(aArray, aResult, aContext, aStrategy, aCurrentLevel) {
  'use strict';

  var index;
  var arrayLength = aArray.length;

  for (index = 0; index < arrayLength;index += 1) {
    aResult = aStrategy.apply(null, [aContext, aArray[index], aResult, aCurrentLevel]);
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

var isKeyValue = function(aItem){
  'use strict';
  return aItem.hasOwnProperty('key') && aItem.hasOwnProperty('value');
};

/* 
 * Function is responsible for processing a single item
*/
var processItem = function(aContext, aFunction, aItem){
  'use strict';
  var argumentArray = createArgumentArray(aItem);
  return aFunction.apply(aContext, argumentArray);
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

  // Initial state is a 'raw' JavaScript-collection
  processCollection = processRawCollection;

  applyToCollection = function (thisArg, processFunction, aEmptyResultCollection) {
    var context = typeof thisArg !== 'undefined' ? thisArg : null ;
    var resultCollection = aEmptyResultCollection || [];
    var rootLevel = 1;

    currentCollection = processCollection(currentCollection, resultCollection, context, processFunction, rootLevel);

    if (processCollection === processRawCollection){
      processCollection = processBeechCollection;
    }
    return processor;
  };

  map = function (aFunction, aContext) {
    var mapStrategy = function(aContext, aItem, aResultCollection){
      var resultValue = processItem(aContext, aFunction, aItem);
      // TODO: this is arbitrary. What about using this.context in aFunction for delivering this.key and this.value?
      if (isKeyValue(aItem) && isArray(resultValue) && resultValue.length === 2){
        resultValue = {key : resultValue[0], value :  resultValue[1]};
      } else {
        resultValue = {value :  resultValue};
      }
      aResultCollection.push(resultValue);
      return aResultCollection;
    };
    return applyToCollection(aContext, mapStrategy);
  };

  filter = function (aFunction, aContext) {
    var filterStrategy = function(aContext, aItem, aResultCollection){
      if (processItem(aContext, aFunction, aItem)){
        aResultCollection.push(aItem);
      }
      return aResultCollection;
    };

    return applyToCollection(aContext, filterStrategy);
  };

  reduce = function (startValueArg, functionArg, thisArg) {
    var accumulator = {};
    accumulator.value = startValueArg;
    var reduceStrategy = function(aContext, aItem){
      accumulator.value = functionArg.apply(aContext, [accumulator.value].concat(createArgumentArray(aItem)));
      return [accumulator];
    };

    return applyToCollection(thisArg, reduceStrategy);
  };

  flatten = function (aLevel) {
    var isLevelReached = function(aLevelToCheck){
      return typeof aLevel !== 'undefined' && aLevelToCheck > aLevel; 
    };

    var flattenStrategy = function(aContext, aItem, aResultCollection, aCurrentLevel){
      var item = createCanonicalItem(aItem);

      if (isScalar(item) || isLevelReached(aCurrentLevel)){
        // root level in output is always a 'beech' collection
        aResultCollection.push(aItem);
        return aResultCollection;
      }
      // next level is always a 'raw' JavaScript collection
      return processRawCollection(item, aResultCollection, undefined, flattenStrategy, aCurrentLevel + 1);
    };
    return applyToCollection(undefined, flattenStrategy); 
  };

  processor = {
    'map' : map,
    'filter' : filter,
    'reduce' : reduce,
    'flatten' : flatten
  };

  return processor;
};

