/**
 * Created by jreel on 3/29/2015.
 */

// augment function (mainly for use with mixins)
// copies properties from source to destination.prototype
//
// why destination.prototype instead of simply destination?
// augment will usually be called on a "class",
// i.e., the constructor function.
// therefore, any functions/methods in source will
// end up on the prototype and not on the class itself.
// same with any properties/state values.
// as a bonus, such state values and methods can be overridden with
// template values that are passed in to the constructor for new instances.
function augment(destination, source) {
    for (var prop in source) {
        if (source.hasOwnProperty(prop) && destination.prototype[prop] !== source[prop]) {
            destination.prototype[prop] = source[prop];
        }
    }
}



// Return a random integer between min and max
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Return a random integer from a normal distribution
function randomNormalInt(mean, std) {
    return Math.floor(ROT.RNG.getNormal(mean, std));
}

// Given a hashtable of values and chances, return a weighted random value
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
            totalChance += table[tableKeys[i]];
        }
    }

    // roll a random value up to the totalChance
    // iterate through the table, incrementing the chance
    // by the appropriate amount each time and checking
    var roll = randomInt(1, totalChance);
    var chance = 0;
    for (var j = 0; j < tableKeys.length; j++) {
        chance += table[tableKeys[i]];
        if (roll <= chance) {
            return tableKeys[i];
        }
    }

    // this should never happen
    throw new Error("function weightedRandom did not return appropriately.");
}

