/*
 * Beech 
 * Object-tree processor
*/

/*jshint         strict : true, browser : false,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, undef : true,
  white  : true
*/
/*globals module */

module.exports = (function () {
  'use strict';

  var create = function (plainObject){
      var result = {};

      result.applyToEach = function (functionArg, thisArg) {
        var thisToUse = typeof thisArg !== 'undefined' ? thisArg : this ;
        var each ;

        for (each in plainObject) {
          if (!plainObject.hasOwnProperty(each)) {
            continue;
          }
	  functionArg.apply(thisToUse, [each, plainObject[each]]);
        }
        return result;
      };

      return result;
    };
 
  return create;
}());
