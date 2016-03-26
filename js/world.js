/**
 * Created by jreel on 4/4/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

/*
    WORLD:  a collection of AREAs, with one area as a "zoomed out" / "overworld" map.
*/
// In the constructor function, we should pre-generate the "overworld"
// and the starting Area (including starting Dungeon).
// Other Areas will be generated only when they are first visited.
Game.World = function(options) {
    options = options || {};

    // generate world data and overworld area
    var mapSize = options.mapSize || 256;
    mapSize = nearestPowerOf2(mapSize);
    this.mapSize = mapSize;

    this.worldName = "";            // Markov generated?
    this.worldId = 0;               // set to index of Game.worlds[]

    this.dataMap = this.generateDataMap(mapSize);      // 2D data store
    var worldMap = this.generateWorldMap(mapSize);     // returns a Game.Map object

    var self = this;
    this.overworld = new Game.OverworldArea({   width: mapSize,
                                                height: mapSize,
                                                map: worldMap,
                                                world: self     });

    //var numTowns = randomNormalInt(mapSize / 10, mapSize / 50);
    //this.placeTowns(numTowns);

    this.currentArea = this.overworld;

    this.worldAreas = {};           // key [x,y]: WorldArea,
                                // populated from generateWorldArea() method

};
Game.OverworldArea = function(options) {
    options = options || {};
    var defaults = {
        width: 256,
        height: 256,
        biome: "WORLD",
        sightRadiusMultiplier: 20,
        parentLevel: null,
        subLevel: null
    };

    // options should pass in a world map
    // generate a new one if not
    if (!options.map) {
        var mapSize = Math.max(options.width, options.height);
        if (!world.dataMap) {
            world.dataMap = world.generateDataMap(mapSize)
        }
        options.map = world.generateWorldMap(mapSize);
    }


    options = applyDefaults(options, defaults);
    Game.Area.call(this, options);

    this.map.area = this;
    this.map.wrap = true;
    this.setupFov();
    return this;
};
Game.OverworldArea.extend(Game.Area);

Game.WorldArea = function(options) {
    options = options || {};
    options.width = options['width'] || 32;
    options.height = options['height'] || 32;

    // options should pass in a biome type
    // use this to get a generator and a tileset for the area
    // (if needed)
    if (!options.map) {
        var biome = options['biome'];
        var biomeArea = Game.BiomeArea[biome];
        var tileset = options['tileset'] || biomeArea.tileset;
        var builder = options['builder'] || biomeArea.builder;

        var tiles = builder(options.width, options.height, tileset);
        options.map = new Game.Map(tiles, tileset);
    }
    options.sightRadiusMultiplier = options['sightRadiusMultiplier'] || biomeArea.sightRadiusMultiplier;

    Game.Area.call(this, options);

    // since this is a WorldArea, set the parentLevel to the overworld
    this.parentLevel.area = options.world.overworld;
    this.parentLevel.x = options['parentX'];
    this.parentLevel.y = options['parentY'];

    this.map.area = this;
    this.map.wrap = false;
    this.setupFov();

    // chance to add Dungeon
    var chance = options['dungeonChance'] || 100;
    var roll = randomPercent();
    if (roll <= chance) {
        this.addDungeon(options);
    }
};
Game.WorldArea.extend(Game.Area);


// this is for adding WorldAreas to the game world.
// for adding DungeonAreas to WorldAreas, use the
// method of the Area prototype
Game.World.prototype.generateWorldArea = function(x, y, options) {
    options = options || {};
    options.width = options['width'] || 32;
    options.height = options['height'] || 32;

    // set some additional options based on the passed x, y
    options.parentX = x;
    options.parentY = y;
    options.id = x + ',' + y;
    if (!options.biome) {
        options.biome = this.getBiomeName(x, y);
    }
    options.world = this;

    // make the new WorldArea
    var newArea = new Game.WorldArea(options);

    // add to the areas table
    if (options.id) {
        this.worldAreas[options.id] = newArea;
    }

    return newArea;
};


Game.World.prototype.getRandomLandLocation = function() {
    var exceptedBiomes = ["DEEP_WATER", "SHALLOW_WATER", "POLAR_ICECAP", "GLACIER",
                            "DESERT", "COLD_DESERT"];


    var x, y, biome, keepLooking, sanityCounter = 10000;
    do {
        x = randomInt(0, this.mapSize - 1);
        y = randomInt(0, this.mapSize - 1);

        biome = this.getBiomeName(x, y);
        if (exceptedBiomes.indexOf(biome) > -1) {
            keepLooking = true;
        } else {
            return {x: x, y: y, biome: biome};
        }
        sanityCounter--;

    } while (keepLooking && sanityCounter > 0);

    // if we still haven't found a good spot at this point,
    // return false... we can handle that in the calling routine
    return false;
};

Game.World.prototype.findGoodTownLocations = function(amount) {

    var favoredBiomes = ["COLD_BEACH", "BEACH", "TAIGA", "CONIFEROUS_FOREST",
                         "BROADLEAF_FOREST", "SHRUBLAND", "GRASSLAND", "SAVANNA"];

    var okBiomes = ["COLD_SCRUBLAND", "SCRUBLAND", "JUNGLE", "MOUNTAIN"];

    var harshBiomes = ["COLD_DESERT", "DUSTBOWL", "DESERT", "BARRENS", "CRAG",
                       "BADLANDS", "MARSHLAND", "SWAMP", "TUNDRA", "SNOWCAP"];

    var cellBiome;

    // iterate over the map, store x,y in each biome set

    var goodLocs = [];
    var okLocs = [];
    var harshLocs = [];

    for (var x = 0; x < this.mapSize; x++) {
        for (var y = 0; y < this.mapSize; y++) {
            cellBiome = this.getBiomeName(x, y);
            if (favoredBiomes.indexOf(cellBiome) !== -1) {
                goodLocs.push({x: x, y: y});
            } else if (okBiomes.indexOf(cellBiome) !== -1) {
                okLocs.push({ x: x, y: y });
            } else if (harshBiomes.indexOf(cellBiome) !== -1) {
                harshLocs.push({ x: x, y: y });
            }
        }
    }

    // if we haven't found the requested number of locations,
    // add in the less-desirable ones
    if (goodLocs.length < amount) {
        goodLocs = goodLocs.concat(okLocs);
    }
    if (goodLocs.length < amount) {
        goodLocs = goodLocs.concat(harshLocs);
    }

    return goodLocs;

};

Game.World.prototype.placeTowns = function(amount) {
    var goodLocs = this.findGoodTownLocations(amount);
    var map = this.overworld.map.grid;
    var townLoc;
    for (var i = 0; i < amount; i++) {
        townLoc = randomSplice(goodLocs);
        map[townLoc.x][townLoc.y] = Game.Tilesets.worldMap.TOWN;
    }
};

Game.World.prototype.generateWorldMap = function(mapSize) {
    // read through each x,y value in this.dataMap,
    // and based on the biome, assign a Tile to x,y
    // in this.worldMap.
    // Initialize the worldMap as a 2D array (mapSize * mapSize).
    var tiles = new Array(mapSize);
    for (var i = 0; i < mapSize; i++) {
        tiles[i] = new Array(mapSize);
    }

    var biomeKeys = getKeysSortedByValue(Game.BiomeTypes.biomes);
    var biomeValues = getSortedValues(Game.BiomeTypes.biomes, sortNumber);

    var data, biome, tile, len = biomeValues.length;
    for (var x = 0; x < mapSize; x++) {
        for (var y = 0; y < mapSize; y++) {
            data = this.dataMap[x][y];
            for (var k = 0; k < len; k++) {
                if ((data & biomeValues[k]) === data) {
                    // get the corresponding key from biomeKeys[k]
                    biome = biomeKeys[k];
                    // get the appropriate tile from tileset
                    tile = Game.Tilesets.worldMap[biome];
                    // set worldMap[x][y] = tile
                    tiles[x][y] = tile;
                }
            }
        }
    }

    var worldMap = new Game.Map(tiles, Game.Tilesets.worldMap);
    return worldMap;

};


Game.World.prototype.getBiomeName = function(x, y) {
    var biomeKeys = getKeysSortedByValue(Game.BiomeTypes.biomes);
    var tileType = this.dataMap[x][y];
    var biomeType, key, len = biomeKeys.length;
    for (var k = 0; k < len; k++) {
        key = biomeKeys[k];
        biomeType = Game.BiomeTypes.biomes[key];
        if ((tileType & biomeType) === tileType) {
            return key;
        }
    }
    return false;
};
Game.World.prototype.getBiomeValue = function(x, y) {
    var biomeValues = getSortedValues(Game.BiomeTypes.biomes, sortNumber);
    var tileType = this.dataMap[x][y];
    var biomeVal, len = biomeValues.length;
    for (var k = 0; k < len; k++) {
        biomeVal = biomeValues[k];
        if ((tileType & biomeVal) === tileType) {
            return biomeVal;
        }
    }
    return false;
};
Game.World.prototype.getBiomeNameFormatted = function(x, y) {
    var biomeName = this.getBiomeName(x, y);
    if (biomeName) {
        biomeName = biomeName.toLowerCase();
        biomeName = biomeName.replace("_", " ");
    }
    return biomeName;
};



Game.World.prototype.generateDataMap = function(mapSize) {
    // this should create a dataMap in the format: data[x][y] = value,
    // where value is a set of bit-flags corresponding to elevation,
    // precipitation, and temperature.

    // Initialize the dataMap as a 2D array (mapSize * mapSize).
    // this will be passed to each of the child functions for updating
    var dataMap = new Array(mapSize);
    for (var i = 0; i < mapSize; i++) {
        dataMap[i] = new Array(mapSize);
    }
    // Step 1: generate Height Map -> elevation for each x,y
    // this will update the dataMap bits, and also return the original heightmap
    var elevationMap = this.generateElevationMap(dataMap);

    // Step 2: generate Precipitation map = heightMap mask -> "moisture" for each x,y
    var precipitationMap = this.generatePrecipitationMap(dataMap);

    // Step 3: generate Temperature gradient
    var temperatureMap = this.generateTemperatureMap(dataMap);

    // Step 4: each x,y for the map should have had bits set in Steps 1-3.
    // We can use methods to pull those out as needed!

    return dataMap;
};

Game.World.prototype.generateElevationMap = function(mapToUpdate) {
    // cache the mapSize
    var mapSize = mapToUpdate.length;

    // waterline: used to set the % of elevation below which will be water.
    // The below %'s are not exact since the final randomly-generated cutoffs
    // are normalized before being applied. Thus, you should set the ranges here
    // slightly higher than the ranges you actually want.
    var waterline = randomFloat(0.5, 0.75);

    // generate Height Map -> elevation for each tile
    // call Game.Geometry.heightMap(mapSize, roughness, seed)
    // mapSize = as explained above. The size of the map will be (mapSize * mapSize),
    // and the heightMap routine will return a 2D array of these dimensions.
    // roughness = value between (0, 1); values around 0.6 tend to be most "earth-like"
    var roughness = randomFloat(0.5, 0.75);
    // seed = value between (0, 1); initial value of the 4 corners.
    // I'm using randomNormal with a 5% std to set this to something "around" the waterline.
    var seed = randomNormal(waterline, 0.05);
    var eMap = Game.Geometry.heightMap(mapSize, roughness, seed);

    // randomly set percentages for each elevation division:
    // DEEP_WATER, SHALLOW_WATER, COASTAL, PLAINS, HILLS, MONTANE, ALPINE, SNOWCAP
    // these are defined in Game.BiomeTypes.elevations

    // Strategy: for each category, pick a cutoff% that "around" what we'd expect
    // from an equal division. We'll use the "fair" percent as the mean, and a
    // random std each time, and pick a random value for the actual category %.
    var numCats = Object.keys(Game.BiomeTypes.elevation).length;
    var fairPct = 1.00 / numCats;
    var cutoffPercents = new Array(numCats);

    var cutoff, marker = 0;
    for (var j = 0; j < numCats; j++) {
        // set the waterline to what we've defined
        if (j === 0) {
            cutoffPercents[j] = waterline / randomFloat(1.1, 2);
        } else if (j === 1) {
            cutoffPercents[j] = waterline;
            marker = waterline;
        } else {
            // this is the strategy defined above.
            // don't forget to move the "marker" each time, so that we can easily
            // add the new category % to the previous %ages.
            // (i.e., we are generating a list of cutoff points, not category %ages.)
            do {
                cutoff = randomNormal(fairPct, randomFloat(0.005, 0.025));
            } while (cutoff <= 0);
            // the do-while is to ensure positive values, since the Normal distribution will
            // sometimes (rarely) extend into negative values.

            cutoffPercents[j] = cutoff + marker;
            marker += cutoff;
        }
    }
    // the above strategy will likely result in the highest cutoff% being > 1,
    // so we normalize it so that the highest cutoff% = 1.
    // Although, I suppose we could ignore this step if we wanted to possibly
    // exclude the higher elevations from appearing in our map...
    cutoffPercents = normalizeArray(cutoffPercents);

    var elevKeys = getKeysSortedByValue(Game.BiomeTypes.elevation);
    // now that we have our cutoff ranges defined and normalized,
    // we can loop through our data array applying our
    // appropriate zone to the map we want, based on the value.
    for (var x = 0; x < mapSize; x++) {
        for (var y = 0; y < mapSize; y++) {
            var elev = eMap[x][y];
            for (var key, k = 0; k < numCats; k++) {
                if (elev <= cutoffPercents[k]) {
                    // set the appropriate bit in the mapToUpdate
                    key = elevKeys[k];
                    mapToUpdate[x][y] |= Game.BiomeTypes.elevation[key];
                    break;
                }
            }
        }
    }

    return eMap;
};

Game.World.prototype.generatePrecipitationMap = function(mapToUpdate) {
    // cache the mapSize
    var mapSize = mapToUpdate.length;

    // generate Precipitation map = heightMap mask -> "moisture" for each tile
    // same function and parameters as used in generateElevationMap.
    // Lower values for roughness tend to work best here (smoother gradient).
    var roughness = randomFloat(0, 0.4);
    // no value for seed, it will be set to a randomFloat(0, 1).
    var pMap = Game.Geometry.heightMap(mapSize, roughness);

    // randomly set percentages for each division:
    // ARID, SEMIARID, MODERATE, HUMID, RAINY
    // these are defined in Game.BiomeTypes.precipitations

    // Strategy: for each category, pick a cutoff% that "around" what we'd expect
    // from an equal division. We'll use the "fair" percent as the mean,
    // and pick a random value for the actual category %.
    var numCats = Object.keys(Game.BiomeTypes.precipitation).length;
    var fairPct = 1.00 / numCats;
    var cutoffPercents = new Array(numCats);

    for (var j = 0, marker = 0; j < numCats; j++) {
        // this is the strategy described above
        var cutoff;
        do {
            cutoff = randomNormal(fairPct, 0.05);
        } while (cutoff <= 0);
        // the do-while is to ensure positive values, since the Normal distribution will
        // sometimes (rarely) extend into negative values.

        cutoffPercents[j] = cutoff + marker;
        marker += cutoff;
    }
    // the above strategy will likely result in the highest cutoff% being > 1,
    // so we normalize it so that the highest cutoff% = 1.
    // Although, I suppose we could ignore this step if we wanted to possibly
    // exclude the higher (wetter) values from appearing in our map...
    cutoffPercents = normalizeArray(cutoffPercents);

    var precipKeys = getKeysSortedByValue(Game.BiomeTypes.precipitation);
    // now that we have our cutoff ranges defined and normalized,
    // we can loop through our data array applying our
    // appropriate zone to the map we want, based on the value.
    for (var x = 0; x < mapSize; x++) {
        for (var y = 0; y < mapSize; y++) {
            var precip = pMap[x][y];
            for (var key, k = 0; k < numCats; k++) {
                if (precip <= cutoffPercents[k]) {
                    // set the appropriate bit in the mapToUpdate
                    key = precipKeys[k];
                    mapToUpdate[x][y] |= Game.BiomeTypes.precipitation[key];
                    break;
                }
            }
        }
    }

    return pMap;
};

Game.World.prototype.generateTemperatureMap = function(mapToUpdate) {
    // cache the mapSize
    var mapSize = mapToUpdate.length;

    // generate Temperature gradient.
    // we will use a Gaussian (normal) distribution around the "equator"
    // to simulate a Temperature gradient.

    // call Math.getGaussianFunction(mean, std, maxValue)
    // this returns a function that can be used to find the Gaussian probability of a
    // given value of X (or in the case of our map, a given latitude/y-coordinate).

    // mean: set this to the "equator" of the map.
    // std: this is how quickly the avg temperature "drops off" beyond the equator;
    //      smaller values = lower temps closer to the equator
    // maxValue: defaults to 1.0; limiting this will prevent higher-temperature
    //      areas from generating... good if we want an ice planet, for instance.

    // IDEA: in the future, if we wanted to have really "funky" worlds where the
    // 'equator' is at an angle, we could set it to some linear function
    // and then use that to determine the temperatureGradient at each map cell.
    // For now, let's just set it at the center line of our map.
    var equator = mapSize / 2;

    // std: how quickly the temperature gradient will "drop off" beyond the equator.
    // larger denominator here will tend toward 'colder' maps.
    var std = equator / randomFloat(0.5, 3.5);

    // limiting the maxValue gives a chance to not have any highest-temp zones at all.
    // tweak, remove, or comment out the next line if you want to change this.
    var maxValue = randomFloat(0.65, 1);

    var temperatureGradient = Math.getGaussianFunction(equator, std, maxValue);
    // temperatureGradient(y) will return a value between 0-maxValue;
    // We'll loop through and apply it to each map cell based on that cell's y-coord.
    // Rather than having two loops (one to apply the function, and another to set the category),
    // both of these operations are handled in the same loop - scroll down a bit.

    // randomly set percentages for each temperature category cutoff:
    // TROPICAL, SUBTROPICAL, TEMPERATE, BOREAL, SUBARCTIC, ARCTIC
    // these are defined in Game.BiomeTypes.temperatures

    // Strategy: for each category, pick a cutoff% that "around" what we'd expect
    // from an equal division. We'll use the "fair" percent as the mean,
    // and pick a random value for the actual category %.
    var numCats = Object.keys(Game.BiomeTypes.temperature).length;
    var fairPct = 1.00 / numCats;
    var cutoffPercents = new Array(numCats);

    for (var j = 0, marker = 0; j < numCats; j++) {
        // this is the strategy described above
        var cutoff;
        do {
            cutoff = randomNormal(fairPct, 0.05);
        } while (cutoff <= 0);
        // the do-while is to ensure positive values, since the Normal distribution will
        // sometimes (rarely) extend into negative values.

        cutoffPercents[j] = cutoff + marker;
        marker += cutoff;
    }
    // the above strategy will likely result in the highest cutoff% being > 1,
    // so we normalize it so that the highest cutoff% = 1.
    // Although, I suppose we could ignore this step if we wanted to possibly
    // exclude the higher (hotter) values from appearing in our map...
    // Though I think the better way to limit that is via the maxValue parameter above.
    cutoffPercents = normalizeArray(cutoffPercents);

    var tempKeys = getKeysSortedByValue(Game.BiomeTypes.temperature);
    // now that we have our cutoff ranges defined and normalized,
    // we can loop through our map applying our
    // temperature gradient function, along with the
    // appropriate zone based on the value.
    var tMap = [];
    for (var i = 0; i < mapSize; i++) {
        tMap[i] = new Array(mapSize);
    }

    var thisTemp;
    for (var y = 0; y < mapSize; y++) {
        for (var x = 0; x < mapSize; x++) {
            // let's vary slightly the value passed in,
            // so that there's some variety in our temperature "bands"
            thisTemp = temperatureGradient(randomNormalInt(y, 5));
            tMap[x][y] = thisTemp;
            for (var key, k = 0; k < cutoffPercents.length; k++) {
                if (thisTemp <= cutoffPercents[k]) {
                    // set the appropriate bit in the map
                    key = tempKeys[k];
                    mapToUpdate[x][y] |= Game.BiomeTypes.temperature[key];
                    break;
                }
            }
        }
    }

    return tMap;
};
