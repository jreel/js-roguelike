/**
 * Created by jreel on 4/7/2015.
 */


Game.Templates.Items = {

    corpse: {
        name: 'corpse',
        character: '%',
        edible: {
            foodValue: 75
        },
        noRandom: true
    },

    mushroom: {
        name: 'mushroom',
        character: '⍾',
        foreground: '#784',
        edible: {
            foodValue: 20
        }
    },

    rock: {
        name: 'rock',
        character: '*',
        foreground: '#678',
        edible: false
    },

    apple: {
        name: 'apple',
        character: 'Ó',
        foreground: '#f00',
        edible: {
            foodValue: 40
        }
    },

    cheese: {
        name: 'piece of cheese',
        character: '⪩',
        foreground: '#fc0',
        edible: {
            foodValue: 50
        }
    },

    cheesewheel: {
        name: 'wheel of cheese',
        character: '◶',
        foreground: '#fc0',
        edible: {
            foodValue: 50,
            portions: 8
        }
    }

};

Game.ItemRepository = new Game.Repository('items', Game.Item, Game.Templates.Items);

