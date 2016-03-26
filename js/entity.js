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
        description: "",
        x: 0,
        y: 0,
        area: null,
        isAlive: true,
        speed: 1
    };

    // apply defaults into our template where needed
    properties = applyDefaults(properties, defaults);

    // Call the glyph's constructor with composite template
    Game.DynamicGlyph.call(this, properties);


};
Game.Entity.extend(Game.DynamicGlyph);

Game.Entity.prototype.getSpeed = function() {       // required for ROT.Scheduler.Speed
    return this.speed;
};

Game.Entity.prototype.setLocation = function(x, y, area) {

    var oldArea;
    if (this.area) {
        oldArea = this.area;
    } else {
        oldArea = area;
    }

    // if we are not passing in an area, assume our current area
    if (!area) {
        area = this.area;
    }

    // check that we are being placed in an empty location
    // if not, try to find one as close as possible
    if (!area.map.isEmptyFloor(x, y)) {
        var foundEmptyTile = false;
        var radius = 1;
        var tilesToCheck, tile, len;

        while (!foundEmptyTile) {
            tilesToCheck = area.map.getTilesWithinRadius(x, y, radius);
            len = tilesToCheck.length;
            for (var i = 0; i < len; i++) {
                tile = tilesToCheck[i];
                if (area.map.isEmptyFloor(tile.x, tile.y)) {
                    foundEmptyTile = true;
                    x = tile.x;
                    y = tile.y;
                    break;
                }
            }
            radius++;
        }
    }

    // handle the entities key deletions and additions
    oldArea.updateEntityLocation(this, x, y, area);

    // player-specific code is in the setLocation method of the Player prototype

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
    if (this === Game.player) {
        this.act();
    } else {
        this.area.removeEntity(this);
    }
};


