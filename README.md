Beech
=====

A JavaScript object-tree processor

## Installation

  `npm install beech --save`

## Usage

```javascript
  var createBeechObjectTreeProcessor = require('beech');

  var collection = {
    'one' : 1,
    'two' : function () {},
    'three' : 'A string value'
  };

  var processIt = function (key, value) {
    console.log ("Processing key " + key);
  };

  var processor = createBeechObjectTreeProcessor(collection);

  processor.applyToEach(processIt);


```

## Tests

  `npm test`


## License

Published under the MIT-License, see [LICENSE-MIT.txt](https://github.com/alaarmann/beech/blob/master/LICENSE-MIT.txt) file.


## Contact

Your feedback is appreciated, please e-mail me at [alaarmann@gmx.net](mailto:alaarmann@gmx.net)

## Release History

* 0.1.0 Initial release
