/**
 * Created by jreel on 3/28/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

/* ENTITY = living (player, creature) or scripted (doors, traps, projectiles) thing
    usually with actions and behaviors of some sort.
 */

Game.Entity = function Entity(properties) {
    var defaults = {
        name: "entity",
        description: "This is either a creature-like object, or an object-like creature.",
        x: 0,
        y: 0,
        level: null,
        isAlive: true
    };

    // apply defaults into our template where needed
    properties = applyDefaults(properties, defaults);

    // Call the glyph's constructor with composite template
    Game.DynamicGlyph.call(this, properties);


};
Game.Entity.extend(Game.DynamicGlyph);


Game.Entity.prototype.setPosition = function(x, y) {
    var oldX = this.x;
    var oldY = this.y;
    // update position
    this.x = x;
    this.y = y;
    // if the entity is on a level, notify the level that the entity has moved
    if (this.level) {
        this.level.updateEntityPosition(this, oldX, oldY);
    }
};

Game.Entity.prototype.kill = function(message) {
    // only kill once!
    if (!this.isAlive) {
        return;
    }
    this.isAlive = false;
    Game.sendMessage('danger', this, message ? message : "You have died!");

    // check if it was the player who died, and if so
    // call their act method to handle things
    if (this === Game.thePlayer) {
        this.act();
    } else {
        this.level.removeEntity(this);
    }
};


