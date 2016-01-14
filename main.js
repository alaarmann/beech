/*
 * Beech 
 * Object-tree processor
*/

/*globals module */

module.exports = function (aCollection){
  'use strict';
  var currentCollection = aCollection || {};
  var processor;
  var processOwnedMembers;
  var map;
  var filter;

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

  processor = {
    'map' : map,
    'filter' : filter
  };

  return processor;
};

