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
    this._randomTemplates = {};
    this._cnstr = cnstr;

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
Game.Repository.prototype.define = function(name, template) {
    this._templates[name] = template;
    if (!template['noRandom']) {
        this._randomTemplates[name] = template;
    }
};

// Create an object based on a template
Game.Repository.prototype.create = function(name, extraProperties) {
    // Make sure there is a template with the given name.
    if (!this._templates[name]) {
        throw new Error("No template named '" + name + "' in repository '" + this._name + "'");
    }

    // copy the template to apply extraProperties if needed
    // var template = Object.create(this._templates[name]);
    // apply any extra properties
    /*
    if (extraProperties) {
        for (var key in extraProperties) {
            if (extraProperties.hasOwnProperty(key)) {
                template[key] = extraProperties[key];
            }
        }
    }
    */
    var template;
    if (extraProperties) {
        template = copyWithChanges(this._templates[name], extraProperties);
    } else {
        template = this._templates[name];
    }

    // Create the object, passing the template as an argument
    return new this._cnstr(template);
};

// Create an object based on a random template
Game.Repository.prototype.createRandom = function randObj() {
    // Pick a random key and create an object based off of it.
    // TODO: implement tables / weighted random
    var templates = Object.keys(this._randomTemplates);
    templates = templates.randomize();
    var obj = templates.random();
    return this.create(obj);
};
