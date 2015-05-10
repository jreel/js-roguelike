/**
 * Created by jreel on 4/7/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */


Game.Templates.Items = {

    corpse: {
        name: 'corpse',
        //character: '☠',
        character: '%',
        edible: {
            foodValue: 75
        },
        noRandom: true
    },

    mushroom: {
        name: 'mushroom',
        character: 'ϙ',
        foreground: '#784',
        edible: {
            foodValue: 20
        }
    },

    rock: {
        name: 'rock',
        character: '•',
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
        character: '►',
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
    },

    // Weapons

    dagger: {
        name: 'dagger',
        character: '⍭',
        foreground: '#888',
        equippable: {
            attackValue: 4,
            isWieldable: true
        }
        //noRandom: true
    },

    sword: {
        name: 'sword',
        character: '〆',
        foreground: '#fff',
        equippable: {
            attackValue: 6,
            isWieldable: true
        }
        //noRandom: true
    },

    staff: {
        name: 'staff',
        character: '⌠',
        foreground: "#940",
        equippable: {
            attackValue: 5,
            defenseValue: 1,
            isWieldable: true
        }
        //noRandom: true
    },

    // Wearables

    leathervest: {
        name: 'leather vest',
        character: '⍌',
        foreground: "#940",
        equippable: {
            defenseValue: 2,
            isWearable: true
        }
        //noRandom: true
    },

    chainmail: {
        name: 'chainmail',
        character: '¥',
        foreground: "#999",
        equippable: {
            defenseValue: 4,
            isWearable: true
        }
        //noRandom: true
    },

    platearmor: {
        name: 'plate armor',
        character: 'Ѫ',
        foreground: "#aad",
        equippable: {
            defenseValue: 6,
            isWearable: true
        }
        //noRandom: true
    },

    spikyarmor: {
        name: 'spiky armor',
        character: '♊',
        foreground: "#800",
        equippable: {
            attackValue: 1,
            defenseValue: 5,
            isWearable: true
        }
        //noRandom: true
    },

    // weird items

    pumpkin: {
        name: 'pumpkin',
        character: 'ტ',
        foreground: "#f60",
        edible: {
            foodValue: 60
        },
        equippable: {
            defenseValue: 1,
            isWearable: true
        }
    },

    meatstick: {
        name: 'haunch of meat',
        character: 'ǫ',
        foreground: "#820",
        edible: {
            foodValue: 50
        },
        equippable: {
            attackValue: 1,
            isWieldable: true
        }
    },

    baguette: {
        name: 'baguette',
        character: '/',
        foreground: "#EB8",
        edible: {
            foodValue: 50
        },
        equippable: {
            attackValue: 1,
            isWieldable: true
        }
    }

};

Game.ItemFactory = new Game.Factory('items', Game.Item, Game.Templates.Items);

