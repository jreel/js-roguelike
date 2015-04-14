/**
 * Created by jreel on 3/29/2015.
 */

Game.Templates.Monsters = {

    /* The defaults from the Game.Creature constructor;
        these will be used if not defined in a template

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
     */

    fungus: {
        name: 'fungus',
        character: 'F',
        foreground: '#682',     // close to "olive drab"
        destructible: {
            maxHP: 10
        },
        attacker: false,
        sight: false,
        corpseDropper: false,
        growthRemaining: 5,    // fungus will try to grow each turn
        // TODO: could this be implemented as a simple array or chance table?
        // we'd need to change this in mixins.act as well.
        behaviors: {fungalGrowth: Game.Behaviors.fungalGrowth}
    },

    bat: {
        name: 'bat',
        character: 'B',
        foreground: '#431',     // dark brown
        destructible: {
            maxHP: 5
        },
        attacker: {
            baseAttackValue: 4
        },
        sight: false,
        behaviors: {wanderer: Game.Behaviors.wanderer}
    },

    newt: {
        name: 'newt',
        character: 'n',
        foreground: '#ff0',
        destructible: {
            maxHP: 3
        },
        attacker: {
            baseAttackValue: 2
        },
        behaviors: {wanderer: Game.Behaviors.wanderer}
    }
};


Game.MonsterRepository = new Game.Repository('monsters', Game.Creature, Game.Templates.Monsters);

/* To me, the template system above is easier to read/write/maintain than the
   Repository.define system commented out below.

   Ideally, the Game.Repository constructor function would also accept a
   template collection object as an argument, and execute the .define methods on each
   member template automatically.

*/


/*
Game.MonsterRepository.define('fungus', {
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

Game.MonsterRepository.define('bat', {
    name: 'bat',
    character: 'B',
    foreground: '#431',     // dark brown
    maxHP: 5,
    attackValue: 4,
    behaviors: { wanderer: Game.Behaviors.wanderer }
});

Game.MonsterRepository.define('newt', {
    name: 'newt',
    character: 'n',
    foreground: 'yellow',
    maxHP: 3,
    attackValue: 2,
    behaviors: { wanderer: Game.Behaviors.wanderer }
});
*/
