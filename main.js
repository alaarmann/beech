/*
 * Beech 
 * Object-tree processor
*/

/*globals module */

module.exports = function (plainObject){
  'use strict';
  var map;
  var processor;

  map = function (functionArg, thisArg) {
    var thisToUse = typeof thisArg !== 'undefined' ? thisArg : null ;
    var each ;

    for (each in plainObject) {
      if (!plainObject.hasOwnProperty(each)) {
        continue;
      }
      functionArg.apply(thisToUse, [each, plainObject[each]]);
    }
    return processor;
  };

  processor = {
    'map' : map
  };

  return processor;
};

