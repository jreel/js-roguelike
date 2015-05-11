/**
 * Created by jreel on 4/4/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// TODO: player creation, different classes, etc.
// TODO: party system
Game.Player = function(template) {
    var defaults = {
        name: "hero",
        description: "This hero will surely save the day!",
        character: '@',
        foreground: '#fff',
        background: '#000',
        isHostile: false,

        isActor: true,      // since we don't need the generic actor mixin
        speed: 5,
        // mixin-specific properties
        movable: true,
        //actor: true,
        destructible: {
            maxHP: 10,
            baseDefenseValue: 0
        },
        attacker: {
            baseAttackValue: 1
        },
        sight: {
            sightRadius: 5
        },
        messageRecipient: true,
        inventoryHolder: {
            inventorySlots: 22
        },
        foodEater: {
            maxFullness: 2000,
            hungerRate: 1
        },
        armorUser: true,
        weaponUser: true,
        experienceGainer: true,
        playerTracker: true,         // sets up tracking counters and associated event listeners

        tokens: {}
    };

    // apply defaults into our template where needed
    template = applyDefaults(template, defaults);

    // Call the Entity constructor with composite template
    Game.Entity.call(this, template);

};
// Make players inherit all functionality of creatures
Game.Player.extend(Game.Entity);


// since we are not calling the generic actor mixin
// TODO: party system
Game.Player.prototype.act = function() {
    if (this.acting) {
        return false;
    }
    this.acting = true;
    // add turn hunger before checking player death
    this.addHunger();
    // detect if the game is over
    if (!this.isAlive) {
        Game.setGameOver(true);
        // send a last message
        Game.sendMessage('danger', this, 'You have died! :( Press [Enter] to continue.');
    }
    // re-render the screen
    Game.refresh();
    // lock the engine and wait asynchronously
    // for the player to press a key
    this.area.engine.lock();
    this.acting = false;
};

Game.Player.prototype.setLocation = function(x, y, area) {

    // we want to do extra stuff when the player changes areas,
    // like updating the Game.currentWorld / currentArea, and
    // setting trackers in order to simulate turns.

    var oldArea = this.area;
    var newArea = area;

    // if area was not passed in, assume we don't want to change areas.
    if (oldArea && !newArea) {
        newArea = oldArea;
    }

    // if we are changing areas
    if (oldArea !== newArea) {

        // so we can simulate turns later
        if (oldArea) {
            oldArea.lastVisit = this.trackers.turnsTaken;
        }

        // if area has been visited before, simulate turns
        if (newArea.lastVisit) {
            var turnDiff = this.trackers.turnsTaken - newArea.lastVisit;
            //newArea.simulateTurns(turnDiff);

        }
        else if (!newArea.isOverworld()) {
            // otherwise, populate the map for the first time
            newArea.populate();

            // scatter items in dungeon areas
            if (newArea.isDungeonArea()) {
                newArea.scatterItems();
            }
        }

        Game.currentWorld.currentArea = newArea;
    }

    // after we are finished with Player stuff, call the super()
    Game.Entity.prototype.setLocation.call(this, x, y, newArea);
};

// player-specific movement stuff.
// called from tryMove() routine.
// This is only for movement within an area;
// area changes are handled within changeAreas
Game.Player.prototype.move = function(newX, newY) {
    // this routine should be called from the tryMove routine
    // to handle movement in (and across) different types of areas.

    // x,y args should be the player's target x, y.
    var player = this;
    var area = player.area;
    var tile = area.map.getTile(newX, newY);


    var biome;
    if (area.isOverworld()) {
        biome = area.world.getBiomeName(newX, newY);
    } else {
        biome = area.biome;
    }
    var hungerMod = Game.BiomeArea[biome].hungerMultiplier;

    // in all cases (all map/area types), check if the tile is walkable,
    // then if it's breakable.

    if (tile.isWalkable) {
        // TODO: || meetsRequirements

        player.setLocation(newX, newY);       // no area changes here!
        // that should be handled in changeAreas()

        player.addHunger(player.hungerRate * hungerMod);

        // after player has moved, check if messages about new tile need to be sent
        // world Area: check if player is on map edge, and send a message
        if (area.isWorldArea()) {
            if (area.map.detectMapEdge(newX, newY).any) {
                if (!player.tokens['mapEdge']) {
                    Game.sendMessage('info', player, "Press [Space] to exit the area.");
                    player.tokens['mapEdge'] = 20;
                } else {
                    player.tokens['mapEdge']--;
                }
            }
        }

        if (area.isWorldArea() || area.isDungeonArea()) {
            // TODO: display any messages about activatable tiles
            if (tile == area.map.tileset.stairsUp) {
                Game.sendMessage('info', player, "Press [Space] to go up the stairs.");
            } else if (tile == area.map.tileset.stairsDown) {
                Game.sendMessage('info', player, "Press [Space] to go down the stairs.");
            }
        }

        return true;

    } else if (tile.isBreakable) {
        // TODO: && meetsRequirements

        area.map.breakTile(newX, newY);
        hungerMod *= 2;                 // breakin' tiles makes me hungrah, yo
        player.addHunger(player.hungerRate * hungerMod);
        // TODO: item durability damage?
        return true;

    } else {
        // we can't move there, and we can't break the tile

        // TODO: more informative messages for different biome types?
        // Game.sendMessage('warning', player, "You can't move there.");
        return false;
    }
};

Game.Player.prototype.changeAreas = function(x, y) {
    // this should be called from the playScreen.activateTile routine
    // or possibly the tryMove routine

    var player = this;
    var currentArea = player.area;
    var world = currentArea.world;
    var tile = currentArea.map.getTile(x, y);

    var newX, newY, newArea;

    // if Overworld, move player to map cell area.
    if (currentArea.isOverworld()) {
        // 1. check if we already have an area for that world(x, y)
        // 2. if not, create a new area with the given biome
        // 3. move the player into the new area

        if (world.worldAreas[x + ',' + y]) {
            newArea = world.worldAreas[x + ',' + y];

        } else {
            newArea = world.generateWorldArea(x, y);
            newArea.engine.start();
            // populate() is called by player.setLocation
        }

        // try to set the player in the center of the new area
        // if not, in a closed space at or close to the center
        newX = newArea.map.width / 2;
        newY = newArea.map.height / 2;
        player.setLocation(newX, newY, newArea);
        // setLocation handles simulating turns upon re-visiting an area

        return true;
    }

    // check for stairs up/down
    if (currentArea.isWorldArea() || currentArea.isDungeonArea()) {

        if (tile == currentArea.map.tileset.stairsUp) {
            // go to the parent area
            newArea = currentArea.parentLevel.area;
            newX = currentArea.parentLevel.x;
            newY = currentArea.parentLevel.y;

            // since parent should have been generated already,
            // we don't need to check for that... just go.
            player.setLocation(newX, newY, newArea);
            return true;

        } else if (tile == currentArea.map.tileset.stairsDown) {
            // go to the sub-area
            // (it should have been generated already if there are stairs down!)

            newArea = currentArea.subLevel.area;
            newX = currentArea.subLevel.x;
            newY = currentArea.subLevel.y;

            player.setLocation(newX, newY, newArea);
            return true;

        }
    }

    // if world Area, check for map edge to move player up to overworld
    if (currentArea.isWorldArea()) {
        // 1. check if we are on the edge of the map (and which edge we are on)
        // 2. move the player into the overworld area at the new x,y (corresponding
        //      to Area map edge)

        var edge = currentArea.map.detectMapEdge(x, y);

        if (edge.any) {
            // set new overworld coordinates
            var dX = (edge.W ? -1 : (edge.E ? 1 : 0));
            var dY = (edge.N ? -1 : (edge.S ? 1 : 0));

            newArea = world.overworld;
            newX = newArea.map.getWrappedX(currentArea.parentX + dX);
            newY = newArea.map.getConstrainedY(currentArea.parentY + dY);

            // TODO: we need to start generating the worldAreas to have
            // blocking tiles on the appropriate edges, so that the player
            // can't end up e.g. in the ocean.

            player.setLocation(newX, newY, newArea);
            return true;

        }
    }

    // if we haven't returned true already,
    return false;
};





