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
        //character: 'ϙ',
        character: '\uD83C\uDF44', // 🍄
        foreground: '#784',
        edible: {
            foodValue: 20
        }
    },

    rock: {
        name: 'rock',
        character: '•',
        foreground: '#678',
        edible: false,
        throwable: {
            thrownAttackValue: 1
        }
    },

    apple: {
        name: 'apple',
        //character: 'Ó',
        character: '\uD83C\uDF4E', // 🍎
        foreground: '#f00',
        edible: {
            foodValue: 40
        },
        throwable: {
            thrownAttackValue: 1
        }
    },

    cheese: {
        name: 'piece of cheese',
        character: '►',
        foreground: '#fc0',
        edible: {
            foodValue: 50
        },
        throwable: {
            thrownAttackValue: 1
        }
    },

    cheesewheel: {
        name: 'wheel of cheese',
        character: '◶',
        foreground: '#fc0',
        edible: {
            foodValue: 50,
            portions: 8
        },
        throwable: {
            thrownAttackValue: 1
        }
    },

    // Weapons

    dagger: {
        name: 'dagger',
        //character: '⟊',
        character: '\uD800\uDCC9',  // 𐃉
        foreground: '#888',
        equippable: {
            attackValue: 4,
            isWieldable: true
        },
        throwable: {
            thrownAttackValue: 1
        }
        //noRandom: true
    },

    sword: {
        name: 'sword',
        //character: '⸸',
        character: '\uD83D\uDDE1',  // 🗡
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

    bow: {
        name: 'bow',
        character: '⦄',
        foreground: "#940",
        equippable: {
            attackValue: 5,
            isWieldable: true
        }
        //noRandom: true
    },

    shield: {
        name: 'shield',
        //character: '⩌',
        character: '\uD83D\uDEE1',  // 🛡
        foreground: '#999',
        equippable : {
            attackValue: 0,
            defenseValue: 2
        },
        noRandom: true
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

    clothrobes: {
        name: 'cloth robes',
        character: '\uD83D\uDC58', // 👘
        foreground: "#009",
        equippable: {
            attackValue: 0,
            defenseValue: 1,
            isWearable: true
        }
        //noRandom: true
    },

    leatherbag: {
        name: 'leather bag',
        character: '\uD83C\uDF92', // 🎒
        foreground: "#a60",
        equippable: {
            attackValue: 0,
            defenseValue: 1,
            isWearable: true
        }
        //noRandom: true
    },


    // weird items

    pumpkin: {
        name: 'pumpkin',
        //character: 'ტ',
        character: '\uD83C\uDF83',  // 🎃
        foreground: "#f60",
        edible: {
            foodValue: 60
        },
        equippable: {
            defenseValue: 1,
            isWearable: true
        },
        throwable: {
            thrownAttackValue: 1
        }
    },

    meatstick: {
        name: 'haunch of meat',
        //character: 'ǫ',
        character: '\uD83C\uDF56',  // 🍖
        foreground: "#820",
        edible: {
            foodValue: 50
        },
        equippable: {
            attackValue: 1,
            isWieldable: true
        }
    },

    chickenleg: {
        name: 'leg of meat',
        //character: 'ǫ',
        character: '\uD83C\uDF57',  // 🍗
        foreground: "#963",
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
        //character: '/',
        character: '\uD83C\uDF5E',  // 🍞
        foreground: "#EB8",
        edible: {
            foodValue: 50
        },
        equippable: {
            attackValue: 1,
            isWieldable: true
        }
    },

    bread: {
        name: 'bread',
        //character: '/',
        character: '\uD83C\uDF5E',  // 🍞
        foreground: "#DB7",
        edible: {
            foodValue: 50
        }
    }

};

Game.ItemFactory = new Game.Factory('items', Game.Item, Game.Templates.Items);

