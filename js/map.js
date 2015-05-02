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

Game.Map = function(grid) {
    // TODO: update for different tilesets?
    this.grid = grid;
    this.area = null;       // should be set by the Area that constructed it
    // cache width and height based on the dimensions
    // of the grid array
    this.width = grid.length;
    this.height = grid[0].length;

    // TODO: we may want to cache a default floor, wall, and bedrock tile
    // based on the map tileset, so we can ref this.floorTile for ex.

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

// Gets the tile for a given coordinate
Game.Map.prototype.getTile = function(x, y) {
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

Game.Map.prototype.isAdjacent = function(x, y, tile) {
    if (!this.checkX(x - 1) || !this.checkX(x + 1) || !this.checkY(y - 1) || !this.checkY(y + 1)) {
        return false;
    }

    return (this.getTile(x - 1, y) === tile || this.getTile(x + 1, y) === tile ||
            this.getTile(x, y - 1) === tile || this.getTile(x, y + 1) === tile);
};

Game.Map.prototype.isAreaTiled = function(xStart, yStart, xEnd, yEnd, tile) {
    if (!this.checkX(xStart) || !this.checkX(xEnd) || !this.checkY(yStart) || !this.checkY(yEnd)) {
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
Game.Map.prototype.dig = function(x, y) {
    // If the tile is diggable, update it to a floor
    // TODO: update for different tilesets
    if (this.getTile(x, y).isDiggable) {
        this.grid[x][y] = Game.Tile.floorTile;
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