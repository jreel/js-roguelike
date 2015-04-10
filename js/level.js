/**
 * Created by jreel on 3/29/2015.
 */

Game.Level = function (params) {
    params = params || {};
    this.level = params['level'] || 0;
    this.width = params['width'] || Game.screenWidth * 2;
    this.height = params['height'] || Game.screenHeight * 2;
    this.type = params['type'] || null;                             //  TODO: type of level/map
    this.map = params['map'] || null;                               // holds Game.Map object

    this.scheduler = params['scheduler'] || new ROT.Scheduler.Simple();
    this.engine = params['engine'] || new ROT.Engine(this.scheduler);

    // holds tile positions of level entrance & exit; overridden by this.placeExits()
    this.connections = {prevLevel: {x: 0, y: 0},
                        nextLevel: {x: this.width, y: this.height}};

    this.lastVisit = null;                  // to simulate turns if player leaves & comes back later
    this.fov = params['fov'] || null;

    this.entities = params['entities'] || {};               // table to hold entities on this level, stored by position
    this.items = params['items'] || {};                     // table to hold items on this level
};

/* Map generation & population functions */
Game.Level.prototype.generateMap = function() {
    // create the empty map based on level parameters
    var map = new Array(this.width);
    for (var w = 0; w < this.width; w++) {
        map[w] = new Array(this.height);
    }

    // TODO: different generators for different map types
    // setup the cave generator
    // this generates a map inset by 1 all around
    // we'll then add bedrock tiles around the border
    var generator = new ROT.Map.Cellular(this.width - 2, this.height - 2, {connected: true});
    generator.randomize(0.5);
    var totalIterations = 4;
    // Iteratively smooth out the map
    for (var i = 0; i < totalIterations - 1; i++) {
        generator.create();
    }
    // smooth the map one last time and then update
    generator.create(function(x, y, v) {
        if (v === 0) {
            map[x+1][y+1] = Game.Tile.floorTile;
        }
        else {
            map[x+1][y+1] = Game.Tile.wallTile;
        }
    });

    for (var x = 0; x < this.width; x++) {
        map[x][0] = Game.Tile.bedrockTile;
        map[x][this.height - 1] = Game.Tile.bedrockTile;
    }
    for (var y = 0; y < this.height; y++) {
        map[0][y] = Game.Tile.bedrockTile;
        map[this.width - 1][y] = Game.Tile.bedrockTile;
    }

    return map;
};

Game.Level.prototype.placeExits = function() {
    var prevLevel = this.level - 1;     // valid values are 1 to Game.numLevels - 1
    var nextLevel = this.level + 1;     // valid values are 2 to Game.numLevels

    // TODO: Game.Tile references will need to be changed to tileset refs
    if (prevLevel >= 1 && prevLevel < Game.numLevels) {
        // make connection between this level and prevLevel = stairs up = entrance = "back"
        var entrance = this.map.getRandomFloorPosition(this);       // gives entrance.x, entrance.y
        this.map.tiles[entrance.x][entrance.y] = Game.Tile.prevLevelTile;
        this.connections.prevLevel = {x: entrance.x, y: entrance.y};
    }
    if (nextLevel > 1 && nextLevel <= Game.numLevels) {
        // make connection between this level and nextLevel = stairs down = exit = "onward"
        var exit = this.map.getRandomFloorPosition(this);
        this.map.tiles[exit.x][exit.y] = Game.Tile.nextLevelTile;
        this.connections.nextLevel = {x: exit.x, y: exit.y};
    }
};

Game.Level.prototype.populateMap = function(population) {
    if (this.level === 1) {
        // TODO: player creation, storyline opening
        this.addEntityAtRandomPosition(Game.thePlayer);
    }

    // set reasonable, pseudo-random defaults for population
    if (!population) {
        var mapArea = this.width * this.height;
        var areaPerPop = ROT.RNG.getNormal(200, 50);
        population = Math.max(Math.round(mapArea / areaPerPop), 10);
    }

    // add random monsters for now
    // TODO: monster table based on level type

    // make an array from our templates object
    var templates = Object.keys(Game.MonsterTemplates);
    for (var p = 0; p < population; p++) {
        // randomly select a template
        /*
        templates = templates.randomize();
        var monster = templates.random();
        */
        // switched to the repository system here
        var monster = Game.MonsterRepository.createRandom();
        this.addEntityAtRandomPosition(monster);
        // this.addEntityAtRandomPosition(new Game.Creature(Game.MonsterTemplates[monster]));
    }
    // TODO: this is a rewrite of the above code using the repository system
    /*
    for (var p = 0; p < population; p++) {
        var entity = Game.EntityRepository.createRandom();
        this.addEntityAtRandomPosition(entity);
    }
    */

    // add random items for now
    // average 1 item per monster, with a std around 5.
    // TODO: item table based on level type?
    var itemStd = randomNormalInt(5, 1);
    var itemPop = randomNormalInt(population, itemStd);
    for (var i = 0; i < itemPop; i++) {
        var item = Game.ItemRepository.createRandom();
        this.addItemAtRandomPosition(item);
    }

};

Game.Level.prototype.setupFov = function() {
    // set up field-of-view for the level
    // TODO: variable fov based on level type - is this needed here?
    var lvl = this;
    lvl.fov = new ROT.FOV.RecursiveShadowcasting(function (x, y) {
        return (lvl.map.getTile(x, y).isTransparent);
    });
};

Game.Level.prototype.changeLevel = function(changeAmount) {
    var oldLevel = this;
    var newCoords = {};
    var newLevel = Game.theWorld.levels[oldLevel.level + changeAmount];

    if (changeAmount === -1) {          // go back to previous level
        newCoords = newLevel.connections.nextLevel;
    } else if (changeAmount === 1) {   // go forward to next level
        newCoords = newLevel.connections.prevLevel;
    }
    oldLevel.lastVisit = Game.thePlayer.turnNumber;     // so we can simulate turns later
    Game.currentLevel = newLevel;

    // if level has been visited before, simulate turns
    if (Game.currentLevel.lastVisit) {
        var turnDiff = Game.thePlayer.turnNumber - Game.currentLevel.lastVisit;
        Game.currentLevel.simulateTurns(turnDiff);
    } else {
        // otherwise, populate the map for the first time
        /*
        var mapArea = Game.currentLevel.width * Game.currentLevel.height;
        var areaPerPop = ROT.RNG.getNormal(200, 40);
        var population = Math.floor(mapArea / areaPerPop);
        */
        // TODO: the below call may need updating if new populateMap routine
        Game.currentLevel.populateMap();
        Game.thePlayer.furthestLevel = Game.currentLevel.level;
    }

    // put the player at the correct spot on the new level
    var oldX = Game.thePlayer.x;
    var oldY = Game.thePlayer.y;
    Game.thePlayer.x = newCoords.x;
    Game.thePlayer.y = newCoords.y;

    newLevel.addEntity(Game.thePlayer);
    oldLevel.removeEntity(Game.thePlayer);
    newLevel.updateEntityPosition(Game.thePlayer, oldX, oldY, oldLevel);
    //Game.refresh();
};

Game.Level.prototype.simulateTurns = function(numTurns) {
    // how will this work?
    // can't figure out a solution using the ROT scheduler
    // so: loop through numTurns, loop through level.entities
    // if entity.isActor && entity !== the player, call entity.act

    for (var i = 0; i < numTurns; i++) {
        for (var e = 0; e < this.entities.length; e++) {
            var entity = this.entities[e];
            if (entity.isActor && (entity !== Game.thePlayer)) {
                entity.act();
            }
        }
    }
};


/* Entity handling functions */
Game.Level.prototype.addEntity = function(entity) {
    // Make sure the entity's position is within bounds
    if (entity.x < 0 || entity.x >= this.map.width ||
        entity.y < 0 || entity.y >= this.map.height) {
        throw new Error('Adding entity out of bounds.');
    }
    // Update the entity's level
    entity.level = this;

    // Add the entity to the list of entities
    this.updateEntityPosition(entity);

    // Check if this entity is an actor, and if so
    // add them to the scheduler
    if (entity.isActor) {
        this.scheduler.add(entity, true);
    }
};

Game.Level.prototype.addEntityAtRandomPosition = function(entity) {
    var position = this.map.getRandomFloorPosition();
    entity.x = position.x;
    entity.y = position.y;
    this.addEntity(entity);
};

Game.Level.prototype.removeEntity = function(entity) {
    // If the entity was an actor, remove it from the scheduler
    if (entity.isActor) {
        this.scheduler.remove(entity);
    }

    // and then delete it from the level table
    var key = entity.x + ',' + entity.y;
    if (this.entities[key] == entity) {
        delete this.entities[key];
    }
};

Game.Level.prototype.getEntityAt = function(x, y) {
    // get entity by position key
    return this.entities[x + ',' + y];
};

Game.Level.prototype.getEntitiesWithinRadius = function(centerX, centerY, radius) {
    var results = [];
    // Determine the bounds
    var leftX = centerX - radius;
    var rightX = centerX + radius;
    var topY = centerY - radius;
    var bottomY = centerY + radius;
    // Iterate through our entities, adding any which are within the bounds
    var ents = Object.keys(this.entities);
    for (var e = 0; e < ents.length; e++) {
        var entity = ents[e];
        if (entity.x >= leftX && entity.x <= rightX &&
            entity.y >= topY && entity.y <= bottomY) {
            results.push(entity);
        }
    }
    return results;
};

Game.Level.prototype.updateEntityPosition = function(entity, oldX, oldY, oldLevel) {
    // delete the old key

    // if an oldLevel is specified, delete from that level and add to this level
    // otherwise, delete from this level and re-add to this level
    var whichLevel = oldLevel || this;
    if (oldX) {
        var oldKey = oldX + ',' + oldY;
        if (whichLevel.entities[oldKey] === entity) {
            delete whichLevel.entities[oldKey];
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
Game.Level.prototype.getItemsAt = function(x, y) {
    return this.items[x + ',' + y];
};

Game.Level.prototype.setItemsAt = function(x, y, items) {
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

Game.Level.prototype.addItem = function(x, y, item) {
    // if there are already items at that position (i.e., the key exists),
    // then simply append the item to the existing list of items.
    var key = x + ',' + y;
    if (this.items[key]) {
        this.items[key].push(item);
    } else {
        this.items[key] = [item];
    }
};

Game.Level.prototype.addItemAtRandomPosition = function(item) {
    var position = this.map.getRandomFloorPosition(this);
    this.addItem(position.x, position.y, item);
};