/**
 * Created by jreel on 4/30/2015.
 */

// TODO: think about other properties of tiles.
// for instance, water tiles.
// isWalkable should be false, but what about
// swimming or boating?

Game.Tileset = function(catalog) {
    // construct a "full" tileset from a catalog.
    // The defaults should contain names and boolean settings;
    // the passed-in catalog should contain any changes to the glyph
    // (character/color) info for the defaults,
    // as well as any additional entries.

    var defaults = {
        // defaults are taken from the original 'cave' tileset
        floor: {
            character: '.',
            foreground: '#777',
            background: '#000',
            isWalkable: true,
            isBreakable: false,
            passesLight: true
        },

        wall: {
            character: '#',
            foreground: '#976',
            background: '#643',
            isWalkable: false,
            isBreakable: true,
            passesLight: false
        },

        blocked: {
            character: '▓',
            foreground: '#222',
            background: '#333',
            isWalkable: false,
            isBreakable: false,
            passesLight: false
        },

        stairsUp: {
            character: '<',
            foreground: '#ca6',
            isWalkable: true,
            isBreakable: false,
            passesLight: true
        },

        stairsDown: {
            character: '>',
            foreground: '#ca6',
            isWalkable: true,
            isBreakable: false,
            passesLight: true
        },

        corridor: {
            character: '.',
            foreground: '#777',
            isWalkable: true,
            isBreakable: false,
            passesLight: true
        },

        closedDoor: {
            character: '+',
            foreground: '#941',
            isWalkable: false,
            isBreakable: false,
            passesLight: false
        },

        openDoor: {
            character: '/',
            foreground: '#941',
            isWalkable: true,
            isBreakable: false,
            passesLight: true
        },

        secretDoor: {
            character: '#',
            foreground: '#976',
            background: '#643',
            isWalkable: false,
            isBreakable: true,
            passesLight: false
        },

        water: {
            character: '≈',
            foreground: '#08c',
            isWalkable: false,
            isBreakable: false,
            passesLight: true
        }
    };

    // apply the defaults into the catalog where needed
    catalog = applyDefaults(catalog, defaults);

    // now, for each template in the catalog, apply the defaults
    var templates = Object.keys(catalog);
    var len = templates.length;
    var key;
    for (var i = 0; i < len; i++) {
        key = templates[i];
        catalog[key] = applyDefaults(catalog[key], defaults[key]);
        this[key] = new Game.Tile(catalog[key]);
    }

};


Game.Tilesets = {};

// this one is constructed manually because it's so different to
// the regular "area" tilesets
Game.Tilesets.worldMap = {

    POLAR_ICECAP: new Game.Tile({
        name: '',
        character: '~',
        foreground: '#EEFFFF',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    GLACIER: new Game.Tile({
        name: '',
        character: 'ʌ',
        foreground: '#87CEFA',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    DEEP_WATER: new Game.Tile({
        name: '',
        character: '≈',
        foreground: '#0000CD',
        background: '#000',
        isWalkable: false,
        isBreakable: false,
        passesLight: true
    }),
    SHALLOW_WATER: new Game.Tile({
        name: '',
        character: '≈',
        foreground: '#4169E1',
        background: '#000',
        isWalkable: false,
        isBreakable: false,
        passesLight: true
    }),
    SNOWCAP: new Game.Tile({
        name: '',
        character: '^',
        foreground: '#FFFFFF',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    ALPINE: new Game.Tile({
        name: '',
        character: 'ʌ',
        foreground: '#809080',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    BADLANDS: new Game.Tile({
        name: '',
        character: 'Ѧ',
        foreground: '#EF7347',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    CRAG: new Game.Tile({
        name: '',
        character: 'Ѧ',
        foreground: '#595959',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    COLD_BEACH: new Game.Tile({
        name: '',
        character: '~',
        foreground: '#B0C4DE',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    BEACH: new Game.Tile({
        name: '',
        character: '~',
        foreground: '#DEB887',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    MARSHLAND: new Game.Tile({
        name: '',
        character: '↡',
        foreground: '#008080',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    SWAMP: new Game.Tile({
        name: '',
        character: '⇣',
        foreground: '#556B2F',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    TUNDRA: new Game.Tile({
        name: '',
        character: '"',
        foreground: '#5F9EA0',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    COLD_BARRENS: new Game.Tile({
        name: '',
        character: '-',
        foreground: '#778899',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    TAIGA: new Game.Tile({
        name: '',
        character: '♠',
        foreground: '#123823',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    COLD_SCRUB: new Game.Tile({
        name: '',
        character: '*',
        foreground: '#556B2F',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    COLD_DESERT: new Game.Tile({
        name: '',
        character: ',',
        foreground: '#778899',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    RAINFOREST: new Game.Tile({
        name: '',
        character: '↟',
        foreground: '#006400',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    DECIDUOUS: new Game.Tile({
        name: '',
        character: '♧',
        foreground: '#228B22',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    SHRUBLAND: new Game.Tile({
        name: '',
        character: '♧',
        foreground: '#6B8E23',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    GRASSLAND: new Game.Tile({
        name: '',
        character: '"',
        foreground: '#9ACD32',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    DUSTBOWL: new Game.Tile({
        name: '',
        character: '.',
        foreground: '#BDB76B',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    SCRUB: new Game.Tile({
        name: '',
        character: '*',
        foreground: '#CD853F',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    DESERT: new Game.Tile({
        name: '',
        character: ',',
        foreground: '#FEF87A',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    JUNGLE: new Game.Tile({
        name: '',
        character: '✾',
        foreground: '#006400',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),
    SAVANNA: new Game.Tile({
        name: '',
        character: '⇡',
        foreground: '#B8960B',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    }),


    TOWN: new Game.Tile({
        name: '',
        character: '+',
        foreground: '#FF0000',
        background: '#000',
        isWalkable: true,
        isBreakable: false,
        passesLight: true
    })
};

/*
    biome / "natural" area tilesets
    (note that these use the same constructor, and so are still
     defined in terms of the "dungeon" tilesets)
 */

Game.Tilesets.forest = new Game.Tileset({

    floor: {
        character: '.',
        foreground: '#B8960B',
        background: '#123823'
    },

    wall: {
        character: '♧',
        foreground: '#228B22',
        background: '#B8960B'
    },

    blocked: {
        character: '✾',
        foreground: '#123823',
        background: '#230'
    },

    stairsUp: {
        character: '<',
        foreground: '#B8960B',
        background: '#123823'
    },

    stairsDown: {
        character: '>',
        foreground: '#B8960B',
        background: '#123823'
    },

    corridor: {
        character: '.',
        foreground: '#B8960B',
        background: '#123823'
    },

    closedDoor: {
        character: '+',
        foreground: '#CD853F',
        background: '#123823'
    },

    openDoor: {
        character: '/',
        foreground: '#CD853F',
        background: '#123823'
    },

    secretDoor: {
        character: '♧',
        foreground: '#228B22',
        background: '#87CEFA'
    },

    water: {
        character: '≈',
        foreground: '#4169E1',
        background: '#123823'
    }
}
);


/*
    "dungeon" tilesets
 */

// no parameters passed, since the constructor defaults are
// the original 'cave' tile definitions
Game.Tilesets.cave = new Game.Tileset({});

Game.Tilesets.tower = new Game.Tileset({

    floor: {
        character: '.',
        foreground: '#755',
        background: '#000'
    },

    wall: {
        character: '#',
        foreground: '#533',
        background: '#644'
    },

    blocked: {
        character: '▓',
        foreground: '#000',
        background: '#222'
    },

    stairsUp: {
        character: '<',
        foreground: '#866'
    },

    stairsDown: {
        character: '>',
        foreground: '#866'
    },

    corridor: {
        character: '.',
        foreground: '#755'
    },

    closedDoor: {
        character: '+',
        foreground: '#577'
    },

    openDoor: {
        character: '/',
        foreground: '#577'
    },

    secretDoor: {
        character: '#',
        foreground: '#533',
        background: '#644'
    },

    water: {
        character: '≈',
        foreground: '#800'
    }
});

Game.Tilesets.iceCave = new Game.Tileset({

    floor: {
        character: '.',
        foreground: '#BCE',
        background: '#549'
    },

    wall: {
        character: '#',
        foreground: '#BCE',
        background: '#87CEFA'
    },

    blocked: {
        character: '▓',
        foreground: '#549',
        background: '#033'
    },

    stairsUp: {
        character: '<',
        foreground: '#BCE',
        background: '#549'
    },

    stairsDown: {
        character: '>',
        foreground: '#BCE',
        background: '#549'
    },

    corridor: {
        character: '.',
        foreground: '#BCE',
        background: '#549'
    },

    closedDoor: {
        character: '+',
        foreground: '#789'
    },

    openDoor: {
        character: '/',
        foreground: '#789'
    },

    secretDoor: {
        character: '#',
        foreground: '#BCE',
        background: '#87CEFA'
    },

    water: {
        character: '-',
        foreground: '#87CEFA',
        background: '#549'
    }
});
