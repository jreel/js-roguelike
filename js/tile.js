/**
 * Created by jreel on 3/27/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// TODO: different tilesets, possibly repository system?
Game.Tile = function(properties) {
    var defaults = {
        description: '',
        isWalkable: false,
        isBreakable: false,
        passesLight: false
    };

    // apply defaults into our template where needed
    properties = applyDefaults(properties, defaults);

    // Call the Glyph constructor with the composite properties
    Game.Glyph.call(this, properties);

};

// Make tiles inherit all the functionality from glyphs
Game.Tile.extend(Game.Glyph);


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

Game.Tile.nullTile = new Game.Tile({description: '(unknown)'});

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
    foreground: '#ca6',     // close to 'goldenrod'
    isWalkable: true,
    canSpawnHere: false,
    isTransparent: true
});

Game.Tile.nextLevelTile = new Game.Tile({
    character: '>',
    foreground: '#ca6',
    isWalkable: true,
    canSpawnHere: false,
    isTransparent: true
});

Game.Tile.holeToCavernTile = new Game.Tile({
    character: '◯',
    foreground: '#322',
    isWalkable: true,
    canSpawnHere: false,
    isTransparent: true
});

Game.Tile.waterTile = new Game.Tile({
    character: '≈',
    foreground: '#08c',
    isWalkable: false,
    canSpawnHere: false,
    isTransparent: true
});

Game.Tile.corridorTile = new Game.Tile({
    character: '.',
    foreground: '#777',
    isWalkable: true,
    isDiggable: false,
    canSpawnHere: true,
    isTransparent: true
});

Game.Tile.closedDoorTile = new Game.Tile({
    character: '+',
    foreground: '#941',
    isWalkable: false,
    isDiggable: false,
    canSpawnHere: false,
    isTransparent: false
});
