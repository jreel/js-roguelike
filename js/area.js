/**
 * Created by jreel on 3/29/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

Game.Area = function (params) {
    var defaults = {
        id: 0,
        width: Game.screenWidth * 2,
        height: Game.screenHeight * 2,
        world: null,
        parentX: 0,
        parentY: 0,
        biome: null,                         //  TODO: type of area/map
        map: null,                           // holds Game.Map object
        fov: null,
        sightRadiusMultiplier: 1,
        clevel: 1,                          // average creature level
        lastVisit: 0,           // to simulate turns if player leaves & comes back later
        entities: {},           // table to hold entities in this area, stored by position
        items: {},              // table to hold items in this area
        parentLevel: {},
        subLevel: {}
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

    // Set up additional necessary properties
    this.scheduler = new ROT.Scheduler.Simple();
    this.engine = new ROT.Engine(this.scheduler);

};

Game.Area.prototype.isOverworld = function() {
    return (this instanceof Game.OverworldArea);
};
Game.Area.prototype.isWorldArea = function() {
    return (this instanceof Game.WorldArea);
};
Game.Area.prototype.isDungeonArea = function() {
    return (this instanceof Game.DungeonArea);
};

Game.Area.prototype.populate = function(population) {

    // set reasonable, pseudo-random defaults for population
    if (!population) {
        var mapArea = this.width * this.height;
        var areaPerPop = randomNormalInt(200, 50);
        population = Math.max(Math.round(mapArea / areaPerPop), 10);
    }

    // add random monsters for now
    // TODO: monster table based on area type

    for (var p = 0; p < population; p++) {
        var monster = Game.MonsterFactory.createRandom();
        this.placeEntityAtRandomPosition(monster);
        // level up the new entity automatically based on the area clevel
        if (monster.gainsExperience) {
            for (var lvl = 0; lvl < this.clevel; lvl++) {
                monster.giveExperience(monster.getNextLevelExperience() - monster.experience);
            }
        }

    }

};
Game.Area.prototype.scatterItems = function(amount) {

    // set reasonable, pseudo-random defaults for amount
    if (!amount) {
        var mapArea = this.width * this.height;
        var areaPerItem = randomNormalInt(100, 20);
        amount = Math.max(Math.round(mapArea / areaPerItem), 10);
    }

    var itemPop = randomNormalInt(amount, 1);
    for (var i = 0; i < itemPop; i++) {
        var item = Game.ItemFactory.createRandom();
        this.addItemAtRandomPosition(item);
    }
};

Game.Area.prototype.setupFov = function() {
    // set up field-of-view for the area
    var area = this;
    area.fov = new ROT.FOV.RecursiveShadowcasting(function (x, y) {
        return (area.map.getTile(x, y).passesLight);
    });
};

Game.Area.prototype.addDungeon = function(options) {
    options = options || {};

    var depth = options['dungeonDepth'] || randomInt(5, 10);

    var dungeonLoc = this.map.getRandomFloorPosition();    // gives {x, y}

    this.dungeon = new Game.Dungeon({
        parentArea: this,
        parentX: dungeonLoc.x,
        parentY: dungeonLoc.y,
        numLevels: depth
    });

    // make stairs down
    this.map.grid[dungeonLoc.x][dungeonLoc.y] = this.map.tileset.stairsDown;

    var firstLevel = this.dungeon.levels[1];
    this.subLevel.area = firstLevel;
    firstLevel.parentLevel.x = dungeonLoc.x;
    firstLevel.parentLevel.y = dungeonLoc.y;
    firstLevel.parentLevel.area = this;

    // make stairs up from the first dungeon level
    var stairsUpRoom = firstLevel.rooms[firstLevel.rooms.length - 2];
    var stairsUpX = (stairsUpRoom.xStart + stairsUpRoom.xEnd) >> 1;
    var stairsUpY = (stairsUpRoom.yStart + stairsUpRoom.yEnd) >> 1;

    firstLevel.map.grid[stairsUpX][stairsUpY] = firstLevel.map.tileset.stairsUp;

    this.subLevel.x = stairsUpX;
    this.subLevel.y = stairsUpY;
};

Game.Area.prototype.simulateTurns = function(numTurns) {
    // how will this work?
    // can't figure out a solution using the ROT scheduler
    // so: loop through numTurns, loop through area.entities
    // if entity.isActor && entity !== the player, call entity.act

    for (var i = 0; i < numTurns; i++) {
        for (var e = 0; e < this.entities.length; e++) {
            var entity = this.entities[e];
            if (entity.isActor && (entity !== Game.player)) {
                entity.act();
            }
        }
    }
};


/* Entity handling functions */

// This does all the things necessary for adding an Entity to the Area.
// Note that this generally shouldn't be called directly;
// it is better called via updateEntityLocation().
Game.Area.prototype.addEntity = function(entity) {
    // Make sure the entity's position is within bounds
    if (entity.x < 0 || entity.x >= this.map.width ||
        entity.y < 0 || entity.y >= this.map.height) {
        throw new Error('addEntity: entity position out of bounds.');
    }
    // Update the entity's area
    entity.area = this;

    // Add the entity to the list of entities
    var key = entity.x + ',' + entity.y;
    this.entities[key] = entity;

    // Check if this entity is an actor, and if so
    // add them to the scheduler
    if (entity.isActor) {
        this.scheduler.add(entity, true);
    }
};

Game.Area.prototype.placeEntityAtRandomPosition = function(entity) {
    var position = this.map.getRandomFloorPosition();
    this.updateEntityLocation(entity, position.x, position.y);
};

Game.Area.prototype.removeEntity = function(entity) {
    // If the entity was an actor, remove it from the scheduler
    if (entity.isActor) {
        this.scheduler.remove(entity);
    }

    // and then delete it from the area table
    var key = entity.x + ',' + entity.y;
    if (this.entities[key] == entity) {
        delete this.entities[key];
    }
};

Game.Area.prototype.getEntityAt = function(x, y) {
    // get entity by position key
    return this.entities[x + ',' + y];
};

Game.Area.prototype.getEntitiesWithinRadius = function(centerX, centerY, radius) {
    var results = [];
    // Determine the bounds
    var leftX = centerX - radius;
    var rightX = centerX + radius;
    var topY = centerY - radius;
    var bottomY = centerY + radius;
    // Iterate through our entities, adding any which are within the bounds
    var ents = Object.keys(this.entities);
    for (var e = 0; e < ents.length; e++) {
        var entKey = ents[e];
        var entity = this.entities[entKey];
        if (entity.x >= leftX && entity.x <= rightX &&
            entity.y >= topY && entity.y <= bottomY) {
            results.push(entity);
        }
    }
    return results;
};

Game.Area.prototype.updateEntityLocation = function(entity, newX, newY, newArea) {

    var oldX = entity.x;
    var oldY = entity.y;
    var oldArea = entity.area;      // this may be undefined for brand-new entities.

    // if newArea was not passed in, assume we don't want to change areas.
    if (oldArea && !newArea) {
        newArea = oldArea;
    }

    // if we still don't know what "newArea" means, assume it's 'this'
    if (!newArea) {
        newArea = this;
    }

    // make sure new position is within bounds
    // (this should be checked before invoking this routine)
    if (newX < 0 || newX >= newArea.width ||
        newY < 0 || newY >= newArea.height) {
        throw new Error("updateEntityLocation: new position is out of bounds.");
    }
    // check to make sure there is no entity at the new position
    var newKey = newX + ',' + newY;
    if (newArea.entities[newKey] && newArea.entities[newKey] !== entity) {
        throw new Error("updateEntityLocation: tried to add an entity at an occupied position.");
    }


    // if we are not changing areas, simply delete the old key and add the new one.
    if (newArea === oldArea) {

        var oldKey = oldX + ',' + oldY;
        if (oldArea.entities[oldKey] == entity) {
            delete oldArea.entities[oldKey];
        }
        newArea.entities[newKey] = entity;
        entity.x = newX;
        entity.y = newY;

    }
    else {

        if (oldArea) {
            // remove from current area first;
            // this also removes it from the area scheduler
            // and deletes the key
            oldArea.removeEntity(entity);
        }

        // now add to new area
        entity.x = newX;
        entity.y = newY;
        // this will also create the key, and add it to
        // the area scheduler.
        newArea.addEntity(entity);
    }
};


/* Item-handling functions */
Game.Area.prototype.getItemsAt = function(x, y) {
    return this.items[x + ',' + y];
};

Game.Area.prototype.setItemsAt = function(x, y, items) {
    // if the items array is empty, delete the key from the table
    var key = x + ',' + y;
    if (items.length === 0) {
        if (this.items[key]) {
            delete this.items[key];
        }
    }
    else {
        // otherwise, simply update the items at that key
        this.items[key] = items;
    }
};

Game.Area.prototype.addItem = function(x, y, item) {
    // if there are already items at that position (i.e., the key exists),
    // then simply append the item to the existing list of items.
    var key = x + ',' + y;
    if (this.items[key]) {
        this.items[key].push(item);
    }
    else {
        this.items[key] = [item];
    }
};

Game.Area.prototype.addItemAtRandomPosition = function(item) {
    var position = this.map.getRandomFloorPosition();
    this.addItem(position.x, position.y, item);
};