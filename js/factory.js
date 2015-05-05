/**
 * Created by jreel on 4/7/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// A factory has a name and a constructor. The constructor is used
// to create items in the factory.
//
// Optionally, this can also accept an object which is a collection
// of appropriate templates. This is so I wouldn't have to re-format all of
// my own templates to use this syntax after having already done it MY way. :P

Game.Factory = function(name, constructor, collection) {
    this._name = name;
    this._templates = {};
    this._randomTemplates = {};
    this._constructor = constructor;

    if (collection) {
        var coll = Object.keys(collection);
        for (var k = 0; k < coll.length; k++) {
            var template = coll[k];
            this._templates[template] = collection[template];
            if (!collection[template]['noRandom']) {
                this._randomTemplates[template] = collection[template];
            }
        }
    }
};

// add a new named template
Game.Factory.prototype.define = function(name, template) {
    this._templates[name] = template;
    if (!template['noRandom']) {
        this._randomTemplates[name] = template;
    }
};

// Create an object based on a template
Game.Factory.prototype.create = function(name, extraProperties) {
    // Make sure there is a template with the given name.
    if (!this._templates[name]) {
        throw new Error("No template named '" + name + "' in factory '" + this._name + "'");
    }

    // copy the template to apply extraProperties if needed
    var template;
    if (extraProperties) {
        template = copyWithChanges(this._templates[name], extraProperties);
    } else {
        template = this._templates[name];
    }

    // Create the object, passing the template as an argument
    return new this._constructor(template);
};

// Create an object based on a random template
Game.Factory.prototype.createRandom = function randObj() {
    // Pick a random key and create an object based off of it.
    // TODO: implement tables / weighted random
    var templates = Object.keys(this._randomTemplates);
    templates = templates.randomize();
    var obj = templates.random();
    return this.create(obj);
};
