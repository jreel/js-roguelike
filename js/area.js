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
        worldX: 0,
        worldY: 0,
        biome: null,                         //  TODO: type of area/map
        map: null,                           // holds Game.Map object
        fov: null,
        clevel: 1                    // average creature level
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

    this.lastVisit = null;                  // to simulate turns if player leaves & comes back later

    this.entities = {};               // table to hold entities on this area, stored by position
    this.items = {};                     // table to hold items on this area
};


Game.Area.prototype.populate = function(population) {

    // set reasonable, pseudo-random defaults for population
    if (!population) {
        var mapArea = this.width * this.height;
        var areaPerPop = ROT.RNG.getNormal(200, 50);
        population = Math.max(Math.round(mapArea / areaPerPop), 10);
    }

    // add random monsters for now
    // TODO: monster table based on area type

    // make an array from our templates object
    // var templates = Object.keys(Game.Templates.Monsters);
    for (var p = 0; p < population; p++) {
        var monster = Game.MonsterRepository.createRandom();
        this.addEntityAtRandomPosition(monster);
        // level up the new entity automatically based on the area clevel
        if (monster.gainsExperience) {
            for (var lvl = 0; lvl < this.clevel; lvl++) {
                monster.giveExperience(monster.getNextLevelExperience() - monster.experience);
            }
        }

    }

    // add random items (mainly food right now)
    // average 1 item per every 2 monsters, with a std around 5.
    // TODO: item table based on area type?
    var itemStd = randomNormalInt(5, 1);
    var itemPop = randomNormalInt(Math.floor(population / 2), itemStd);
    for (var i = 0; i < itemPop; i++) {
        var item = Game.ItemRepository.createRandom();
        this.addItemAtRandomPosition(item);
    }

};

Game.Area.prototype.setupFov = function() {
    // set up field-of-view for the area
    // TODO: variable fov based on area type - is this needed here?
    var area = this;
    area.fov = new ROT.FOV.RecursiveShadowcasting(function (x, y) {
        return (area.map.getTile(x, y).passesLight);
    });
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

Game.Area.prototype.addEntity = function(entity) {
    // Make sure the entity's position is within bounds
    if (entity.x < 0 || entity.x >= this.map.width ||
        entity.y < 0 || entity.y >= this.map.height) {
        throw new Error('Adding entity out of bounds.');
    }
    // Update the entity's area
    entity.area = this;

    // Add the entity to the list of entities
    this.updateEntityPosition(entity);

    // Check if this entity is an actor, and if so
    // add them to the scheduler
    if (entity.isActor) {
        this.scheduler.add(entity, true);
    }
};

Game.Area.prototype.addEntityAtRandomPosition = function(entity) {
    var position = this.map.getRandomFloorPosition();
    entity.x = position.x;
    entity.y = position.y;
    this.addEntity(entity);
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

Game.Area.prototype.updateEntityPosition = function(entity, oldX, oldY, oldArea) {
    // delete the old key

    // if an oldArea is specified, delete from that area and add to this area
    // otherwise, delete from this area and re-add to this area
    var whichArea = oldArea || this;
    if (typeof oldX === 'number') {
        var oldKey = oldX + ',' + oldY;
        if (whichArea.entities[oldKey] === entity) {
            delete whichArea.entities[oldKey];
        }
    }

    // make sure entity's position is within bounds
    if (entity.x < 0 || entity.x >= this.width ||
        entity.y < 0 || entity.y >= this.height) {
        throw new Error("Entity's position is out of bounds.");
    }
    // sanity check to make sure there is no entity at the new position
    var key = entity.x + ',' + entity.y;
    if (this.entities[key] && this.entities[key] !== entity) {
        throw new Error("Tried to add an entity at an occupied position.");
    }
    // add the entity to the table of entries
    this.entities[key] = entity;
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
    } else {
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
    } else {
        this.items[key] = [item];
    }
};

Game.Area.prototype.addItemAtRandomPosition = function(item) {
    var position = this.map.getRandomFloorPosition(this);
    this.addItem(position.x, position.y, item);
};