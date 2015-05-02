/**
 * Created by jreel on 3/29/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */


// easy way to check/assign defaults for function parameters
function defaultTo(parameter, defaultValue) {
    return (typeof parameter == 'undefined') ? defaultValue : parameter;
}

// numeric comparator for array.sort() function
function sortNumber (a, b) {
    return a - b;
}

// check if n is a power of 2
function isPowerOf2(n) {
    if (isNaN(n)) {return false;}
    return ((n !== 0) && !(n & (n - 1)));
}

// get closest power of 2
function nearestPowerOf2(n) {
    if (isPowerOf2(n)) { return n; }
    //return Math.pow(2, Math.round(Math.log(n) / Math.LN2));
    return 1 << (Math.round(Math.log(n) / Math.LN2));
}

// get an array of object keys, sorted by the values
// from http://www.ifadey.com/2013/04/sort-javascript-object-by-key-or-value/
function getKeysSortedByValue(obj) {
    var keys = [];

    // first own property names are extracted,
    // then the map method is used to transform each
    // key-value pair into an array [key, value].
    // In the end, map returns a 2D array in which
    // the outer array contains all the smaller
    // [key, value] arrays.
    // The 2D array is then sorted on index [1]
    // (because this is where the value is stored).
    // The final keys array is made in the forEach.
    Object.keys(obj)
        .map(function(k) {
                 return [k, obj[k]];
             }
    )
        .sort(function(a, b) {
                  if (a[1] < b[1]) {return -1;}
                  if (a[1] > b[1]) {return 1;}
                  return 0;
              }
    )
        .forEach(function(d) {
                     keys.push(d[0]);
                 }
    );
    //now keys array contain keys of obj in sorted order of values
    return keys;
}

function getSortedValues(obj, sortfn) {
    var values = [];
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            values.push(obj[prop]);
        }
    }
    values.sort(sortfn);
    return values;
}

// swap two elements in an array
// from nolithius dodworldgen
// https://code.google.com/p/dance-of-death-worldgen/source/browse/trunk/src/com/nolithius/dodworldgen/utils/ArrayUtils.as
Array.prototype.swap = Array.prototype.swap || function(firstIndex, secondIndex) {
    var temp = this[firstIndex];
    this[firstIndex] = this[secondIndex];
    this[secondIndex] = temp;
};

// given an array, normalize as a percent of the largest value
function normalizeArray(array) {

    /*
    var ratio = Math.max.apply(Math, array) / 100;

    var normalizedArray = array.map(function(v) {
        return v / ratio;
    });
    */
    var len = array.length;

    // find the largest value in data
    var largest = -Infinity;
    for (var i = 0; i < len; i++) {
        if (array[i] > largest) {
            largest = array[i];
        }
    }

    // normalize
    var results = new Array(len);
    for (i = 0; i < len; i++) {
        results[i] = array[i] / largest;
    }
    return results;
};

// given a grid, normalize as a percent of the largest value
function normalizeGrid(data) {

    var width = data.length;
    var height = data[0].length;

    // find the largest value in data
    var largest = -Infinity;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            if (data[x][y] > largest) {
                largest = data[x][y];
            }
        }
    }

    // normalize
    var results = new Array(width);
    for (var i = 0; i < width; i++) {
        results[i] = new Array(height);
    }
    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            results[x][y] = data[x][y] / largest;
        }
    }
    return results;
};

// given a grid, scale all the data as a percent of
// the range defined by the smallest and largest values
function scaleGrid(data) {
    var width = data.length;
    var height = data[0].length;

    // find the largest and smallest values in data
    var largest = -Infinity;
    var smallest = Number.MAX_VALUE;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var d = data[x][y];
            if (d > largest) {
                largest = d;
            }
            if (d < smallest) {
                smallest = d;
            }
        }
    }

    // scale to smallest/largest
    var range = largest - smallest;
    var results = new Array(width);
    for (var i = 0; i < width; i++) {
        results[i] = new Array(height);
    }
    for (x = 0; x < width; x++) {
        for (y = 0; y < height; y++) {
            results[x][y] = (data[x][y] - smallest) / range;
        }
    }
    return results;
};


// augment function (mainly for use with mixins);
// copies properties from mixin to destination.prototype.
//
// why destination.prototype instead of simply destination?
// augment will usually be called on a "class",
// i.e., the constructor function.
// therefore, any functions/methods in mixin will
// end up on the prototype and not on the class itself.
// same with any properties/state values.
// as a bonus, such state values and methods can be overridden with
// template values that are passed in to the constructor for new instances.
function augment(destination, mixin) {
    for (var prop in mixin) {
        if (mixin.hasOwnProperty(prop) && prop != 'init' &&
            destination.prototype[prop] !== mixin[prop]) {

            destination.prototype[prop] = mixin[prop];
        }
    }
}

// uses 'defaults' to fill-in any gaps in 'template'
function applyDefaults(template, defaults) {
    if ((typeof template != 'object') || (typeof defaults != 'object')) {
        return template;
        // throw new Error("function applyDefaults: arguments are not objects.")
    }
    // apply defaults into our template where needed
    var keys = Object.keys(defaults);
    for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        if (!template.hasOwnProperty(key)) {
            template[key] = defaults[key];
        }
    }
    return template;
}

// returns a copy of 'source' that incorporates the requested 'changes'
// (right now only limited to additions or substitutions, not deletions)
// ((although I think having {key: undefined} in changes could work for deletion))
function copyWithChanges(source, changes) {
    if ((typeof source != 'object') || (typeof changes != 'object')) {
        return source;
    }
    // create new object from the source
    var newCopy = {};
    var keys = Object.keys(source);
    for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        newCopy[key] = source[key];
    }
    // now change or add any properties from the changes
    var ckeys = Object.keys(changes);
    for (var i = 0; i < ckeys.length; i++) {
        var ckey = ckeys[i];
        newCopy[ckey] = changes[ckey];
    }

    return newCopy;
}

// regular expression indexOf for arrays
// from http://creativenotice.com/2013/07/regular-expression-in-array-indexof/
Array.prototype.regexIndexOf = Array.prototype.regexIndexOf || function (rx) {
    for (var i in this) {
        if (this[i].toString().match(rx)) {
            return i;
        }
    }
    return -1;
};


// strip formatting tokens out of a ROT color-formatted string.
// note that this is implemented specifically to look for and
// strip out the tokens '%c{...}' and '%b{...}', with the contents
// inside the braces likely corresponding to an alphabetic color name
// or a #hex color code.
// (this is useful for finding the 'true' length of the formatted string)
function stripTokens(str) {
    if (typeof str != 'string') {
        return str;
    }
    var regex = /(%[bc]{[#]?[a-z\d]*?})/g;
    return str.replace(regex, '');
}


// Return a random integer between and including min and max
function randomInt(min, max) {
    return Math.floor(ROT.RNG.getUniform() * (max - min + 1)) + min;
}

// Return a random float between min (inclusive) and max (exclusive)
function randomFloat(min, max) {
    return ROT.RNG.getUniform() * (max - min) + min;
}

// Return a random integer between 0 and n-1
// (similar to python randrange() function)
function randRange(n) {
    return Math.floor(ROT.RNG.getUniform() * n);
}

// Return a random integer from a normal distribution
function randomNormalInt(mean, std) {
    return Math.floor(ROT.RNG.getNormal(mean, std));
}

// Return a random percentage (wrapper for ROT function)
function randomPercent() {
    return ROT.RNG.getPercentage();
}

// Return a random number from a normal distribution (wrapper for ROT function)
function randomNormal(mean, std) {
    return ROT.RNG.getNormal(mean, std);
}

// Gaussian probability density function
// by Olly Oechsle, http://www.ollysco.de/2012/04/gaussian-normal-functions-in-javascript.html
/**
 * Returns a normal probability density function for the given parameters.
 * The function will return the probability for given values of X
 *
 * @param {Number} [mean = 0] The center of the peak, usually at X = 0
 * @param {Number} [standardDeviation = 1.0] The width / standard deviation of the peak
 * @param {Number} [maxHeight = 1.0] The maximum height of the peak, usually 1
 * @returns {Function} A function that will return the value of the distribution at given values of X
 */
Math.getGaussianFunction = function(mean, standardDeviation, maxHeight) {

    mean = isNaN(mean) ? 0.0 : mean;
    standardDeviation = isNaN(standardDeviation) ? 1.0 : standardDeviation;
    maxHeight = isNaN(maxHeight) ? 1.0 : maxHeight;

    return function getNormal(x) {
        return maxHeight * Math.pow(Math.E, -Math.pow(x - mean, 2) / (2 * (standardDeviation * standardDeviation)));
    }
};


// Given a hashtable of values and chances, return a weighted random value.
// ideally, totalChance will have been cached as a property on the parent object
// of the table, to save calculating it each time this function is called
function weightedRandom(table, totalChance) {
    // store our table keys as its own array
    var tableKeys = Object.keys(table);
    // if totalChance was not passed in, calculate it
    // as the total of all chances
    if (!totalChance || isNaN(totalChance)) {
        totalChance = 0;
        for (var i = 0; i < tableKeys.length; i++) {
            var tableKey = tableKeys[i];
            totalChance += table[tableKey];
        }
    }
    // roll a random value up to the totalChance
    // iterate through the table, incrementing the chance
    // by the appropriate amount each time and checking
    var roll = randomInt(1, totalChance);
    var chance = 0;
    for (var j = 0; j < tableKeys.length; j++) {
        var key = tableKeys[j];
        chance += table[key];
        if (roll <= chance) {
            return key;
        }
    }

    // this should never happen
    throw new Error("function weightedRandom did not return appropriately.");
}

