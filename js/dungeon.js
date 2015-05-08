/**
 * Created by jreel on 5/7/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

/*
 DUNGEON: a collection of related and linked Areas.
 */

Game.Dungeon = function(params) {
    var defaults = {

        parentArea: null,
        parentX: 0,
        parentY: 0,

        numLevels: 1,
        levels: {}              // a collection of Areas, in the form of level#: areaRef.

    };

    // apply defaults into the params where needed
    params = applyDefaults(params, defaults);
    // and set them up on this area
    var props = Object.keys(params);
    for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        if (!this.hasOwnProperty(prop)) {
            this[prop] = params[prop];
        }
    }

    for (var j = 1; j <= this.numLevels; j++) {
        this.levels[j] = this.generateLevel();      // returns Game.Area object
        this.levels[j].id = j;
    }
    this.connectLevels();
};

Game.Dungeon.prototype.generateLevel = function(mapWidth, mapHeight, tileset) {
    // pick a random level type / generator
    // get the map from the generator and pass it to the Area constructor
    // return the area

    mapWidth = mapWidth || 64;
    mapHeight = mapHeight || 64;
    tileset = tileset || Game.Tilesets.cave;

    var tiles = Game.Generators.generateCave(mapWidth, mapWidth, tileset);
    var map  = new Game.Map(tiles, tileset);
    var newLevel = new Game.Area({  width: mapWidth,
                                    height: mapHeight,
                                    tileset: tileset,
                                    map: map,
                                    sightRadiusMultiplier: 1,
                                    biome: "DUNGEON" });

    newLevel.map.area = newLevel;
    newLevel.setupFov();

    return newLevel;
};

Game.Dungeon.prototype.connectLevels = function() {

    // TODO: some voodoo to prevent stairs in a level from generating right beside each other

    var i, prev, next, prevLevel, nextLevel;
    var currentLevel, map, stairsLoc;
    var prevArea, nextArea;
    for (i = 1; i <= this.numLevels; i++) {

        prev = i - 1;      // valid values are 1 to this.numLevels - 1
        next = i + 1;      // valid values are 2 to this.numLevels

        currentLevel = this.levels[i];

        map = currentLevel.map;

        if (next > 1 && next <= this.numLevels) {
            // make connection between level 'i' and nextLevel = stairsDown
            nextLevel = this.levels[next];

            // make the stairs down on this level
            stairsLoc = map.getRandomFloorPosition();    // gives {x, y}
            map.grid[stairsLoc.x][stairsLoc.y] = map.tileset.stairsDown;

            // set this level's subLevel = nextLevel
            currentLevel.subLevel.area = nextLevel;

            // set the subLevel's parentLevel to the stairsLoc
            // so that when we take the stairs up from subLevel,
            // we end up in the right place on this level.
            nextLevel.parentLevel.x = stairsLoc.x;
            nextLevel.parentLevel.y = stairsLoc.y;
            nextLevel.parentLevel.area = currentLevel;

        }

        if (prev >= 1 && prev < this.numLevels) {
            // make connection between level 'i' and prevLevel = stairsUp
            prevLevel = this.levels[prev];

            // make the stairs up on this level
            stairsLoc = map.getRandomFloorPosition();    // gives {x, y}
            map.grid[stairsLoc.x][stairsLoc.y] = map.tileset.stairsUp;

            // set this level's parentLevel = prevLevel
            currentLevel.parentLevel.area = prevLevel;

            // set the parentLevel's subLevel to the stairsLoc
            // so that when we take the stairs down from parentLevel,
            // we end up in the right place on this level.
            prevLevel.subLevel.x = stairsLoc.x;
            prevLevel.subLevel.y = stairsLoc.y;
            prevLevel.subLevel.area = currentLevel;
        }


    }
};
