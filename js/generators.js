/**
 * Created by jreel on 4/25/2015.
 *
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

/*
    GENERATORS:  a collection of map generation routines.

    Each function should typically accept (width, height, tileset).
    The function should first create a 2D map array (width * height),
    then modify the map, placing tileset tiles as needed.

    The function should finally return the 2D array, usually to be
    passed into a new Map() object, and stored as Area.map
 */

Game.Generators = {};

Game.Generators.generateCave = function(width, height, tileset) {
    if (!tileset) {
        tileset = Game.Tilesets.cave;
    }

    // create the empty map based on parameters
    var grid = new Array(width);
    for (var w = 0; w < width; w++) {
        grid[w] = new Array(height);
    }

    // setup the cave generator
    var generator = new ROT.Map.Cellular(width - 2, height - 2, { connected: true });
    generator.randomize(0.5);
    var totalIterations = 4;
    // Iteratively smooth out the map
    for (var i = 0; i < totalIterations - 1; i++) {
        generator.create();
    }
    // smooth the map one last time and then update
    generator.create(function(x, y, v) {
        if (v === 0) {
            grid[x+1][y+1] = tileset.floor;
        }
        else {
            grid[x+1][y+1] = tileset.wall;
        }
    });

    // TODO: find a better solution than the "border of bedrock"
    for (var x = 0; x < width; x++) {
        grid[x][0] = tileset.blocked;
        grid[x][height - 1] = tileset.blocked;
    }
    for (var y = 0; y < height; y++) {
        grid[0][y] = tileset.blocked;
        grid[width - 1][y] = tileset.blocked;
    }

    return grid;
};

Game.Generators.generateCellular = function(width, height, tileset, percent, options) {
    tileset = tileset || Game.Tilesets.forest;
    options = options || {};

    // create the empty map based on parameters
    var grid = new Array(width);
    for (var w = 0; w < width; w++) {
        grid[w] = new Array(height);
    }
    // setup the cave generator
    var generator = new ROT.Map.Cellular(width, height, { connected: true });
    generator.randomize(percent);

    generator.create(function(x, y, v) {
        if (v === 0) {
            grid[x][y] = tileset.floor;
        }
        else {
            grid[x][y] = tileset.wall;
        }
    }
    );
    return grid;
};
Game.Generators.generateThick = function(width, height, tileset) {
    return Game.Generators.generateCellular(width, height, tileset, 0.55);
};
Game.Generators.generateDense = function(width, height, tileset) {
    return Game.Generators.generateCellular(width, height, tileset, 0.45);
};
Game.Generators.generateSparse = function(width, height, tileset) {
    return Game.Generators.generateCellular(width, height, tileset, 0.35);
};
Game.Generators.generateScattered = function(width, height, tileset) {
    return Game.Generators.generateCellular(width, height, tileset, 0.25);
};
Game.Generators.generateOpen = function(width, height, tileset) {
    return Game.Generators.generateCellular(width, height, tileset, 0.15);
};

















Game.Generators.generateCavernMap = function(width, height, tileset) {
    if (!tileset) {
        tileset = Game.Tilesets.cave;
    }

    // first create an array filled with empty tiles
    var grid = new Array(width);
    for (var x = 0; x < width; x++) {
        grid[x] = new Array(height);
        for (var y = 0; y < height; y++) {
            grid[x][y] = tileset.wall;
        }
    }
    // now we determine the radius of the cavern to carve out
    var radius = (Math.min(width, height) - 2) / 2;
    Game.Geometry.fillCircle(grid, width / 2, height / 2, radius, tileset.floor);

    // randomly position lakes (3 - 6 lakes)
    if (tileset.water) {
        var lakes = randomInt(3, 6);
        var maxRadius = 2;
        for (var i = 0; i < lakes; i++) {
            // random position, taking into consideration the radius to make sure
            // we are within the bounds
            var centerX = Math.floor(Math.random() * (width - (maxRadius * 2)));
            var centerY = Math.floor(Math.random() * (height - (maxRadius * 2)));
            centerX += maxRadius;
            centerY += maxRadius;
            // random radius
            radius = Math.floor(Math.random() * maxRadius) + 1;
            // position the lake
            Game.Geometry.fillCircle(grid, centerX, centerY, radius, tileset.water);
        }
    }
    return grid;
};


Game.Generators.generateTower = function(width, height, tileset) {
    /*
     1. create the circular tower "mask"
     a. first, fill the mask array with null tiles
     b. carve a circle out of the null tiles, fill circle with floor tiles
     c. circumference of circle needs to be stone wall tiles
     = check for null tile with empty floor on at least one side?

     2. create the rectangular dungeon area
     a. use the some dungeon algorithm

     3. combine the two to get a circular random dungeon
     a. any floorTile in the mask becomes whatever dungeon tile
     */

    if (!tileset) {
        tileset = Game.Tilesets.cave;
    }

    // first create the base array filled with empty tiles
    var tower = new Array(width);
    for (var x = 0; x < width; x++) {
        tower[x] = new Array(height);
        for (var y = 0; y < height; y++) {
            tower[x][y] = Game.Tile.nullTile;
        }
    }
    // now we determine the radius of the circle to carve out
    var radius = ((Math.min(width, height) - 2) / 2) - 1;
    Game.Geometry.fillCircle(tower, (width / 2), (height / 2), radius, tileset.floor);

    // loop through base array, check for floor tile with adjacent null tile
    // this should be the circumference of the circle; flip those tiles to wall tiles
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            if (tower[x][y] === tileset.floor) {
                var neighbors = Game.Map.prototype.getNeighborTiles.call(this, x, y);
                for (var i = 0; i < neighbors.length; i++) {
                    var nbor = neighbors[i];
                    if (nbor.x >= 0 && nbor.x < width && nbor.y >= 0 && nbor.y < height) {
                        var testCell = tower[nbor.x][nbor.y];
                        if (testCell === Game.Tile.nullTile) {
                            tower[x][y] = tileset.wall;
                            break;
                        }
                    }
                }
            }
        }
    }

   // now create the rectangular random dungeon with same width/height and tileset
    var dungeon = new Game.Dungeon.BSP(width, height, tileset, {
        minRoomSize: randomInt(4, 6),
        splitConstraint: 0.45,
        maxIterations: randomInt(6, 8),
        largerRoomChance: 0.6
    });
    dungeon.generate();

    var dungeonGrid = dungeon.createGridArray(dungeon.rooms);

    // now combine the two
    // loop through mask; switch any floor tile to corresponding tile in dungeon array
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            if (tower[x][y] === tileset.floor) {
                tower[x][y] = dungeonGrid[x][y];
            }
        }
    }

    // we want to clean up the result, removing any small rooms
    // loop through array, checking for floor tiles without at least 3 adjacent floor tiles
    // and flip them to wall tiles
    for (i = 0; i < 3; i++) {
        tower = Game.Generators.cleanSingles(tower, tileset);
    }

    return tower;
};

Game.Generators.cleanSingles = function(grid, tileset) {
    // loop thru grid, removing any 1x1 floor areas
    var width = grid.length;
    var height = grid[0].length;
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            if (grid[x][y] === tileset.floor) {
                var neighbors = Game.Map.prototype.getNeighborTiles.call(this, x, y);
                var okCount = 0;
                for (var i = 0; i < neighbors.length; i++) {
                    var nbor = neighbors[i];
                    if (nbor.x >= 0 && nbor.x < width && nbor.y >= 0 && nbor.y < height) {
                        var testCell = grid[nbor.x][nbor.y];
                        if (testCell === tileset.floor) {
                            okCount++;
                        }
                    }
                }
                // after looping through the neighbors and adding floorTiles to the count,
                // check the count
                if (okCount < 3) {
                    grid[x][y] = tileset.wall;
                }
            }
        }
    }

    return grid;
};



