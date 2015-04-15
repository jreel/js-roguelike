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
        if (owner.growthRemaining <=0 || ROT.RNG.getPercentage() > 1) {
            return;
        }
        // Generate the coordinates of a random adjacent square by
        // generating an offset between [-1, 0, 1] for both the x and
        // y directions. To do this, we generate a number from 0-2 and
        // then subtract 1.
        var xOffset = Math.floor(Math.random() * 3) - 1;
        var yOffset = Math.floor(Math.random() * 3) - 1;

        // Make sure we aren't trying to spread into the same tile
        if (xOffset === 0 && yOffset === 0) {
            return;
        }
        var xTarget = owner.x + xOffset;
        var yTarget = owner.y + yOffset;

        // Check that we can actually spread into that location,
        // and if so, then we grow!
        if (!level.map.isEmptyFloor(xTarget, yTarget, level)) {
            return;
        }

        var newGrowth = Game.MonsterRepository.create(owner.name);
        newGrowth.setPosition(xTarget, yTarget);
        level.addEntity(newGrowth);
        owner.growthRemaining--;

        // alert nearby
        Game.sendMessageNearby(level, xTarget, yTarget, 5, "%c{" + owner.foreground + "}The %s is spreading!", owner.name);
    },

    wanderer: function(owner) {
        // move by 1 unit in a random direction every time this behavior is called
        owner = owner || this;

        // first, ensure that we are able to move
        if (!owner.canMove) {
            return;
        }
        // flip coin to determine +1 or -1
        var moveOffset = (Math.round(Math.random()) === 1) ? 1: -1;
        // flip coin to determine x direction or y direction
        if (Math.round(Math.random()) === 1) {
            owner.tryMove(owner.x + moveOffset, owner.y);
        } else {
            owner.tryMove(owner.x, owner.y + moveOffset);
        }
    }

};

