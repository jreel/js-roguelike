/**
 * Created by jreel on 4/4/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// Components aka "Mixins"
// these can typically be used in one of two ways
// 1. to be used with (after) a constructor function
// called via the augment function in utility.js
// which applies mixin properties/methods onto a class prototype
//
// example usage:  augment(Game.Entity, Game.Mixins.destructible);
//
// note that because these are set on the constructor prototype,
// all of these methods will be shared by a class, rather than being
// duplicated on each and every instance of that class.
//
// each of these mixins has an associated bool flag, to allow a template
// to turn off the mixin behavior for the templated instance.
// this means, however, that a check of the bool flag, and possible early return
// is required for pretty much every method.
//
// 2. to be used in a creature/item template and thus applied only
// to that instance. See monsters.js for example usage.
// The mixin properties and methods will then be 'mixed in' via a
// subroutine in the Game.DynamicGlyph constructor, which every other
// class *should* be an instance of somewhere down the inheritance chain.

// TODO: does this get moved to repository system as well?
Game.Mixins = { };

Game.Mixins.movable = {
    canMove: true,
    tryMove: function(x, y, level) {
        if (!this.canMove) { return false; }
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
                    Game.sendMessage('info', this, "Press [Space] to go back to level %s.", level.level - 1);
                }
                if (tile == Game.Tile.nextLevelTile) {
                    Game.sendMessage('info', this, "Press [Space] to advance to level %s.", level.level + 1);
                }
                // check if we can simply walk there
                // and if so, update our position
                this.setPosition(x, y);
                // if there are items here, let the player know
                var items = this.level.getItemsAt(x, y);
                if (items) {
                    if (items.length === 1) {
                        Game.sendMessage('info', this, "You see %s", items[0].describeA() + ".");
                    } else {
                        Game.sendMessage('info', this, "You see a small pile of things here.");
                    }
                }
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
        if (!this.isActor) { return; }
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
    init: function(template) {
        this.maxHP = template['maxHP'] || 10;
        this.hp = template['hp'] || this.maxHP;
        this.defense = template['baseDefenseValue'] || 0;
    },
    takeDamage: function(attacker, damageType, damageAmount) {
        if (!this.isDestructible) { return; }
        // TODO: support for damage resistance/reduction?
        this.hp -= damageAmount;
        // if the hp are now 0 or less, remove us from the map
        if (this.hp <= 0) {
            Game.sendMessage('default', attacker, "You kill the %s!", this.name);
            var message = String.format("You have been slain by the %s!", attacker.name);

            // if entity is a corpse dropper, try to create the corpse
            if (this.dropsCorpse) {
                this.tryDropCorpse();
            }

            // check if it was the player that died, if so call player.act() to prompt the
            // user to exit to the lose screen
            // (this is now checked in Game.Entity.kill() method)
            // TODO: support for party system
            this.kill(message);
        }
    },
    getHpState: function() {
        if (!this.isDestructible) { return '%c{#0ff}Indestructible!'; }
        var hpPct = (this.hp / this.maxHP) * 100;
        var color;
        if (hpPct <= 25) {
            color = '#f00';
        } else if (hpPct <= 50) {
            color = '#f80';
        } else if (hpPct <= 75) {
            color = '#ff0';
        } else {
            color = '#0a0';
        }
        return '%c{' + color + '}' + this.hp + '/' + this.maxHP + '%c{}';
    }
};

Game.Mixins.attacker = {
    isAttacker: true,
    init: function(template) {
        this.attackValue = template['baseAttackValue'] || 1;
    },
    willAttack: function(target) {
        if (!this.isAttacker) { return false; }
        return (this.isHostile ? !target.isHostile : target.isHostile)
    },
    attack: function(target) {
        if (!this.isAttacker) { return; }
        // if the target is destructible, calculate the damage
        // based on attack and defense values
        // TODO: probably a total re-write based on weapons, etc.
        if (target.isDestructible) {
            var attack = this.attackValue;
            var defense = target.defense;
            var maxDmg = Math.max(0, attack - defense);
            var damage = 1 + Math.floor(Math.random() * maxDmg);

            Game.sendMessage('default', this, "You strike the %s for %s damage!", target.name, damage);
            Game.sendMessage('warning', target, "The %s strikes you for %s damage!", this.name, damage);

            target.takeDamage(this, 'blunt', damage);
        }
    }
};

Game.Mixins.messageRecipient = {
    isMessageRecipient: true,
    messages: [],
    init: function(template) {
        this.messages = [];
    },
    receiveMessage: function(message) {
        if (!this.isMessageRecipient) { return; }
        this.messages.push(message);
        // clear old messages
        if (this.messages.length > Game.msgScreenHeight) {
            this.messages.shift();
        }
    },
    clearMessages: function() {
        this.messages.length = 0;
        this.messages = [];
    }
};

Game.Mixins.sight = {

    hasSight: true,
    init: function(template) {
        this.sightRadius = template['sightRadius'] || 5;
    }
};

Game.Mixins.inventoryHolder = {
    holdsInventory: true,
    init: function(template) {
        this.inventorySlots = template['inventorySlots'] || 10;
        this.inventory = new Array(this.inventorySlots);
    },
    getInventory: function() {
        return this.holdsInventory ? this.inventory : null;
    },
    getItem: function(i) {
        return this.holdsInventory ? this.inventory[i] : null;
    },
    addItem: function(item) {
        if (!this.holdsInventory) { return false; }
        // try to find a free inventory slot, return true only if
        // the item was successfully added
        for (var i = 0; i < this.inventory.length; i++) {
            if (!this.inventory[i]) {
                this.inventory[i] = item;
                return true;
            }
        }
        return false;
    },
    removeItem: function(i) {
        if (!this.holdsInventory) { return; }
        // simply clear the inventory slot
        this.inventory[i] = null;
    },
    canAddItem: function() {
        if (!this.holdsInventory) { return false; }
        // check if we have an empty slot
        for (var i = 0; i < this.inventory.length; i++) {
            if (!this.inventory[i]) {
                return true;
            }
        }
        return false;
    },
    pickupItems: function(indices) {
        if (!this.holdsInventory) { return false; }
        // allows the user to pick up items from the map, where indices
        // is the indices for the array returned by level.getItemsAt
        var mapItems = this.level.getItemsAt(this.x, this.y);
        var added = 0;
        // iterate through all indices
        for (var i = 0; i < indices.length; i++) {
            // try to add the item. If our inventory is not full, then splice
            // the item out of the list of items. In order to fetch the right
            // item, we have to offset the number of items already added.
            if (this.addItem(mapItems[indices[i] - added])) {
                mapItems.splice(indices[i] - added, 1);
                added++;
            } else {
                // inventory is full
                break;
            }
        }
        // update the map items
        this.level.setItemsAt(this.x, this.y, mapItems);
        // return true only if we added all items
        return (added === indices.length);
    },
    dropItem: function(i) {
        if (!this.holdsInventory) { return; }
        // drops an item to the current map tile
        if (this.inventory[i]) {
            if (this.level) {
                this.level.addItem(this.x, this.y, this.inventory[i]);
            }
            this.removeItem(i);
        }
    }
};

Game.Mixins.foodEater = {
    eatsFood: true,
    init: function(template) {
        this.maxFullness = template['maxFullness'] || 1000;
        this.fullness = template['fullness'] || (this.maxFullness) / 2;
        this.hungerRate = template['hungerRate'] || 1;
    },
    addHunger: function(amount) {
        if (!this.eatsFood) { return; }
        // if no args, remove the standard depletion points
        if (!amount) {
            amount = this.hungerRate;
        }
        this.modifyFullness(-amount);
    },
    modifyFullness: function(amount) {
        if (!this.eatsFood) { return; }
        this.fullness += amount;
        if (this.fullness <= 0) {
            this.kill("You have died of starvation!");
        } else if (this.fullness > this.maxFullness) {
            this.kill("Your stomach has ruptured from overeating!");
        }
    },
    getHungerState: function() {
        if (!this.eatsFood) { return 'Not Hungry'; }
        var hungerPct = (this.fullness / this.maxFullness) * 100;
        if (hungerPct <= 5) {
            return '%c{#f00}Starving!%c{}';
        } else if (hungerPct <= 25) {
            return '%c{#ff0}Hungry%c{}';
        } else if (hungerPct >= 95) {
            return '%c{#f00}Overstuffed!%c{}';
        } else if (hungerPct >= 75) {
            return 'Full';
        } else {
            return 'Not Hungry';
        }
    }
};

Game.Mixins.corpseDropper = {
    dropsCorpse: true,
    init: function(template) {
        this.corpseDropRate = template['corpseDropRate'] || 100;
    },
    tryDropCorpse: function() {
        if (!this.dropsCorpse) { return; }
        if (ROT.RNG.getPercentage() < this.corpseDropRate) {
            // create a new corpse item and drop it
            var deadThing = this;
            var corpse = Game.ItemRepository.create('corpse',
                        { name: deadThing.name + ' corpse',
                        foreground: deadThing.foreground });
            this.level.addItem(this.x, this.y, corpse);
        }
    }
};


/* ITEM mixins */
// TODO: move to separate file

// edible items
Game.Mixins.edible = {
    isEdible: true,
    init: function(template) {
        // number of points to add to hunger
        this.foodValue = template['foodValue'] || 5;
        // number of times the item can be consumed
        this.maxPortions = template['portions'] || 1;
        this.remainingPortions = this.maxPortions;
    },
    eat: function(eater) {
        if (eater.eatsFood) {
            if (this.remainingPortions > 0) {
                eater.modifyFullness(this.foodValue);
                this.remainingPortions--;
            }
        }
    },
    describe: function() {
        var pctLeft = (this.remainingPortions / this.maxPortions) * 100;
        if (pctLeft == 100) {
            return this.name;
        } else if (pctLeft > 70) {
            return 'partly eaten ' + Game.Item.prototype.describe.call(this);
        } else if (pctLeft > 30) {
            return 'half-eaten ' + Game.Item.prototype.describe.call(this);
        } else {
            return 'mostly eaten ' + Game.Item.prototype.describe.call(this);
        }

    }
};



