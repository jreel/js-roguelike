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
                    Game.sendMessage('info', this, "Press [Space] to go back to level %s.", level.area - 1);
                }
                if (tile == Game.Tile.nextLevelTile) {
                    Game.sendMessage('info', this, "Press [Space] to advance to level %s.", level.area + 1);
                }
                if (tile == Game.Tile.holeToCavernTile) {
                    Game.sendMessage('danger', this, "There is a dark, seemingly bottomless hole here. Press [Space] to jump in!");
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
        if (!this.isActor) { return false; }
        if (this.behaviors && (this.behaviors !== [])) {
            // uncomment this if you change behaviors back to an object
            /*
            var behaviorsArray = Object.keys(this.behaviors);
            behaviorsArray = behaviorsArray.randomize();        // mix 'em up
            var rnd = randomInt(0, behaviorsArray.length - 1);
            var rndKey = behaviorsArray[rnd];
            this.behaviors[rndKey](this);
            */

            // iterate through behaviors array
            for (var i = 0; i < this.behaviors.length; i++) {
                var behavior = this.behaviors[i];
                // try to perform the behavior.
                // behavior functions should return true or false
                // depending on whether they were successfully executed.
                // if true, then we are done; exit the function.
                // if not, then we continue the loop and try the next behavior.
                var success = Game.Behaviors[behavior](this);
                if (success) {
                    return true;
                }
            }
        }
        return false;
    }
};

Game.Mixins.destructible = {
    isDestructible: true,
    init: function(template) {
        this.maxHP = template['maxHP'] || 10;
        this.hp = template['hp'] || this.maxHP;
        this.defense = template['baseDefenseValue'] || 0;
    },
    listeners: {
        onGainLevel: function() {
            // heal the entity
            this.setHp(this.maxHP);
        }
    },
    setHp: function(hp) {
        this.hp = hp;
    },
    increaseDefenseValue: function(amount) {
        // if no amount was passed, default to +1
        amount = amount || 1;
        this.defense += amount;
        Game.sendMessage('info', this, "You feel tougher!");
    },
    increaseMaxHp: function(amount) {
        // if no amount was passed, default to +5
        amount = amount || 5;
        // add to both current (hp) and maxHP
        this.maxHP += amount;
        this.hp += amount;
        Game.sendMessage('info', this, "You feel healthier!");
    },
    getDefenseValue: function() {
        var modifier = 0;
        // if we can equip items, then we should take into account
        // our weapons and armor
        if (this.canWearArmor || this.canWieldWeapons) {
            if (this.weapon) {
                modifier += this.weapon.defenseValue;
            }
            if (this.armor) {
                modifier += this.armor.defenseValue;
            }
        }
        return this.defense + modifier;
    },
    takeDamage: function(attacker, damageType, damageAmount) {
        if (!this.isDestructible) { return; }
        // TODO: support for damage resistance/reduction?
        this.hp -= damageAmount;
        this.raiseEvent('onTakeDamage', damageAmount);
        // if the hp are now 0 or less, remove us from the map
        if (this.hp <= 0) {
            Game.sendMessage('default', attacker, "You kill the %s!", this.name);
            var message = String.format("You have been slain by the %s!", attacker.name);

            // Raise events
            this.raiseEvent('onDeath', attacker);
            attacker.raiseEvent('onKill', this);

            /*  REPLACED by above code (events)
            // if entity is a corpse dropper, try to create the corpse
            if (this.dropsCorpse) {
                this.tryDropCorpse();
            }
            */

            // check if it was the player that died, if so call player.act() to prompt the
            // user to exit to the lose screen
            // (this is now checked in Game.Entity.kill() method)
            // TODO: support for party system
            this.kill(message);

            // give the attacker experience points
            /* MOVED to onKill event listener in experienceGainer mixin
            if (attacker.gainsExperience) {
                var exp = this.maxHP + this.getDefenseValue();
                if (this.isAttacker) {
                    exp += this.getAttackValue();
                }
                // account for area differences
                if (this.gainsExperience) {
                    exp -= (attacker.explevel - this.explevel) * 3;
                }
                // only give exp if greater than 0
                if (exp > 0) {
                    attacker.giveExperience(exp);
                }
            }
            */
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
    getAttackValue: function() {
        var modifier = 0;
        // if we can equip items, then we should take into account
        // our weapons and armor
        if (this.canWearArmor || this.canWieldWeapons) {
            if (this.weapon) {
                modifier += this.weapon.attackValue;
            }
            if (this.armor) {
                modifier += this.armor.attackValue;
            }
        }
        return this.attackValue + modifier;
    },
    increaseAttackValue: function(amount) {
        // if no value was passed, default to +1
        amount = amount || 1;
        this.attackValue += amount;
        Game.sendMessage('info', this, "You feel stronger!");
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
            var attack = this.getAttackValue();
            var defense = target.getDefenseValue();
            var maxDmg = Math.max(0, attack - defense);
            var damage = 1 + Math.floor(Math.random() * maxDmg);

            var weapon;
            if (this.weapon) {
                weapon = this.weapon.name;
            } else {
                weapon = "bare fists";
            }

            Game.sendMessage('default', this, "You hit the %s with your %s for %s damage!", target.name, weapon, damage);
            Game.sendMessage('warning', target, "The %s hits you for %s damage!", this.name, damage);

            target.takeDamage(this, 'blunt', damage);
            this.raiseEvent('onDealDamage', damage);
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
    },
    increaseSightRadius: function(amount) {
        // if no amount passed default to 1
        amount = amount || 1;
        this.sightRadius += amount;
        Game.sendMessage('info', this, "You feel more aware!");
    },
    canSee: function(entity) {
        // if not on the same area, then exit early
        if (!entity || this.level !== entity.area) {
            return false;
        }
        // if we're not in a square field of view, then we won't be in a real
        // field of view either (this is to save FOV computation if it's not needed)
        var squareX = (entity.x - this.x) * (entity.x - this.x);
        var squareY = (entity.y - this.y) * (entity.y - this.y);
        if ((squareX + squareY) > (this.sightRadius * this.sightRadius)) {
            return false;
        }
        // compute the FOV and check if coordinates are within
        var found = false;
        this.level.fov.compute(
            this.x, this.y,
            this.sightRadius,
            function(x, y, radius, visibility) {
                if (x === entity.x && y === entity.y) {
                    found = true;
                }
            });
        return found;
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
        // if we can equip items, we want to make sure we unequip
        // the item we are removing if we need to
        if (this.inventory[i] && (this.canWearArmor || this.canWieldWeapons)) {
            this.unequip(this.inventory[i]);
        }

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
        // is the indices for the array returned by area.getItemsAt
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
            Game.sendMessage('default', this, "You drop the %s on the ground.", this.inventory[i].name);
            this.removeItem(i);
        }
    },
    unequip: function(item) {
        if (this.weapon === item) {
            this.unwield();
        }
        if (this.armor === item) {
            this.takeOff();
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
        var hungerPct = (this.fullness / this.maxFullness) * 100;
        if (this.fullness <= 0) {
            this.kill("You have died of starvation!");
        } else if (hungerPct <= 5) {
            this.hungryToken = true;
            this.fullToken = false;
            Game.sendMessage('danger', this, "You are starving!");
        } else if (hungerPct <= 25) {
            this.fullToken = false;
            if (!this.hungryToken) {
                Game.sendMessage('warning', this, "You feel hungry.");
                this.hungryToken = true;
            }
        } else if (this.fullness > this.maxFullness) {
            this.kill("Your stomach has ruptured from overeating!");
        } else if (hungerPct >= 95) {
            this.hungryToken = false;
            this.fullToken = true;
            if (!this.burstToken) {
                this.burstToken = true;
                Game.sendMessage('danger', this, "You have eaten so much you feel like you will burst!");
            }
        } else if (hungerPct >= 75) {
            this.hungryToken = false;
            if (!this.fullToken) {
                Game.sendMessage('warning', this, "You feel full.");
                this.fullToken = true;
            }
        } else {
            this.hungryToken = false;
            this.fullToken = false;
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
        this.corpseDropChance = template['corpseDropChance'] || 100;
    },
    listeners: {
        onDeath: function(attacker) {
            if (!this.dropsCorpse) { return; }
            // check if we should drop a corpse
            if (ROT.RNG.getPercentage() <= this.corpseDropChance) {
                // create a new corpse item and drop it
                var deadThing = this;
                var corpse = Game.ItemRepository.create('corpse',
                    {
                        name: deadThing.name + ' corpse',
                        foreground: deadThing.foreground
                    }
                );
                this.level.addItem(this.x, this.y, corpse);
            }
        }
    }
/*  REPLACED with onDeath listener
    tryDropCorpse: function() {
        if (!this.dropsCorpse) { return; }
        if (ROT.RNG.getPercentage() < this.corpseDropChance) {
            // create a new corpse item and drop it
            var deadThing = this;
            var corpse = Game.ItemRepository.create('corpse',
                        { name: deadThing.name + ' corpse',
                        foreground: deadThing.foreground });
            this.area.addItem(this.x, this.y, corpse);
        }
    }
*/
};

Game.Mixins.armorUser = {
    canWearArmor: true,
    init: function(template) {
        this.armor = template['startingArmor'] || null;
    },
    wear: function(item) {
        this.armor = item;
    },
    takeOff: function() {
        this.armor = null;
    }
};

Game.Mixins.weaponUser = {
    canWieldWeapons: true,
    init: function(template) {
        this.weapon = template['startingWeapon'] || null;
    },
    wield: function(item) {
        this.weapon = item;
    },
    unwield: function() {
        this.weapon = null;
    }
};

Game.Mixins.experienceGainer = {
    gainsExperience: true,
    init: function(template) {
        this.explevel = template['explevel'] || 1;
        this.experience = template['experience'] || 0;
        this.statPointsPerLevel = template['statPointsPerLevel'] || 1;
        this.statPoints = 0;
        // determine what stats can be levelled up
        this.statOptions = [];
        if (this.isAttacker) {
            this.statOptions.push(['Increase attack value', this.increaseAttackValue]);
        }
        if (this.isDestructible) {
            this.statOptions.push(['Increase defense value', this.increaseDefenseValue]);
            this.statOptions.push(['Increase max health', this.increaseMaxHp]);
        }
        if (this.hasSight) {
            this.statOptions.push(['Increase sight range', this.increaseSightRadius]);
        }
    },
    listeners: {
        onKill: function(victim) {
            var exp = victim.maxHP + victim.getDefenseValue();
            if (victim.isAttacker) {
                exp += victim.getAttackValue();
            }
            // account for level differences
            if (victim.gainsExperience) {
                exp -= (this.explevel - victim.explevel) * 3;
            }
            // only give experience if > 0
            if (exp > 0) {
                this.giveExperience(exp);
            }
        },
        onGainLevel: function() {
            if (this === Game.thePlayer) {
                // setup the gains stat screen and show it
                Game.Screen.gainStatScreen.setup(this);
                Game.Screen.playScreen.setSubScreen(Game.Screen.gainStatScreen);
            } else {
                // randomly select a stat option and execute the callback for each stat point
                while (this.statPoints > 0) {
                    // call the stat increasing function with this as the context
                    var statOption = this.statOptions.random();
                    statOption[1].call(this);
                    this.statPoints--;
                }
            }
        }
    },
    getNextLevelExperience: function() {
        return (this.explevel * this.explevel) * 10;
    },
    giveExperience: function(points) {
        var statPointsGained = 0;
        var levelsGained = 0;
        // loop until all points have been allocated
        while (points > 0) {
            // check if adding in the points will surpass the level threshold
            if (this.experience + points >= this.getNextLevelExperience()) {
                // fill our experience until the next level threshold
                var usedPoints = this.getNextLevelExperience() - this.experience;
                points -= usedPoints;
                this.experience += usedPoints;
                // level up!
                this.explevel++;
                levelsGained++;
                this.statPoints += this.statPointsPerLevel;
                statPointsGained += this.statPointsPerLevel;
            } else {
                // simple case - just give the experience
                this.experience += points;
                points = 0;
            }
        }
        // check if we gained at least one level
        if (levelsGained > 0) {
            Game.sendMessage('info', this, "You feel more experienced!");
            this.raiseEvent('onGainLevel');

            /* MOVED to the onGainLevel event
            // heal the entity if possible
            if (this.isDestructible) {
                this.hp = this.maxHP;
            }
            this.gainStats();
            */
        }
    }
};

Game.Mixins.playerTracker = {
    hasTrackers: true,
    init: function(template) {
        // anything we might want to track for the player (to show on end game screen)
        this.trackers = {};
        this.trackers.turnsTaken = template['turnsTaken'] || 0;
        this.trackers.enemiesSlain = template['enemiesSlain'] || 0;
        //this.trackers.areaExplored = template['areaExplored'] || 1;
        this.trackers.damageDealt = template['damageDealt'] || 0;
        this.trackers.damageReceived = template['damageReceived'] || 0;
        this.trackers.foodEaten = template['foodEaten'] || 0;
        this.trackers.furthestLevel = template['furthestLevel'] || 1;
    },
    listeners: {
        onTurnTaken: function() {
            this.trackers.turnsTaken++;
        },
        onKill: function(victim) {
            this.trackers.enemiesSlain++;
        },
        onChangeLevel: function(newlevel) {
            if (newlevel > this.trackers.furthestLevel) {
                this.trackers.furthestLevel = newlevel;
            }
        },
        onMove: function() {
            // not sure how to implement an 'areaExplored' stat yet...
            // maybe something to do with map explored flag?
        },
        onDealDamage: function(damageAmount) {
            this.trackers.damageDealt += damageAmount;
        },
        onTakeDamage: function(damageAmount) {
            this.trackers.damageReceived += damageAmount;
        },
        onEatFood: function() {
            this.trackers.foodEaten++;
        }
    }
};

Game.Mixins.worldBoss = {
    listeners: {
        onDeath: function(attacker) {
            // switch to win screen!
            Game.sendMessage('info', attacker, "You have defeated the terrible %s!", this.describe());
            Game.switchScreen(Game.Screen.winScreen, 'main');
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
                eater.raiseEvent('onEatFood', this.foodValue);
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

Game.Mixins.equippable = {
    isEquippable: true,
    init: function(template) {
        this.attackValue = template['attackValue'] || 0;
        this.defenseValue = template['defenseValue'] || 0;
        this.isWieldable = template['isWieldable'] || false;
        this.isWearable = template['isWearable'] || false;
    }
};

