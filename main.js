/*
 * Beech 
 * Object-tree processor
*/

/*globals module */

var isScalar = function(aCandidate){
  'use strict';
  return (/^string|number|boolean|function$/).test(typeof aCandidate);
};

var processOwnedMembersOf = function(aCollection, aResult, aContext, aStrategy){
  'use strict';
  var each;

  for (each in aCollection) {
    if (!aCollection.hasOwnProperty(each)) {
      continue;
    }
    aStrategy.apply(null, [aContext, each, aCollection[each], aResult]);
  }
};

module.exports = function (aCollection){
  'use strict';
  var currentCollection = aCollection || {};
  var processor;
  var processOwnedMembers;
  var map;
  var filter;
  var reduce;
  var flatten;

  // produce consistent internal root of collection
  if(isScalar(aCollection)){
    currentCollection = {'0' : aCollection};
  } else {
    currentCollection = aCollection || {};
  }

  processOwnedMembers = function (thisArg, processFunction) {
    var context = typeof thisArg !== 'undefined' ? thisArg : null ;
    var processed = {};

    processOwnedMembersOf(currentCollection, processed, context, processFunction);
    currentCollection = processed;
    return processor;
  };

  map = function (functionArg, thisArg) {
    return processOwnedMembers(thisArg, 
      function(aContext, aKey, aValue, aResultCollection){
        aResultCollection[aKey] = functionArg.apply(aContext, [aKey, aValue]);
    });
  };

  filter = function (functionArg, thisArg) {
    return processOwnedMembers(thisArg, 
      function(aContext, aKey, aValue, aResultCollection){
        if (functionArg.apply(aContext, [aKey, aValue])){
          aResultCollection[aKey] = aValue;
        }
    });
  };

  reduce = function (startValueArg, functionArg, thisArg) {
    var accumulator = startValueArg;
    return processOwnedMembers(thisArg, 
      function(aContext, aKey, aValue, aResultCollection){
        accumulator = functionArg.apply(aContext, [aKey, aValue, accumulator]);
        aResultCollection[0] = accumulator;
    });
  };

  flatten = function () {
    var counter = 0;
    var flattenStrategy = function(aContext, aKey, aValue, aResultCollection){
      if (isScalar(aValue)){
        aResultCollection[counter.toString()] = aValue;
        counter += 1;
        return;
      }
      return processOwnedMembersOf(aValue, aResultCollection, undefined, flattenStrategy);
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

