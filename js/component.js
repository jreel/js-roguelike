/**
 * Created by Jessica on 4/4/2015.
 */

Game.prototype.addComponent = function (component) {
    // if we already have the component, we don't need to do anything
    if (this.components[component]) {
        return true;
    }

    for (var prop in component) {
        if (component.hasOwnProperty(prop) && prop != 'members') {
            this[prop] = component[prop];
        }
    }
    // component.members.push(this);

    // place a reference to the component on the object
    if (!this.components) {
        this.components = [];
    }
    this.components.push(component);
};

Game.prototype.removeComponent = function (component) {
    // if we don't have this component, don't do anything
    if (!this.components || !this.components[component]) {
        return true;
    }
    var index = this.components.indexOf(component);
    if (index > -1) {
        this.components.splice(index, 1);
    }
};

Game.Components = { };

Game.Components.destructible = {
    members: []
};
