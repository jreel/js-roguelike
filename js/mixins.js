/**
 * Created by jreel on 4/4/2015.
 */

// Components aka "Mixins"
// to be used with (after) constructor function
// called via the augment function in utility.js
// which applies mixin properties/methods onto a class prototype
//
// example usage:  augment(Game.Entity, Game.Mixins.destructible);

// TODO: does this get moved to repository system as well?
Game.Mixins = { };

Game.Mixins.movable = {
    canMove: true,
    tryMove: function(x, y, level) {
        level = level || this.level;
        // args (x, y) is the new/desired (x, y)
        var tile = level.map.getTile(x, y);
        var target = level.getEntityAt(x, y);
        // If an entity is present on the tile,
        // then try to attack it if we can
        if (target) {
            if (this.isAttacker && this.willAttack(target)) {
                this.attack(target);
                return true;
            } else {
                // if we can't attack the occupant,
                // then we can't move to that tile
                return false;
            }
        } else if (tile.isWalkable) {
            // if the tile is unoccupied,
            // first check if this is a special tile
            // and display message if so
            if (this === Game.thePlayer) {
                // TODO: support for different tilesets
                if (tile == Game.Tile.prevLevelTile) {
                    Game.sendMessage(this, String.format("Press [Space] to go back to level %s.",
                        level.level - 1));
                }
                if (tile == Game.Tile.nextLevelTile) {
                    Game.sendMessage(this, String.format("Press [Space] to advance to level %s.",
                        level.level + 1));
                }
                // check if we can simply walk there
                // and if so, update our position
                this.setPosition(x, y);
                return true;
            } else if (tile.canSpawnHere) {
                this.setPosition(x, y);
                return true;
            } else {
                // this is not a player,
                // and the tile is set for mobs to not be here
                // (for instance, stairs... mobs randomly moving onto
                // stairs may prevent player from accessing them.
                return false;
            }
        } else if (tile.isDiggable && this === Game.thePlayer) {
            // if the tile isn't walkable,
            // check if it's diggable
            level.map.dig(x, y);
            return true;
        } else {
            return false;
        }
    }
};

Game.Mixins.actor = {
    isActor: true,
    act: function() {
        if (this.behaviors && (this.behaviors !== {})) {
            var behaviorsArray = Object.keys(this.behaviors);
            behaviorsArray = behaviorsArray.randomize();        // mix 'em up
            var rnd = randomInt(0, behaviorsArray.length - 1);
            var rndKey = behaviorsArray[rnd];
            this.behaviors[rndKey](this);
        }
    }
};

Game.Mixins.destructible = {
    isDestructible: true,
    takeDamage: function(attacker, damageType, damageAmount) {
        // TODO: support for damage resistance/reduction?
        this.hp -= damageAmount;
        // if the hp are now 0 or less, remove us from the map
        if (this.hp <= 0) {
            Game.sendMessage(attacker, String.format('You kill the %s!', this.name));
            Game.sendMessage(this, String.format('You have been slain by the %s!', attacker.name));

            // check if it was the player that died, if so call player.act() to prompt the
            // user to exit to the lose screen
            // TODO: support for party system
            if (this === Game.thePlayer) {
                this.act();
            } else {
                this.destroy();
            }
        }
    }
};

Game.Mixins.attacker = {
    isAttacker: true,
    willAttack: function(target) {
        return (this.isHostile ? !target.isHostile : target.isHostile)
    },
    attack: function(target) {
        // if the target is destructible, calculate the damage
        // based on attack and defense values
        // TODO: probably a total re-write based on weapons, etc.
        if (target.isDestructible) {
            var attack = this.baseAttackValue;
            var defense = target.defense;
            var maxDmg = Math.max(0, attack - defense);
            var damage = 1 + Math.floor(Math.random() * maxDmg);

            Game.sendMessage(this, String.format('You strike the %s for %s damage!', target.name, damage));
            Game.sendMessage(target, String.format('The %s strikes you for %s damage!', this.name, damage));

            target.takeDamage(this, 'blunt', damage);
        }
    }
};

Game.Mixins.messageRecipient = {
    isMessageRecipient: true,
    messages: [],
    receiveMessage: function(message) {
        this.messages.push(message);
    },
    clearMessages: function() {
        this.messages = [];
    }
};

Game.Mixins.sight = {
    hasSight: true
};

Game.Mixins.holdsInventory = {
    holdsInventory: true,

};





