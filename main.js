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

var processCollection = function(aCollection, aResult, aContext, aStrategy, aCurrentLevel) {
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

module.exports = function (aCollection){
  'use strict';
  var currentCollection = aCollection || [];
  var processor;
  var processOwnedMembers;
  var map;
  var filter;
  var reduce;
  var flatten;


  processOwnedMembers = function (thisArg, processFunction, aEmptyResultCollection) {
    var context = typeof thisArg !== 'undefined' ? thisArg : null ;
    var resultCollection = aEmptyResultCollection || [];
    var rootLevel = 1;

    currentCollection = processCollection(currentCollection, resultCollection, context, processFunction, rootLevel);
    return processor;
  };

  map = function (aFunction, aContext) {
    var mapStrategy = function(aContext, aItem, aResultCollection){
      aResultCollection.push(processItem(aContext, aFunction, aItem));
      return aResultCollection;
    };
    return processOwnedMembers(aContext, mapStrategy);
  };

  filter = function (aFunction, aContext) {
    var emptyResultCollection;
    // if hash, keep the type
    // TODO: also keep SCALAR?
    if (!isScalar(currentCollection) && !isArray(currentCollection)){
      emptyResultCollection = {};
    }
    var filterStrategy = function(aContext, aItem, aResultCollection){
      if (processItem(aContext, aFunction, aItem)){
        if (!isScalar(aResultCollection) && !isArray(aResultCollection)){ // is hash
          aResultCollection[aItem.key] = aItem.value; 
        } else {
          aResultCollection.push(aItem);
        }
      }
      return aResultCollection;
    };

    return processOwnedMembers(aContext, filterStrategy, emptyResultCollection);
  };

  reduce = function (startValueArg, functionArg, thisArg) {
    var accumulator = startValueArg;
    var reduceStrategy = function(aContext, aItem){
      accumulator = functionArg.apply(aContext, [accumulator].concat(createArgumentArray(aItem)));
      return accumulator;
    };

    return processOwnedMembers(thisArg, reduceStrategy);
  };

  flatten = function (aLevel) {
    var isLevelReached = function(aLevelToCheck){
      return typeof aLevel !== 'undefined' && aLevelToCheck > aLevel; 
    };

    var flattenStrategy = function(aContext, aItem, aResultCollection, aCurrentLevel){
      var item = createCanonicalItem(aItem);

      if (isScalar(item) || isLevelReached(aCurrentLevel)){
        aResultCollection.push(item);
        return aResultCollection;
      }
      return processCollection(item, aResultCollection, undefined, flattenStrategy, aCurrentLevel + 1);
    };
    return processOwnedMembers(undefined, flattenStrategy); 
  };

  processor = {
    'map' : map,
    'filter' : filter,
    'reduce' : reduce,
    'flatten' : flatten
  };

  return processor;
};

