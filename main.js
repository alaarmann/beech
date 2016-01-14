/*
 * Beech 
 * Object-tree processor
*/

/*globals module */

module.exports = function (aCollection){
  'use strict';
  var currentCollection = aCollection || {};
  var processor;
  var map;
  var filter;

  map = function (functionArg, thisArg) {
    var thisToUse = typeof thisArg !== 'undefined' ? thisArg : null ;
    var each ;
    var processed = {};

    for (each in currentCollection) {
      if (!currentCollection.hasOwnProperty(each)) {
        continue;
      }
      processed[each] = functionArg.apply(thisToUse, [each, currentCollection[each]]);
    }
    currentCollection = processed;
    return processor;
  };

  filter = function (functionArg, thisArg) {
    var thisToUse = typeof thisArg !== 'undefined' ? thisArg : null ;
    var each ;
    var processed = {};

    for (each in currentCollection) {
      if (!currentCollection.hasOwnProperty(each)) {
        continue;
      }
      if (functionArg.apply(thisToUse, [each, currentCollection[each]])){
        processed[each] = currentCollection[each];
      }
    }
    currentCollection = processed;
    return processor;
  };

  processor = {
    'map' : map,
    'filter' : filter
  };

  return processor;
};

