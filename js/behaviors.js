/**
 * Created by jreel on 3/29/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// TODO: move to repository system?
Game.Behaviors = {

    fungalGrowth: function(owner, level) {
        owner = owner || this;
        if (!level) {
            level = owner.level;
        }
        if (owner.growthRemaining <=0 || ROT.RNG.getPercentage() > owner.growPctChance) {
            return false;
        }
        // Generate the coordinates of a random adjacent square by
        // generating an offset between [-1, 0, 1] for both the x and
        // y directions. To do this, we generate a number from 0-2 and
        // then subtract 1.
        var xOffset = Math.floor(Math.random() * 3) - 1;
        var yOffset = Math.floor(Math.random() * 3) - 1;

        // Make sure we aren't trying to spread into the same tile
        if (xOffset === 0 && yOffset === 0) {
            return false;
        }
        var xTarget = owner.x + xOffset;
        var yTarget = owner.y + yOffset;

        // Check that we can actually spread into that location,
        // and if so, then we grow!
        if (!level.map.isEmptyFloor(xTarget, yTarget, level)) {
            return false;
        }

        var newGrowth = Game.MonsterRepository.create(owner.name);
        newGrowth.setPosition(xTarget, yTarget);
        level.addEntity(newGrowth);
        owner.growthRemaining--;

        // alert nearby
        Game.sendMessageNearby(level, xTarget, yTarget, 5, "%c{" + owner.foreground + "}The %s is spreading!", owner.name);
        return true;
    },

    wander: function(owner) {
        // move by 1 unit in a random direction every time this behavior is called
        owner = owner || this;

        // first, ensure that we are able to move
        if (!owner.canMove) {
            return false;
        }
        // flip coin to determine +1 or -1
        var moveOffset = (Math.round(Math.random()) === 1) ? 1: -1;
        // flip coin to determine x direction or y direction
        if (Math.round(Math.random()) === 1) {
            return owner.tryMove(owner.x + moveOffset, owner.y);
        } else {
            return owner.tryMove(owner.x, owner.y + moveOffset);
        }
    },

    hunt: function(owner) {
        owner = owner || this;

        // first, ensure that we can see what we are trying to hunt
        if (!owner.hasSight || !owner.canSee(Game.thePlayer)) {
            return false;
        }

        var player = Game.thePlayer;

        // if we are adjacent to the player, then attack instead of hunting
        var offsets = Math.abs(player.x - owner.x) + Math.abs(player.y - owner.y);
        if (offsets === 1) {
            if (this.isAttacker) {
                this.attack(player);
                return true;
            }
        }

        // generate the path and move to the first tile
        var path = new ROT.Path.AStar(player.x, player.y, function(x, y) {
            // if an entity is present on the tile, can't move there
            var entity = owner.level.getEntityAt(x, y);
            if (entity && entity !== player && entity !== owner) {
                return false;
            }
            return owner.level.map.getTile(x, y).isWalkable;
        }, {topology: 4});
        // once we've gotten the path, we want to move to the second cell that is
        // passed in the callback (the first is the entity's starting point)
        var count = 0;
        var succeeded = false;
        path.compute(owner.x, owner.y, function(x, y) {
            if (count == 1) {
                succeeded = owner.tryMove(x, y);
            }
            count++;
        });
        return succeeded;
    }

};

