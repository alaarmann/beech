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
    aStrategy.apply(null, [aContext, [aScalar], aResult, aCurrentLevel]);
  };

  var processArray = function(aArray, aResult, aContext, aStrategy, aCurrentLevel){
    var index;
    var each;
    var arrayLength = aArray.length;

    for (index = 0; index < arrayLength;index += 1) {
      each = aArray[index];
      if(!isArray(each)){
        each = [each];
      }
      aStrategy.apply(null, [aContext, each, aResult, aCurrentLevel]);
    }
  };

  var processOwnedMembersOf = function(aCollection, aResult, aContext, aStrategy, aCurrentLevel){
    var each;

    for (each in aCollection) {
      if (!aCollection.hasOwnProperty(each)) {
        continue;
      }
      aStrategy.apply(null, [aContext, [each, aCollection[each]], aResult, aCurrentLevel]);
    }
  };

  if(isScalar(aCollection)){
    processScalar(aCollection, aResult, aContext, aStrategy, aCurrentLevel);
  } else if (isArray(aCollection)){
    processArray(aCollection, aResult, aContext, aStrategy, aCurrentLevel);
  } else {
    processOwnedMembersOf(aCollection, aResult, aContext, aStrategy, aCurrentLevel);
  }
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


  processOwnedMembers = function (thisArg, processFunction) {
    var context = typeof thisArg !== 'undefined' ? thisArg : null ;
    var processed = [];
    var rootLevel = 1;

    processCollection(currentCollection, processed, context, processFunction, rootLevel);
    currentCollection = processed;
    return processor;
  };

  map = function (functionArg, thisArg) {
    return processOwnedMembers(thisArg, 
      function(aContext, aArray, aResultCollection){
        aResultCollection.push(functionArg.apply(aContext, aArray));
    });
  };

  filter = function (functionArg, thisArg) {
    return processOwnedMembers(thisArg, 
      function(aContext, aArray, aResultCollection){
        if (functionArg.apply(aContext, aArray)){
          aResultCollection.push(aArray);
        }
    });
  };

  reduce = function (startValueArg, functionArg, thisArg) {
    var accumulator = startValueArg;
    return processOwnedMembers(thisArg, 
      function(aContext, aArray, aResult){
        accumulator = functionArg.apply(aContext, [accumulator].concat(aArray));
        aResult.push(accumulator);
    });
  };

  flatten = function (aLevel) {
    var isLevelReached = function(aLevelToCheck){
      return typeof aLevel !== 'undefined' && aLevelToCheck > aLevel; 
    };

    var flattenStrategy = function(aContext, aArray, aResultCollection, aCurrentLevel){
      if (isLevelReached(aCurrentLevel)){
        aResultCollection.push(aArray);
        return;
      }
      if (aArray.length === 1 && isScalar(aArray[0])){
        aResultCollection.push(aArray[0]);
        return;
      }
      if (aArray.length === 1 && !isScalar(aArray[0])){
        return processCollection(aArray[0], aResultCollection, undefined, flattenStrategy, aCurrentLevel + 1);
      }
      return processCollection(aArray, aResultCollection, undefined, flattenStrategy, aCurrentLevel + 1);
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

