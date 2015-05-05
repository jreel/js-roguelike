/**
 * Created by jreel on 4/27/2015.
 */

Game.BiomeTypes = {

    NOT_SET:        0,

    // elevation (altitude)
    elevation: {
        // below waterline:
        DEEP_WATER: 1 << 0,             // 1
        SHALLOW_WATER: 1 << 1,             // 2

        // above waterline:
        COASTAL: 1 << 2,             // 4
        PLAINS: 1 << 3,             // 8
        HILLS: 1 << 4,             // 16

        // lower mountains
        MONTANE: 1 << 5,             // 32

        // above treeline:
        ALPINE: 1 << 6,             // 64

        // above snowline:
        SNOWCAP: 1 << 7             // 128
    },
        // reserved:                1 << 8


    // temperature (roughly equates with latitude)
    temperature: {
        ARCTIC: 1 << 9,             // 512
        SUBARCTIC: 1 << 10,            // 1024
        BOREAL: 1 << 11,            // 2048
        TEMPERATE: 1 << 12,            // 4096
        SUBTROPICAL: 1 << 13,            // 8192
        TROPICAL: 1 << 14            // 16384
    },
    // reserved:                1 << 15,
    // reserved:                1 << 16,

    // precipitation / vegetation
    precipitation: {
        ARID: 1 << 17,            // 131072
        SEMIARID: 1 << 18,            // 262144
        MODERATE: 1 << 19,            // 524288
        HUMID: 1 << 20,            // 1048576
        RAINY: 1 << 21            // 2097152
    },
    init: function(){

        this.ANY_WATER =    this.elevation.DEEP_WATER | this.elevation.SHALLOW_WATER;
        this.LOW_LAND =     this.elevation.COASTAL | this.elevation.PLAINS;
        this.MOUNTAINS =    this.elevation.MONTANE | this.elevation.ALPINE | this.elevation.SNOWCAP;
        this.HIGH_LAND =    this.elevation.HILLS | this.MOUNTAINS;
        this.GROWTH_AREA =  this.elevation.PLAINS | this.elevation.HILLS | this.elevation.MONTANE;
        this.ANY_ELEVATION = this.ANY_WATER | this.LOW_LAND | this.HIGH_LAND;

        this.ANY_TEMPERATURE = this.temperature.ARCTIC | this.temperature.SUBARCTIC | this.temperature.BOREAL |
                            this.temperature.TEMPERATE | this.temperature.SUBTROPICAL | this.temperature.TROPICAL;

        this.ANY_NONPOLAR = this.ANY_TEMPERATURE ^ this.temperature.ARCTIC;
        this.ANY_HOT = this.temperature.TROPICAL | this.temperature.SUBTROPICAL;
        this.ANY_COLD = this.temperature.SUBARCTIC | this.temperature.BOREAL | this.temperature.TEMPERATE;

        this.ANY_PRECIPITATION =    this.precipitation.ARID | this.precipitation.SEMIARID | this.precipitation.MODERATE |
                                    this.precipitation.HUMID | this.precipitation.RAINY;

        this.ANY_WET =      this.precipitation.HUMID | this.precipitation.RAINY;
        this.ANY_DRY =      this.precipitation.ARID | this.precipitation.SEMIARID;
        this.ANY_NONDRY =   this.ANY_PRECIPITATION ^ this.ANY_DRY;
        this.ANY_NONWET =   this.ANY_PRECIPITATION ^ this.ANY_WET;

        this.ANY_ALL = this.ANY_ELEVATION | this.ANY_PRECIPITATION | this.ANY_TEMPERATURE;

        // now the biome definitions
        this.biomes = {};
        // special definition for a "WORLD" biome that is separate from the rest
        // this shouldn't screw up any of the normal biome definitions
        this.biomes.WORLD = ~this.ANY_ALL;

        // now the actual biomes
        this.biomes.POLAR_ICECAP = this.ANY_WATER | this.LOW_LAND | this.temperature.ARCTIC | this.ANY_PRECIPITATION;
        this.biomes.GLACIER = this.HIGH_LAND | this.temperature.ARCTIC | this.ANY_PRECIPITATION;
        this.biomes.DEEP_WATER = this.elevation.DEEP_WATER | this.ANY_NONPOLAR | this.ANY_PRECIPITATION;
        this.biomes.SHALLOW_WATER = this.elevation.SHALLOW_WATER | this.ANY_NONPOLAR | this.ANY_PRECIPITATION;

        // un-forested mountain areas
        this.biomes.SNOWCAP = this.elevation.SNOWCAP | this.ANY_COLD | this.ANY_PRECIPITATION;
        // alpine = above the treeline, but ground vegetation still possible
        this.biomes.ALPINE = this.elevation.ALPINE | this.elevation.SNOWCAP | this.ANY_NONPOLAR | this.ANY_NONDRY;
        // mesas, plateaus, etc
        this.biomes.BADLANDS = this.elevation.ALPINE | this.elevation.SNOWCAP | this.ANY_HOT | this.ANY_DRY;
        // cold version of the above
        this.biomes.CRAG = this.elevation.ALPINE | this.ANY_COLD | this.ANY_DRY;

        // coastal or very low-elevation areas
        this.biomes.COLD_BEACH = this.elevation.COASTAL | this.ANY_COLD | this.ANY_NONWET;
        this.biomes.BEACH = this.elevation.COASTAL | this.ANY_HOT | this.ANY_NONWET;
        this.biomes.MARSHLAND = this.elevation.COASTAL | this.ANY_COLD | this.ANY_WET;
        this.biomes.SWAMP = this.elevation.COASTAL | this.ANY_HOT | this.ANY_WET;

        // GROWTH_AREA = plains, hills, base of mountains
        // high latitude, low temperature
        this.biomes.TUNDRA = this.GROWTH_AREA | this.temperature.SUBARCTIC | this.ANY_NONDRY;
        this.biomes.COLD_BARRENS = this.GROWTH_AREA | this.temperature.SUBARCTIC | this.ANY_DRY;

        // taiga = boreal forest (coniferous)
        this.biomes.TAIGA = this.GROWTH_AREA | this.temperature.BOREAL | this.ANY_NONDRY;
        this.biomes.COLD_SCRUB = this.GROWTH_AREA | this.temperature.BOREAL | this.precipitation.SEMIARID;
        this.biomes.COLD_DESERT = this.GROWTH_AREA | this.temperature.BOREAL | this.precipitation.ARID;

        // temperate types
        this.biomes.RAINFOREST =
            this.GROWTH_AREA | this.temperature.TEMPERATE | this.temperature.SUBTROPICAL | this.precipitation.RAINY;
        this.biomes.DECIDUOUS =
            this.GROWTH_AREA | this.temperature.TEMPERATE | this.temperature.SUBTROPICAL | this.precipitation.HUMID;
        this.biomes.SHRUBLAND =
            this.GROWTH_AREA | this.temperature.TEMPERATE | this.temperature.SUBTROPICAL | this.precipitation.MODERATE;
        this.biomes.GRASSLAND = this.GROWTH_AREA | this.temperature.TEMPERATE | this.precipitation.SEMIARID;
        this.biomes.DUSTBOWL = this.GROWTH_AREA | this.temperature.TEMPERATE | this.precipitation.ARID;

        // subtropical types
        this.biomes.SCRUB = this.GROWTH_AREA | this.temperature.SUBTROPICAL | this.precipitation.SEMIARID;
        this.biomes.DESERT = this.GROWTH_AREA | this.ANY_HOT | this.precipitation.ARID;

        // tropical types
        this.biomes.JUNGLE = this.GROWTH_AREA | this.temperature.TROPICAL | this.ANY_WET;
        this.biomes.SAVANNA = this.GROWTH_AREA | this.temperature.TROPICAL | this.precipitation.MODERATE | this.precipitation.SEMIARID;

        return this;
    }
}.init();


// hashtable for area construction within a given biome
// relates each world biome type to a tileset and a map generator function
// these could also include encounter or item tables

// TODO: make correct tilesets and generators for each of these
Game.BiomeArea = {

    POLAR_ICECAP: {
        tileset: Game.Tilesets.iceCave,
        builder: Game.Generators.generateCave
    },

    GLACIER: {
        tileset: Game.Tilesets.iceCave,
        builder: Game.Generators.generateCave
    },

    DEEP_WATER: {
        tileset: Game.Tilesets.iceCave,
        builder: Game.Generators.generateCave
    },

    SHALLOW_WATER: {
        tileset: Game.Tilesets.iceCave,
        builder: Game.Generators.generateCave
    },

    SNOWCAP: {
        tileset: Game.Tilesets.iceCave,
        builder: Game.Generators.generateCave
    },

    ALPINE: {
        tileset: Game.Tilesets.cave,
        builder: Game.Generators.generateCave
    },

    BADLANDS: {
        tileset: Game.Tilesets.cave,
        builder: Game.Generators.generateCave
    },

    CRAG: {
        tileset: Game.Tilesets.cave,
        builder: Game.Generators.generateCave
    },

    COLD_BEACH: {
        tileset: Game.Tilesets.cave,
        builder: Game.Generators.generateCave
    },

    BEACH: {
        tileset: Game.Tilesets.cave,
        builder: Game.Generators.generateCave
    },

    MARSHLAND: {
        tileset: Game.Tilesets.forest,
        builder: Game.Generators.generateCave
    },

    SWAMP: {
        tileset: Game.Tilesets.forest,
        builder: Game.Generators.generateCave
    },

    TUNDRA: {
        tileset: Game.Tilesets.iceCave,
        builder: Game.Generators.generateCave
    },

    COLD_BARRENS: {
        tileset: Game.Tilesets.iceCave,
        builder: Game.Generators.generateCave
    },

    TAIGA: {
        tileset: Game.Tilesets.forest,
        builder: Game.Generators.generateCave
    },

    COLD_SCRUB: {
        tileset: Game.Tilesets.iceCave,
        builder: Game.Generators.generateCave
    },

    COLD_DESERT: {
        tileset: Game.Tilesets.iceCave,
        builder: Game.Generators.generateCave
    },

    RAINFOREST: {
        tileset: Game.Tilesets.forest,
        builder: Game.Generators.generateCave
    },

    DECIDUOUS: {
        tileset: Game.Tilesets.forest,
        builder: Game.Generators.generateCave
    },

    SHRUBLAND: {
        tileset: Game.Tilesets.forest,
        builder: Game.Generators.generateCave
    },

    GRASSLAND: {
        tileset: Game.Tilesets.cave,
        builder: Game.Generators.generateCave
    },

    DUSTBOWL: {
        tileset: Game.Tilesets.cave,
        builder: Game.Generators.generateCave
    },

    SCRUB: {
        tileset: Game.Tilesets.cave,
        builder: Game.Generators.generateCave
    },

    DESERT: {
        tileset: Game.Tilesets.cave,
        builder: Game.Generators.generateCave
    },

    JUNGLE: {
        tileset: Game.Tilesets.forest,
        builder: Game.Generators.generateCave
    },

    SAVANNA: {
        tileset: Game.Tilesets.forest,
        builder: Game.Generators.generateCave
    },

    TOWN: {
        tileset: Game.Tilesets.tower,
        builder: Game.Generators.generateCave
    }



};