/*
 * Beech 
 * Object-tree processor
*/

/*globals module */

var isScalar = function(aCandidate){
  'use strict';
  return (/^string|number|boolean|function$/).test(typeof aCandidate);
};

module.exports = function (aCollection){
  'use strict';
  var currentCollection = aCollection || {};
  var processor;
  var processOwnedMembers;
  var map;
  var filter;
  var reduce;

  // produce consistent internal root of collection
  if(isScalar(aCollection)){
    currentCollection = {'0' : aCollection};
  } else {
    currentCollection = aCollection || {};
  }

  processOwnedMembers = function (thisArg, processFunction) {
    var context = typeof thisArg !== 'undefined' ? thisArg : null ;
    var each ;
    var processed = {};

    for (each in currentCollection) {
      if (!currentCollection.hasOwnProperty(each)) {
        continue;
      }
      processFunction.apply(null, [context, each, currentCollection[each], processed]);
    }
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

  processor = {
    'map' : map,
    'filter' : filter,
    'reduce' : reduce
  };

  return processor;
};

