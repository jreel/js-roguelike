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

    if (!tileset) {
        tileset = Game.Tilesets.tower;
    }

    if (!map) {
        // make new map grid, filled with wall tiles
        var grid = new Array(this.mapWidth);
        for (var x = 0; x < this.mapWidth; x++) {
            grid[x] = new Array(this.mapHeight);
            for (var y = 0; y < this.mapHeight; y++) {
                grid[x][y] = tileset.wall;
            }
        }
    }

    this.map = map || new Game.Map(grid, tileset);
    this.tileset = tileset;

    this.maxFeatures = options['maxFeatures'] || Math.floor(this.mapWidth * this.mapHeight / 100);
    this.roomChance = options['roomChance'] || 85;      // lower = more corridors
    this.corridorChance = options['corridorChance'] || (100 - this.roomChance);

    this.maxRoomSize = options['maxRoomSize'] || 10;
    this.maxRoomWidth = options['maxRoomWidth'] || this.maxRoomSize;
    this.maxRoomHeight = options['maxRoomHeight'] || this.maxRoomSize;
    this.maxCorridorLength = options['maxCorridorLength'] || 6;

    // some defines
    this.N = 0;
    this.E = 1;
    this.S = 2;
    this.W = 3;
};

Game.FBdungeon.prototype.generate = function() {
    // make one room in the center of map to start off
    this.makeRoom(Math.floor(this.mapWidth / 2), Math.floor(this.mapHeight / 2), randomInt(0, 3));

    for (var f = 1; f < this.maxFeatures; f++) {

        if (!this.tryExpansion()) {
            //console.log('Unable to place more features (placed ' + f + ').');
            break;
        }
    }

    // stairs are placed in the Dungeon connectLevels() routine

    return this.map;
};

Game.FBdungeon.prototype.makeCorridor = function(x, y, dir, length, force) {
    // sanity checks
    if (!this.map.checkX(x) || !this.map.checkY(y)) {
        return false;
    }
    length = length || randomInt(2, this.maxCorridorLength);

    if (length <= 0 || length > Math.max(this.mapWidth, this.mapHeight)) {
        return false;
    }

    var xStart = x, yStart = y;
    var xEnd = x, yEnd = y;
    var continueX = x, continueY = y;
    var xmod = 0, ymod = 0;

    if (dir === this.N) {
        yStart = y - length;
        xStart = x - 1;
        xEnd = x + 1;
        continueY = yStart;
        ymod = -1;

    } else if (dir === this.E) {
        xEnd = x + length;
        yStart = y - 1;
        yEnd = y + 1;
        continueX = xEnd;
        xmod = 1;

    } else if (dir === this.S) {
        yEnd = y + length;
        xStart = x - 1;
        xEnd = x + 1;
        continueY = yEnd;
        ymod = 1;

    } else if (dir === this.W) {
        xStart = x - length;
        yStart = y - 1;
        yEnd = y + 1;
        continueX = xStart;
        xmod = -1;
    }

    if (!this.map.checkX(xStart) || !this.map.checkX(xEnd) || !this.map.checkY(yStart) || !this.map.checkY(yEnd)) {
        return false;
    }

    if (!force && !this.map.isAreaTiled(xStart, yStart, xEnd, yEnd, this.tileset.wall)) {
        return false;
    }

    // don't actually make it until we know that we can continue it
    if (force || this.tryContinuation(continueX, continueY, xmod, ymod, dir)) {

        //this.map.tileArea(xStart, yStart, xEnd, yEnd, this.tileset.wall);
        if (xStart === x || xEnd === x) {   // east- or west-heading corridor
            this.map.tileArea(xStart, y, xEnd, y, this.tileset.corridor);
        }
        else if (yStart === y || yEnd === y) {  // north- or south-heading corridor
            this.map.tileArea(x, yStart, x, yEnd - 1, this.tileset.corridor);
        }
        return true;
    }
    return false;
};

Game.FBdungeon.prototype.makeRoom = function(x, y, dir, xLength, yLength) {
    // minimum room size of 5x5 tiles (3x3 for walking on, the rest is walls)
    xLength = xLength || randomInt(5, this.maxRoomWidth);
    yLength = yLength || randomInt(5, this.maxRoomHeight);

    var xStart = x;
    var yStart = y;

    var xEnd = x;
    var yEnd = y;


    // the call to randomInt(0,1) is so that we aren't positioning the
    // room door always above or below the calculated halfway point of the room.
    if (dir === this.N) {
        yStart = y - yLength;
        xStart = x - Math.floor(xLength / 2) + randomInt(0,1);
        xEnd = x + Math.floor(xLength / 2) + randomInt(0, 1);
    } else if (dir === this.E) {
        yStart = y - Math.floor(yLength / 2) + randomInt(0, 1);
        yEnd = y + Math.floor(yLength / 2) + randomInt(0, 1);
        xEnd = x + xLength;
    } else if (dir === this.S) {
        yEnd = y + yLength;
        xStart = x - Math.floor(xLength / 2) + randomInt(0, 1);
        xEnd = x + Math.floor(xLength / 2) + randomInt(0, 1);
    } else if (dir === this.W) {
        yStart = y - Math.floor(yLength / 2) + randomInt(0, 1);
        yEnd = y + Math.floor(yLength / 2) + randomInt(0, 1);
        xStart = x - xLength;
    }

    if (!this.map.checkX(xStart) || !this.map.checkX(xEnd) || !this.map.checkY(yStart) || !this.map.checkY(yEnd)) {
        return false;
    }

    if (!this.map.isAreaTiled(xStart, yStart, xEnd, yEnd, this.tileset.wall)) {
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

    if (chance <= this.roomChance) {
        if (this.makeRoom(x + xmod, y + ymod, dir)) {

            this.makeDoor(x, y, dir);
            // remove wall adjacent to the door
            this.map.grid[x + xmod][y + ymod] = this.tileset.floor;

            return true;
        }
        return false;

    } else {
        if (this.makeCorridor(x + xmod, y + ymod, dir)) {

            this.makeDoor(x, y, dir);
            return true;
        }
        return false;
    }

};

Game.FBdungeon.prototype.makeDoor = function(x, y, dir) {
    if (!this.map.isAdjacent(x, y, this.tileset.closedDoor)) {

        // set a door with blocked tiles on either side
        var dx = (dir === this.N || dir === this.S) ? 1 : 0;
        var dy = (dir === this.E || dir === this.W) ? 1 : 0;

        this.map.tileArea(x - dx, y - dy, x + dx, y + dy, this.tileset.blocked);
        this.map.grid[x][y] = this.tileset.closedDoor;
    } else {
        this.map.grid[x][y] = this.tileset.floor;
    }
};

Game.FBdungeon.prototype.tryContinuation = function(x, y, xmod, ymod, dir) {
    var map = this.map;
    var maxTries = 100;

    if (map.getTile(x, y) !== this.tileset.corridor) {
        return false;
    }

    if (map.isAdjacent(x, y, this.tileset.closedDoor)) {
        return false;
    }

    // search for a room (floor) or corridor tile in the same direction
    var newDir = dir;

    var foundFloor = map.searchInDirection(x, y, dir, this.tileset.floor, this.maxCorridorLength);
    if (!foundFloor) {
        foundFloor = map.searchInDirection(x, y, dir, this.tileset.corridor, this.maxCorridorLength);
    }
    // try in other directions
    if (!foundFloor) {
        var dirs = [0, 1, 2, 3].splice(dir, 1);     // remove current dir from array
        for (var i = 0; i < 3; i++) {
            newDir = dirs[i];
            foundFloor = map.searchInDirection(x, y, newDir, this.tileset.floor, this.maxCorridorLength);
            if (!foundFloor) {
                foundFloor = map.searchInDirection(x, y, newDir, this.tileset.corridor, this.maxCorridorLength);
            }
            if (foundFloor) {
                break;
            }
        }
    }
    // if we found a room or corridor tile, make a new corridor towards it
    if (foundFloor) {

        var dx = Math.abs(x - foundFloor.x);
        var dy = Math.abs(y - foundFloor.y);
        var length = Math.max(dx, dy);

        if (length > 0 && this.makeCorridor(x, y, newDir, length, true)) {
            this.map.grid[x][y] = this.tileset.corridor;
            this.map.grid[foundFloor.x][foundFloor.y] = this.tileset.corridor;

            return true;
        }

    }

    // if we couldn't continue the corridor to join up with another room or corridor,
    // try to make a room in the original dir
    if ( (x + xmod + 4 < this.mapWidth ) && (x + xmod - 4 > 0) &&
         (y + ymod + 4 < this.mapHeight) && (y + ymod - 4 > 0)) {
        for (var tries = 0; tries < maxTries; tries++) {

            if (this.makeRoom(x + xmod, y + ymod, dir)) {

                this.makeDoor(x, y, dir);
                this.map.grid[x + xmod][y + ymod] = this.tileset.floor;

                return true;
            }
        }
    }

    return false;
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

        if (map.getTile(x, y) !== this.tileset.wall) {
            continue;
        }

        if (map.isAdjacent(x, y, this.tileset.closedDoor)) {
            continue;
        }

        if (map.getTile(x, y + 1) === this.tileset.floor ||
            map.getTile(x, y + 1) === this.tileset.corridor) {
            if (this.makeFeature(x, y, 0, -1, this.N)) {
                return true;
            }
        } else if (map.getTile(x - 1, y) === this.tileset.floor ||
                   map.getTile(x - 1, y) === this.tileset.corridor) {
            if (this.makeFeature(x, y, 1, 0, this.E)) {
                return true;
            }
        } else if (map.getTile(x, y - 1) === this.tileset.floor ||
                   map.getTile(x, y - 1) === this.tileset.corridor) {
            if (this.makeFeature(x, y, 0, 1, this.S)) {
                return true;
            }
        } else if (map.getTile(x + 1, y) === this.tileset.floor ||
                   map.getTile(x + 1, y) === this.tileset.corridor) {
            if (this.makeFeature(x, y, -1, 0, this.W)) {
                return true;
            }
        }
    }
    return false;
};



