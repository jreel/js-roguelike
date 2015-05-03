/**
 * Created by jreel on 4/30/2015.
 */

Game.Tilesets = {};

Game.Tilesets.WorldMapTiles = {

    POLAR_ICECAP: {
        name: '',
        character: '~',
        foreground: '#EEFFFF',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    GLACIER: {
        name: '',
        character: 'ʌ',
        foreground: '#87CEFA',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    DEEP_WATER: {
        name: '',
        character: '≈',
        foreground: '#0000CD',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    SHALLOW_WATER: {
        name: '',
        character: '≈',
        foreground: '#4169E1',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // un-forested mountain areas
    SNOWCAP: {
        name: '',
        character: '^',
        foreground: '#FFFFFF',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    // alpine: above the treeline, but ground vegetation still possible
    ALPINE: {
        name: '',
        character: 'ʌ',
        foreground: '#809080',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    // mesas, plateaus, etc
    BADLANDS: {
        name: '',
        character: 'Ѧ',
        foreground: '#EF7347',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    // cold version of the above
    CRAG: {
        name: '',
        character: 'Ѧ',
        foreground: '#595959',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // coastal or very low-elevation areas
    COLD_BEACH: {
        name: '',
        character: '~',
        foreground: '#B0C4DE',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    BEACH: {
        name: '',
        character: '~',
        foreground: '#DEB887',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    MARSHLAND: {
        name: '',
        character: '↡',
        foreground: '#008080',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    SWAMP: {
        name: '',
        character: '⇣',
        foreground: '#556B2F',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // GROWTH_AREA: plains, hills, base of mountains
    // high latitude, low temperature
    TUNDRA: {
        name: '',
        character: '"',
        foreground: '#5F9EA0',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    COLD_BARRENS: {
        name: '',
        character: '-',
        foreground: '#778899',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // taiga: boreal forest (coniferous)
    TAIGA: {
        name: '',
        character: '♠',
        foreground: '#123823',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    COLD_SCRUB: {
        name: '',
        character: '*',
        foreground: '#556B2F',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    COLD_DESERT: {
        name: '',
        character: ',',
        foreground: '#778899',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // temperate types
    RAINFOREST: {
        name: '',
        character: '↟',
        foreground: '#006400',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    DECIDUOUS: {
        name: '',
        character: '♧',
        foreground: '#228B22',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    SHRUBLAND: {
        name: '',
        character: '♧',
        foreground: '#6B8E23',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    GRASSLAND: {
        name: '',
        character: '"',
        foreground: '#9ACD32',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    DUSTBOWL: {
        name: '',
        character: '.',
        foreground: '#BDB76B',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // subtropical types
    SCRUB: {
        name: '',
        character: '*',
        foreground: '#CD853F',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    DESERT: {
        name: '',
        character: ',',
        foreground: '#FEF87A',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // tropical types
    JUNGLE: {
        name: '',
        character: '✾',
        foreground: '#006400',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    SAVANNA: {
        name: '',
        character: '⇡',
        foreground: '#B8960B',
        background: '#000',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    }
};
Game.WorldTilesRepo = new Game.Repository('worldMapTiles', Game.Tile, Game.Tilesets.WorldMapTiles);