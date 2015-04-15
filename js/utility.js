/**
 * Created by jreel on 3/29/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

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
if (typeof Array.prototype.reIndexOf === 'undefined') {
    Array.prototype.reIndexOf = function (rx) {
        for (var i in this) {
            if (this[i].toString().match(rx)) {
                return i;
            }
        }
        return -1;
    };
}

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


// Return a random integer between min and max
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Return a random integer from a normal distribution
function randomNormalInt(mean, std) {
    return Math.floor(ROT.RNG.getNormal(mean, std));
}

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

