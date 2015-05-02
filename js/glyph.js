/**
 * Created by jreel on 3/27/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// TODO: do we need a repository system for this as well?
Game.Glyph = function(properties) {
    // this is the base "object" for the whole game
    // Instantiate properties to default if they weren't passed in
    var defaults = {
        character: ' ',
        foreground: '#fff',
        background: ''
    };

    properties = applyDefaults(properties, defaults);

    /* let's try something */
    var props = Object.keys(properties);
    for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (!this.hasOwnProperty(prop)) {
            this[prop] = properties[prop];
        }
    }
};

Game.Glyph.prototype.getGlyph = function() {
    return "%c{" + this.foreground + "}%b{" + this.background + "}" + this.character + "%c{}%b{}";
};


// 'Dynamic' Glyph = a glyph that handles mixins
// (not sure why we don't just put this on the Glyph object itself;
// we may want to at some point in order to extend the Tile object too)
Game.DynamicGlyph = function(properties) {
    var defaults = {
        name: "thing",
        description: "Who knows what this thing is?",
        listeners: {}       // "event subscription" sort of thingy
    };

    // apply defaults into our template where needed
    properties = applyDefaults(properties, defaults);

    // call Glyph constructor with composite template
    Game.Glyph.call(this, properties);

    // mixins-handling stuff

    // get an array of all mixins in game
    var allMixins = Object.keys(Game.Mixins);
    for (var m = 0; m < allMixins.length; m++) {
        var mixinKey = allMixins[m];
        var mixinSource = Game.Mixins[mixinKey];
        // for each one, see if we have a same-named property in the template
        // or template may have a key set to false to override constructor defaults and NOT have the mixin
        if (properties.hasOwnProperty(mixinKey) && (properties[mixinKey] !== false)) {
            // now, for this mixin that we want, get an array of its defined properties
            var mixinProps = Object.keys(mixinSource);
            for (var i = 0; i < mixinProps.length; i++) {
                var prop = mixinProps[i];
                // for each mixin property, if we don't already have it,
                // (and it's not the 'init' or 'listeners' properties)
                // add it to this
                if (prop != 'init' && prop != 'listeners' && !this.hasOwnProperty(prop)) {
                    this[prop] = mixinSource[prop];
                }
            }
            // add the mixin listeners to our listeners array (if not already there)
            if (mixinSource.listeners) {
                var listenerEvents = Object.keys(mixinSource.listeners);
                for (var e = 0; e < listenerEvents.length; e++) {
                    var event = listenerEvents[e];
                    // if we don't already have a key for this event in our
                    // listeners array, add it
                    if (!this.listeners.hasOwnProperty(event)) {
                        this.listeners[event] = [];
                    }
                    // if we don't already have the listener function, add it
                    var listenerFunc = mixinSource.listeners[event];
                    if (this.listeners[event].indexOf(listenerFunc) === -1) {
                        this.listeners[event].push(listenerFunc);
                    }
                }
            }
            // call init function if there is one
            if (mixinSource.init) {
                mixinSource.init.call(this, properties[mixinKey]);
            }
            // after properties are passed to init function, we don't need to store the
            // template/mixin init properties anymore.
            delete this[mixinKey];
        }
    }

 };
Game.DynamicGlyph.extend(Game.Glyph);

Game.DynamicGlyph.prototype.raiseEvent = function(event) {      // used to alert "subscribed" listeners
    //console.log('raiseEvent function called by ' + this.name);
    // make sure we have at least one listener; if not, exit
    if (!this.listeners[event]) {
        return;
    }
    // extract any arguments passed after the event name
    //console.log(arguments);
    var args = Array.prototype.slice.call(arguments, 1);
    // invoke each listener, with this entity as the context, using the passed args
    //console.log(this.listeners[event]);
    //console.log(this.listeners[event].length);
    for (var i = 0; i < this.listeners[event].length; i++) {
        //console.log(this.listeners[event][i]);
        this.listeners[event][i].apply(this, args);
    }
};

Game.DynamicGlyph.prototype.describe = function(capitalize) {
    var string = this.name;
    var initial = string.charAt(0);
    if (capitalize) {
        initial = initial.toUpperCase();
    }
    return initial + string.slice(1);
};
Game.DynamicGlyph.prototype.describeA = function(capitalize) {
    // optional parameter to capitalize the a/an
    var prefixes = capitalize ? ['A', 'An'] : ['a', 'an'];
    var string = this.describe();
    var firstLetter = string.charAt(0);
    firstLetter = firstLetter.toLowerCase();

    // if word starts with a vowel use 'an', else use 'a'.
    // (note that this is not perfect.)
    var prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
    return prefixes[prefix] + ' ' + string;
};
Game.DynamicGlyph.prototype.describeThe = function(capitalize) {
    var prefix = capitalize ? 'The' : 'the';
    return prefix + ' ' + this.describe();
};