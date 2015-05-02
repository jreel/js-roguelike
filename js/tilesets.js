/**
 * Created by jreel on 4/30/2015.
 */

Game.Tilesets = {};

Game.Tilesets.WorldMapTiles = {

    POLAR_ICECAP: {
        name: '',
        character: '.',
        foreground: '#639BFF',
        background: '#CBDBFC',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    GLACIER: {
        name: '',
        character: '〽',
        foreground: '#639BFF',
        background: '#CBDBFC',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    DEEP_WATER: {
        name: '',
        character: '≈',
        foreground: '#306082',
        background: '#639BFF',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    SHALLOW_WATER: {
        name: '',
        character: '≈',
        foreground: '#5FCDE4',
        background: '#639BFF',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // un-forested mountain areas
    SNOWCAP:  {
        name: '',
        character: '〽',
        foreground: '#FFFFFF',
        background: '#9BADB7',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    // alpine: above the treeline, but ground vegetation still possible
    ALPINE:  {
        name: '',
        character: '〽',
        foreground: '#9BADB7',
        background: '#847E87',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    // mesas, plateaus, etc
    BADLANDS:  {
        name: '',
        character: '〽',
        foreground: '#DF7126',
        background: '#D9A066',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    // cold version of the above
    CRAG:  {
        name: '',
        character: '〽',
        foreground: '#696A6A',
        background: '#847E87',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // coastal or very low-elevation areas
    COLD_BEACH:  {
        name: '',
        character: '~',
        foreground: '#EEC39A',
        background: '#9BADB7',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    BEACH:  {
        name: '',
        character: '~',
        foreground: '#9BADB7',
        background: '#EEC39A',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    MARSHLAND:  {
        name: '',
        character: '⇣',
        foreground: '#6ABE30',
        background: '#37946E',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    SWAMP:  {
        name: '',
        character: '↡',
        foreground: '#8A6F30',
        background: '#4B692F',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // GROWTH_AREA: plains, hills, base of mountains
    // high latitude, low temperature
    TUNDRA:  {
        name: '',
        character: '⺍',
        foreground: '#4B692F',
        background: '#9BADB7',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    COLD_BARRENS:  {
        name: '',
        character: '-',
        foreground: '#847E87',
        background: '#9BADB7',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // taiga: boreal forest (coniferous)
    TAIGA:  {
        name: '',
        character: '♠',
        foreground: '#4B692F',
        background: '#8F974A',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    COLD_SCRUB:  {
        name: '',
        character: '*',
        foreground: '#524B24',
        background: '#8F974A',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    COLD_DESERT:  {
        name: '',
        character: '჻',
        foreground: '#847E87',
        background: '#9BADB7',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // temperate types
    RAINFOREST: {
        name: '',
        character: '↟',
        foreground: '#323C39',
        background: '#4B692F',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    DECIDUOUS:  {
        name: '',
        character: '♧',
        foreground: '#6ABE30',
        background: '#4B692F',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    SHRUBLAND:  {
        name: '',
        character: '♣',
        foreground: '#4B692F',
        background: '#8F974A',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    GRASSLAND:  {
        name: '',
        character: '٧',
        foreground: '#99E550',
        background: '#8F974A',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    DUSTBOWL:  {
        name: '',
        character: '჻',
        foreground: '#8F974A',
        background: '#EEC39A',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // subtropical types
    SCRUB:  {
        name: '',
        character: '*',
        foreground: '#8A6F30',
        background: '#D9A066',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    DESERT:  {
        name: '',
        character: '`',
        foreground: '#FBF236',
        background: '#EEC39A',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },

    // tropical types
    JUNGLE:  {
        name: '',
        character: '✾',
        foreground: '#6ABE30',
        background: '#37946E',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    },
    SAVANNA: {
        name: '',
        character: '⇡',
        foreground: '#4B692F',
        background: '#D9A066',
        isWalkable: true,
        isDiggable: false,
        canSpawnHere: false,
        isTransparent: true
    }
};

Game.WorldTilesRepo = new Game.Repository('worldMapTiles', Game.Tile, Game.Tilesets.WorldMapTiles);