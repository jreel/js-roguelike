/**
 * Created by jreel on 3/29/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// also see monsters.js
Game.Creature = function(template) {
    var defaults = {
        name: "creature",
        description: "This is an alien-like creature.",
        isHostile: true,        // since most creatures will be

        // mixin-specific properties
        movable: true,
        actor: true,
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
        corpseDropper: {
            corpseDropRate: 100
        }

    };

    // apply defaults into our template where needed
    template = applyDefaults(template, defaults);

    /*
    var keys = Object.keys(defaults);
    for (var k = 0; k < keys.length; k++) {
        var key = keys[k];
        if (!template.hasOwnProperty(key)) {
            template[key] = defaults[key];
        }
    }
    */

    // Call the Entity constructor with composite template
    // this should also handle applying any mixins
    Game.Entity.call(this, template);

    // Set up any of our own properties that need it
    // this.hp = template['hp'] || this.maxHP;

    if (template['behaviors'] && template['behaviors'] !== {}) {
        this.behaviors = template['behaviors'];
    }

};
// Make creatures inherit all functionality of entities
Game.Creature.extend(Game.Entity);

// apply mixins that all creatures should have
/*
augment(Game.Creature, Game.Mixins.movable);
augment(Game.Creature, Game.Mixins.destructible);
augment(Game.Creature, Game.Mixins.attacker);
augment(Game.Creature, Game.Mixins.actor);
augment(Game.Creature, Game.Mixins.dropsCorpse);
*/

