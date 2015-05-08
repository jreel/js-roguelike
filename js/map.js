/**
 * Created by jreel on 3/27/2015.
 *
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

/*
    MAP: a grid (2D array) on which we place and manipulate tiles.
*/

Game.Map = function(grid, tileset) {
    // TODO: update for different tilesets?
    this.grid = grid;
    this.tileset = tileset;
    this.area = null;       // should be set by the Area that owns it
    this.wrap = false;      // should also be set by the Area that owns it
    // cache width and height based on the dimensions
    // of the grid array
    this.width = grid.length;
    this.height = grid[0].length;

    // setup array to store whether a tile has been explored
    // so that we can render it in the future
    this.explored = new Array(this.width);
    for (var x = 0; x < this.width; x++) {
        this.explored[x] = new Array(this.height);
        for (var y = 0; y < this.height; y++) {
            this.explored[x][y] = false;
        }
    }

};

Game.Map.prototype.getWrappedX = function(x) {
    if (!this.wrap) {
        x = this.getConstrainedX(x);
    }
    if (x < 0) {
        x += this.width;
    } else if (x >= this.width) {
        x %= this.width;
    }
    return x;
};
Game.Map.prototype.getConstrainedX = function(x) {
    if (x < 0) {
        x = 0;
    } else if (x >= this.width) {
        x = this.width - 1;
    }
    return x;
};
Game.Map.prototype.getConstrainedY = function(y) {
    if (y < 0) {
        y = 0;
    } else if (y >= this.height) {
        y = this.height - 1;
    }
    return y;
};

Game.Map.prototype.detectMapEdge = function(x, y) {
    var edges = {};

    edges.W = (x === 0);
    edges.E = (x === this.width - 1);
    edges.N = (y === 0);
    edges.S = (y === this.height - 1);

    if (edges.W || edges.E || edges.N || edges.S) {
        edges.any = true;
    } else {
        edges.any = false;
    }
    return edges;
};

// Gets the tile for a given coordinate
Game.Map.prototype.getTile = function(x, y) {
    // if map should wrap, we should re-calculate the
    // correct (wrapped) x-coordinate
    if (this.wrap) {
        x = this.getWrappedX(x);
    }

    // Make sure we are inside bounds.
    // If not, return null tile.
    if (!this.checkX(x) || !this.checkY(y)) {
        return Game.Tile.nullTile;
    }
    else {
        return this.grid[x][y] || Game.Tile.nullTile;
    }
};

// sanity checks
Game.Map.prototype.checkX = function(x) {
    return x >= 0 && x < this.width;
};

Game.Map.prototype.checkY = function(y) {
    return y >= 0 && y < this.height;
};


// utility functions
Game.Map.prototype.getNeighborTiles = function(x, y) {
    var tiles = [];
    // generate all possible offsets
    for (var dX = -1; dX < 2; dX++) {
        for (var dY = -1; dY < 2; dY++) {
            // make sure it isn't the same tile
            if (dX === 0 && dY === 0) {
                continue;
            }
            tiles.push({x: x + dX, y: y + dY});
        }
    }
    return tiles.randomize();
};

Game.Map.prototype.getTilesWithinRadius = function(centerX, centerY, radius) {
    var results = [];
    // Determine the bounds
    var leftX = centerX - radius;
    var rightX = centerX + radius;
    var topY = centerY - radius;
    var bottomY = centerY + radius;

    for (var x = leftX; x <= rightX; x++) {
        for (var y = topY; y <= bottomY; y++) {
            if (x === centerX && y === centerX) {
                continue;
            }
            results.push({x: x, y: y});
        }
    }
    return results.randomize();
};

Game.Map.prototype.isAdjacent = function(x, y, tile) {
    return (this.getTile(x - 1, y) === tile || this.getTile(x + 1, y) === tile ||
            this.getTile(x, y - 1) === tile || this.getTile(x, y + 1) === tile);
};

// check whether a rectangular region is entirely tiled with 'tile'
// (most useful for checking for an unused area (tile == nullTile) in
//  dungeon-building routines)
Game.Map.prototype.isAreaTiled = function(xStart, yStart, xEnd, yEnd, tile) {
    if (!this.checkX(xStart) || !this.checkX(xEnd) ||
        !this.checkY(yStart) || !this.checkY(yEnd)) {
        return false;
    }
    if ((xStart > xEnd) || (yStart > yEnd)) {
        return false;
    }
    for (var y = yStart; y !== yEnd + 1; ++y) {
        for (var x = xStart; x !== xEnd + 1; ++x) {
            if (this.getTile(x, y) !== tile) {
                return false;
            }
        }
    }
    return true;
};

Game.Map.prototype.tileArea = function(xStart, yStart, xEnd, yEnd, tile) {
    if (!this.checkX(xStart) || !this.checkX(xEnd) ||
        !this.checkY(yStart) || !this.checkY(yEnd)) {
        return false;
    }
    if ((xStart > xEnd) || (yStart > yEnd)) {
        return false;
    }

    for (var x = xStart; x <= xEnd; x++) {
        for (var y = yStart; y <= yEnd; y++) {
            this.grid[x][y] = tile;
        }
    }
};

/*
Game.Map.prototype.floodFill = function(x, y, flagsArray, flag) {
    if (this.getTile(x,y).isWalkable && !flagsArray[x][y]) {
        flagsArray[x][y] = flag;
    } else {
        return;
    }
    this.floodFill(x + 1, y);
    this.floodFill(x - 1, y);
    this.floodFill(x, y + 1);
    this.floodFill(x, y - 1);
};
*/

Game.Map.prototype.fillRegion = function(region, x, y, masterArray) {

    if (this.wrap) {
        x = this.getWrappedX(x);
    }

    // update the region of the original tile
    masterArray[x][y] = region;

    // temporary array to loop through
    var tiles = [{x:x, y:y}];
    var tile;
    var neighbors;

    // keep looping while there are still tiles to process
    while (tiles.length > 0) {
        tile = tiles.pop();
        neighbors = this.getNeighborTiles(tile.x, tile.y);
        while (neighbors.length > 0) {
            tile = neighbors.pop();
            if (this.getTile(tile.x, tile.y).isWalkable) {

                if (this.wrap) {
                    tile.x = this.getWrappedX(tile.x);
                }

                if (masterArray[tile.x][tile.y] === 0) {

                    masterArray[tile.x][tile.y] = region;
                    tiles.push(tile);
                }

            }
        }
    }

};

Game.Map.prototype.isEmptyFloor = function(x, y) {
    // Check if the tile is floor and unoccupied
    // TODO: replace Game.Tile ref with tileset ref
    return this.getTile(x, y).isWalkable && !this.area.getEntityAt(x, y);
};

Game.Map.prototype.getRandomFloorPosition = function() {
    // Get coordinates of a random unoccupied floor tile
    var x, y;
    do {
        x = Math.floor(Math.random() * this.width);
        y = Math.floor(Math.random() * this.height);
    } while (!this.isEmptyFloor(x, y));
    return {x: x, y: y};
};

// Map-changing abilities
Game.Map.prototype.breakTile = function(x, y) {
    // If the tile is breakable, update it to a floor
    if (this.getTile(x, y).isBreakable) {
        this.grid[x][y] = this.tileset.floor;
    }
};

Game.Map.prototype.isExplored = function(x, y) {
    if (this.getTile(x, y) !== Game.Tile.nullTile) {
        return this.explored[x][y];
    } else {
        return false;
    }
};

Game.Map.prototype.setExplored = function(x, y, state) {
    if (this.getTile(x, y) !== Game.Tile.nullTile) {
        this.explored[x][y] = state;
    }
};