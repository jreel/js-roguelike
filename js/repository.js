/**
 * Created by jreel on 4/7/2015.
 */

// A repository has a name and a constructor. The constructor is used
// to create items in the repository.
//
// Optionally, this can also accept an object which is a collection
// of appropriate templates.

Game.Repository = function(name, cnstr, collection) {
    this._name = name;
    this._templates = {};
    this._cnstr = cnstr;

    if (collection) {
        var coll = Object.keys(collection);
        for (var k = 0; k < coll.length; k++) {
            var tempName = coll[k];
            this._templates[tempName] = collection[tempName];
        }
    }
};

// Define a new named template
Game.Repository.prototype.define = function(name, template) {
    this._templates[name] = template;
};

// Create an object based on a template
Game.Repository.prototype.create = function(name) {
    // Make sure there is a template with the given name.
    var template = this._templates[name];

    if (!template) {
        throw new Error("No template named '" + name + "' in repository '" + this._name + "'");
    }

    // Create the object, passing the template as an argument
    return new this._cnstr(template);
};

// Create an object based on a random template
Game.Repository.prototype.createRandom = function() {
    // Pick a random key and create an object based off of it.
    // TODO: implement tables / weighted random
    var temps = Object.keys(this._templates);
    temps = temps.randomize();
    var obj = temps.random();
    return this.create(obj);
};
