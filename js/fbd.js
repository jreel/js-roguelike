/**
 * Created by jreel on 5/7/2015.
 */


/*
 "Feature Based" Dungeon Building Algorithm (originally by Mike Anderson)
 from http://www.roguebasin.com/index.php?title=Dungeon-Building_Algorithm

 code ported from C++ implementation (version 2 by netherh)
 http://www.roguebasin.com/index.php?title=C%2B%2B_Example_of_Dungeon-Building_Algorithm
 */

Game.FBdungeon = function(map, tileset, options) {
    options = options || {};
    this.mapWidth = options['width'] || 100;
    this.mapHeight = options['height'] || 100;

    if (!map) {
        var grid = new Array(this.mapWidth);
        for (var i = 0; i < this.mapWidth; i++) {
            grid[i] = new Array(this.mapHeight);
        }
    }

    if (!tileset) {
        tileset = Game.Tilesets.cave;
    }

    this.map = map || new Game.Map(grid, tileset);
    this.tileset = tileset;

    this.maxFeatures = options['maxFeatures'] || 100;
    this.roomChance = options['roomChance'] || 75;      // lower = more corridors
    this.corridorChance = options['corridorChance'] || (100 - this.roomChance);

    this.maxRoomSize = options['maxRoomSize'] || 10;
    this.maxRoomWidth = options['maxRoomWidth'] || this.maxRoomSize;
    this.maxRoomHeight = options['maxRoomHeight'] || this.maxRoomSize;
    this.maxCorridorLength = options['maxCorridorLength'] || 6;
};

Game.FBdungeon.prototype.generate = function() {
    // make one room in the center of map to start off
    this.makeRoom(this.mapWidth / 2, this.mapHeight / 2,
                  this.maxRoomWidth, this.maxRoomHeight, randomInt(0, 3)
    );

    for (var f = 1; f < this.maxFeatures; f++) {

        if (!this.tryExpansion()) {
            console.log('Unable to place more features (placed ' + f + ').');
            break;
        }
    }

    if (!this.makeStairs(this.tileset.stairsUp)) {
        console.log('Unable to place stairs up.');
    }

    if (!this.makeStairs(this.tileset.stairsDown)) {
        console.log('Unable to place stairs down.')
    }

    return true;
};

Game.FBdungeon.prototype.makeCorridor = function(x, y, maxLength, dir) {
    // sanity checks
    if (!this.map.checkX(x) || !this.map.checkY(y)) {
        return false;
    }
    if (maxLength <= 0 || maxLength > Math.max(this.mapWidth, this.mapHeight)) {
        return false;
    }

    var length = randomInt(2, maxLength);
    var xStart = x;
    var yStart = y;
    var xEnd = x;
    var yEnd = y;

    if (dir === 0 || dir === 'N' || dir === 'n') {
        yStart = y - length;
    } else if (dir === 1 || dir === 'E' || dir === 'e') {
        xEnd = x + length;
    } else if (dir === 2 || dir === 'S' || dir === 's') {
        yEnd = y + length;
    } else if (dir === 3 || dir === 'W' || dir === 'w') {
        xStart = x - length;
    }

    if (!this.map.checkX(xStart) || !this.map.checkX(xEnd) || !this.map.checkY(yStart) || !this.map.checkY(yEnd)) {
        return false;
    }

    if (!this.map.isAreaTiled(xStart, yStart, xEnd, yEnd, Game.Tile.nullTile)) {
        return false;
    }

    this.map.tileArea(xStart, yStart, xEnd, yEnd, this.tileset.corridor);
    return true;
};

Game.FBdungeon.prototype.makeRoom = function(x, y, xMax, yMax, dir) {
    // minimum room size of 5x5 tiles (3x3 for walking on, the rest is walls)
    var xLength = randomInt(5, xMax);
    var yLength = randomInt(5, yMax);

    var xStart = x;
    var yStart = y;

    var xEnd = x;
    var yEnd = y;

    if (dir === 0 || dir === 'N' || dir === 'n') {
        yStart = y - yLength;
        xStart = x - xLength / 2;
        xEnd = x + (xLength + 1) / 2;
    } else if (dir === 1 || dir === 'E' || dir === 'e') {
        yStart = y - yLength / 2;
        yEnd = y + (yLength + 1) / 2;
        xEnd = x + xLength;
    } else if (dir === 2 || dir === 'S' || dir === 's') {
        yEnd = y + yLength;
        xStart = x - xLength / 2;
        xEnd = x + (xLength + 1) / 2;
    } else if (dir === 3 || dir === 'W' || dir === 'w') {
        yStart = y - yLength / 2;
        yEnd = y + (yLength + 1) / 2;
        xStart = x - xLength;
    }

    if (!this.map.checkX(xStart) || !this.map.checkX(xEnd) || !this.map.checkY(yStart) || !this.map.checkY(yEnd)) {
        return false;
    }

    if (!this.map.isAreaTiled(xStart, yStart, xEnd, yEnd, Game.Tile.nullTile)) {
        return false;
    }

    this.map.tileArea(xStart, yStart, xEnd, yEnd, this.tileset.wall);
    this.map.tileArea(xStart + 1, yStart + 1, xEnd - 1, yEnd - 1, this.tileset.floor);
    return true;
};

Game.FBdungeon.prototype.makeFeature = function(x, y, xmod, ymod, dir) {
    // choose what to build
    var chance = randomPercent();

    // TODO: this could be extended to pull other features from a chance table

    if (chance < this.roomChance) {
        if (this.makeRoom(x + xmod, y + ymod, this.maxRoomWidth, this.maxRoomHeight, dir)) {

            this.map.grid[x][y] = this.tileset.closedDoor;
            // remove wall adjacent to the door
            this.map.grid[x + xmod][y + ymod] = this.tileset.floor;

            return true;
        }
        return false;

    } else {
        if (this.makeCorridor(x + xmod, y + ymod, this.maxCorridorLength, dir)) {

            this.map.grid[x][y] = this.tileset.closedDoor;
            return true;
        }
        return false;
    }

};

Game.FBdungeon.prototype.tryExpansion = function() {

    var map = this.map;
    var maxTries = 1000;

    var x, y;
    for (var tries = 0; tries < maxTries; tries++) {
        // Pick a random wall or corridor tile.
        // Make sure it has no adjacent doors (looks weird to have doors next to each other)
        // Find a direction from which it's reachable.
        // Attempt to make a feature (room or corridor) starting at this point.

        x = randomInt(1, this.mapWidth - 2);
        y = randomInt(1, this.mapHeight - 2);

        if (map.getTile(x, y) !== this.tileset.wall &&
            map.getTile(x, y) !== this.tileset.corridor) {
            continue;
        }

        if (map.isAdjacent(x, y, this.tileset.closedDoor)) {
            continue;
        }

        if (map.getTile(x, y + 1) === this.tileset.floor ||
            map.getTile(x, y + 1) === this.tileset.corridor) {
            if (this.makeFeature(x, y, 0, -1, 'N')) {
                return true;
            }
        } else if (map.getTile(x - 1, y) === this.tileset.floor ||
                   map.getTile(x - 1, y) === this.tileset.corridor) {
            if (this.makeFeature(x, y, 1, 0, 'E')) {
                return true;
            }
        } else if (map.getTile(x, y - 1) === this.tileset.floor ||
                   map.getTile(x, y - 1) === this.tileset.corridor) {
            if (this.makeFeature(x, y, 0, 1, 'S')) {
                return true;
            }
        } else if (map.getTile(x + 1, y) === this.tileset.floor ||
                   map.getTile(x + 1, y) === this.tileset.corridor) {
            if (this.makeFeature(x, y, -1, 0, 'W')) {
                return true;
            }
        }
    }
    return false;
};

Game.FBdungeon.prototype.makeStairs = function(tile) {

    var map = this.map;
    var maxTries = 10000;

    var x, y;
    for (var tries = 0; tries < maxTries; tries++) {

        x = randomInt(1, this.mapWidth - 2);
        y = randomInt(1, this.mapHeight - 2);

        if (!map.isAdjacent(x, y, this.tileset.floor) && !map.isAdjacent(x, y, this.tileset.corridor)) {
            continue;
        }

        if (map.isAdjacent(x, y, this.tileset.closedDoor)) {
            continue;
        }

        map.grid[x][y] = tile;
        return true;
    }
    return false;
};


