/**
 * Created by jreel on 3/29/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

Game.Templates.Monsters = {

    /* The defaults from the Game.Creature constructor;
        these will be used if not defined in a template

     var defaults = {
         name: "creature",
         description: "This is an alien-like creature.",
         isHostile: true,     // since most creatures will be
         speed: 5,

         // mixin-specific properties
         movable: true,
         actor: true,
         destructible: {
             maxHP: 10,
             hp: 10     // defaults to maxHP
             baseDefenseValue: 0
         },
         attacker: {
             baseAttackValue: 1
         },
         sight: {
             sightRadius: 5
         },
         corpseDropper: {
             corpseDropChance: 100
         },

         // other mixins typically reserved for Player
         messageRecipient: false,
         inventoryHolder: false,    // {inventorySlots: 10}
         foodEater: false,      // {maxFullness: 1000, hungerRate: 1}
         armorUser: false,
         weaponUser: false
     };
     */

    fungus: {
        name: 'fungus',
        character: 'F',
        foreground: '#682',     // close to "olive drab"
        destructible: {
            maxHP: 1,
            baseDefenseValue: 2
        },
        attacker: false,
        sight: false,
        corpseDropper: false,
        growthRemaining: 5,    // fungus will try to grow each turn
        growPctChance: 1,     // % chance to grow
        speed: 1,
        // TODO: could this be implemented as a simple array or chance table?
        // we'd need to change this in mixins.act as well.
        behaviors: ['fungalGrowth']
    },

    bat: {
        name: 'bat',
        character: 'B',
        foreground: '#431',     // dark brown
        destructible: {
            maxHP: 5
        },
        attacker: {
            baseAttackValue: 2
        },
        sight: false,
        speed: 10,
        behaviors: ['wander']
    },

    newt: {
        name: 'newt',
        character: 'n',
        foreground: '#ff0',
        destructible: {
            maxHP: 3
        },
        attacker: {
            baseAttackValue: 1
        },
        sight: {
            sightRadius: 3
        },
        speed: 8,
        behaviors: ['wander']
    },

    kobold: {
        name: 'kobold',
        character: 'k',
        foreground: '#4d8',
        destructible: {
            maxHP: 8,
            baseDefenseValue: 1
        },
        attacker: {
            baseAttackValue: 3
        },
        sight: {
            sightRadius: 5
        },
        speed: 7,
        behaviors: ['hunt', 'wander']       // hunt the player if in range, otherwise wander
    },

    giantZombie: {
        name: 'giant zombie',
        character: 'Z',
        foreground: '#088',
        noRandom: true,
        worldBoss: true,
        destructible: {
            maxHP: 30,
            baseDefenseValue: 2
        },
        attacker: {
            baseAttackValue: 5
        },
        sight: {
            sightRadius: 7
        },
        expLevel: 5,
        speed: 3,
        hasGrown: false,
        behaviors: ['zombieGrowth', 'spawnSlime', 'hunt', 'wander']
    },

    slime: {
        name: 'slime',
        character: 's',
        foreground: '#9f9',
        noRandom: true,
        destructible: {
            maxHP: 5,
            baseDefenseValue: 2
        },
        attacker: {
            baseAttackValue: 5
        },
        sight: {
            sightRadius: 3
        },
        speed: 5,
        behaviors: ['hunt', 'wander']       // hunt the player if in range, otherwise wander
    }
};


Game.MonsterFactory = new Game.Factory('monsters', Game.Creature, Game.Templates.Monsters);

/* To me, the template system above is easier to read/write/maintain than the
   Factory.define system commented out below.

   Ideally, the Game.Factory constructor function would also accept a
   template collection object as an argument, and execute the .define methods on each
   member template automatically.

*/


/*
Game.MonsterFactory.define('fungus', {
    name: 'fungus',
    character: 'F',
    foreground: 'green',
    maxHP: 10,
    attackValue: 0,
    isAttacker: false,
    growthRemaining: 5,    // fungus will try to grow each turn
    // to do: could this be implemented as a simple array or chance table?
    // we'd need to change this in mixins.act as well.
    behaviors: { fungalGrowth: Game.Behaviors.fungalGrowth }
});

Game.MonsterFactory.define('bat', {
    name: 'bat',
    character: 'B',
    foreground: '#431',     // dark brown
    maxHP: 5,
    attackValue: 4,
    behaviors: { wanderer: Game.Behaviors.wanderer }
});

Game.MonsterFactory.define('newt', {
    name: 'newt',
    character: 'n',
    foreground: 'yellow',
    maxHP: 3,
    attackValue: 2,
    behaviors: { wanderer: Game.Behaviors.wanderer }
});
*/
