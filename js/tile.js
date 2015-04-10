/**
 * Created by jreel on 3/27/2015.
 * Thanks to the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// TODO: different tilesets, possibly repository system?
Game.Tile = function(properties) {
    properties = properties || {};
    // Call the Glyph constructor with our properties
    Game.Glyph.call(this, properties);

    // Set up defaults for the properties.
    this.isWalkable = properties['isWalkable'] || false;
    this.isDiggable = properties['isDiggable'] || false;
    this.isTransparent = properties['isTransparent'] || false;
    this.canSpawnHere = properties['canSpawnHere'] || false;
};

// Make tiles inherit all the functionality from glyphs
Game.Tile.extend(Game.Glyph);

Game.Tile.prototype.darken = function() {
    // TODO: alternative darken colors for different tilesets
    var fg = ROT.Color.fromString(this.foreground);
    var bg = ROT.Color.fromString(this.background);
    var darkfg = ROT.Color.toHex(ROT.Color.interpolate(fg, [0,0,0]));
    var darkbg = ROT.Color.toHex(ROT.Color.interpolate(bg, [0,0,0]));
    return {foreground: darkfg, background: darkbg};
};


// move these to separate data file (template system)
// at some point

/*
 Ideas for tileset templates
 template similar to e.g., monster templates
 however, each will need to be a collection of different
 floorTiles, wallTile, bedrockTile, etc.

 Some ideas:
 - cave (already done)
 - muddy cave
 - black/stone cave
 - fiery cave
 - ice cave
 - desert

 Perhaps a new steppedOn method, that functions similarly
 to the monsters behavior property?
 Possible examples:
 - damage (e.g., lava, brambles)
 - slide (ice)
 - slow (mud, snow?)
 - teleport (could be used for stair tiles too)
 */

Game.Tile.nullTile = new Game.Tile({});

Game.Tile.floorTile = new Game.Tile({
    character: '.',
    foreground: '#777',
    isWalkable: true,
    isDiggable: false,
    canSpawnHere: true,
    isTransparent: true
});

Game.Tile.wallTile = new Game.Tile({
    character: '#',
    foreground: '#976',
    background: '#643',
    isWalkable: false,
    isDiggable: true,
    isTransparent: false
});

Game.Tile.bedrockTile = new Game.Tile({
    character: '#',
    foreground: '#222',
    background: '#333',
    isWalkable: false,
    isDiggable: false,
    isTransparent: false
});

Game.Tile.prevLevelTile = new Game.Tile({
    character: '<',
    foreground: 'goldenrod',
    isWalkable: true,
    canSpawnHere: false,
    isTransparent: true
});

Game.Tile.nextLevelTile = new Game.Tile({
    character: '>',
    foreground: 'goldenrod',
    isWalkable: true,
    canSpawnHere: false,
    isTransparent: true
});

