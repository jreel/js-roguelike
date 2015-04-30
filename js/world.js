/**
 * Created by jreel on 4/4/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

/*
    WORLD:  a collection of AREAs, with one "zoomed out" / "overworld" map.
*/

Game.World = function(options) {
    options = options || {};

    // In the constructor function, we should pre-generate the "overworld"
    // and the starting Area.
    // Other Areas will be generated only when they are first visited.

    // Areas should be consistent in size,
    // with a random number of Areas per World (width * height).

    // Create the world map first (width * height).

    this.worldName = "";            // Markov generated?

    // options that could be passed into generateWorldMap below:
    // levelOfDetail = map size (power of 2)
    // roughness, seed for elevation map
    // waterline, piedmont, treeline, snowline
    // (and cutoffs for other elevation categories)
    //
    // roughness, seed for moisture map
    // and category cutoffs
    //
    // std for temperature gradient
    // (and category cutoffs?)
    this.worldMap = this.generateWorldMap(options);      // 2D map

    this.areas = null;            // populated from createArea() method
    this.currentArea = null;        // area id that the player is currently in

};

Game.World.prototype.generateWorldMap = function(options) {
    // this should create a worldMap in the format: grid[x][y] = tile
    // randomly scatter points of interest (mountains, dungeons, towns, etc.)
    // we also need to be able to wrap east <-> west via whatever move() method we use
    // (in other words, this is a 'cylindrical' world map)
    options = options || {};
    var mapSize = nearestPowerOf2(options.mapSize) || 256;

    // Step 1: generate Height Map -> elevation for each tile
    var elevationMap = this.generateElevationMap({ mapSize:mapSize });

    // Step 2: generate Precipitation map = heightMap mask -> "moisture" for each tile
    var precipitationMap = this.generatePrecipitationMap({ mapSize: mapSize });

    // Step 3: generate Temperature gradient
    var temperatureMap = this.generateTemperatureMap({ mapSize: mapSize });

    // Step 4: each tile for each map should have had bits set in Steps 1-3.
    // Now we can combine into one master map, and compare the tile value to
    // the defined biomes in Game.BiomeTypes.
    // if ( (Tile & Game.BiomeTypes.biomes[i]) === Tile ) is true,
    // then that Tile is that biome type.
    var tileType;
    var biomesMap = new Array(mapSize);
    for (var x = 0; x < mapSize; x++) {
        biomesMap[x] = new Array(mapSize);
        for (var y = 0; y < mapSize; y++) {
            tileType = elevationMap[x][y] |
                       precipitationMap[x][y] |
                       temperatureMap[x][y];

            for (var i = 0; i < Game.BiomeTypes.biomes.length; i++) {
                if ((tileType & Game.BiomeTypes.biomes[i]) === tileType) {
                    biomesMap[x][y] = Game.BiomeTypes.biomes[i];
                    break;
                }
            }
        }
    }

    Game.Geometry.consoleOut(biomesMap, Game.BiomeTypes.biomes, ['.', 'I', '▓', '▒', '∆', 'A', '/', '#',
                                                                 '=','~','m','s',"'","-",
                                                                 "T","&",",",
                                                                 'F','f','%','w',':',
                                                                 '*','`','J','"']);

    return biomesMap;


    // We can set a glyph depending on which biome.
    // Game.BiomeTiles.list will contain a list of Tile objects
    // corresponding to the various biomes.

    // Step 5: At the end of the process, we should have a worldMap 2D array,
    // with each worldMap[x][y] having a set of properties:
    //      .elevation      =   Game.BiomeTypes.ELEVATION_x, from Step 1
    //      .precipitation  =   Game.BiomeTypes.PRECIPITATION_x, from Step 2
    //      .latitude       =   Game.BiomeTypes.LATITUDE_x, from Step 3
    //      .biome          =   Game.BiomeTypes.biomes[i], from Step 4
    //      .tile           =   Game.BiomeTiles.list[i], from Step 4
    //      .area           =   null. Generated upon player entering.
    //                          New Area will be generated based on the above
    //                          properties stored in the worldMap[x][y].

};

Game.World.prototype.generateElevationMap = function(options) {
    options = options || {};
    var mapSize = nearestPowerOf2(options.mapSize) || 256;
    var waterline = randomFloat(0.5, 0.75);
    // Step 1: generate Height Map -> elevation for each tile
    // call Game.Geometry.heightMap(levelOfDetail, roughness, seed)
    // levelOfDetail = any integer greater than 1; map size will be 2^(levelOfDetail)
    // roughness = value between (0, 1); values around 0.6 tend to be most "earth-like"
    // seed = value between (0, 1); initial value of the 4 corners
    //var lod = Math.round(Math.log(mapSize)/Math.log(2));
    var roughness = randomFloat(0.5, 0.75);
    var seed = randomNormal(waterline, 0.05);
    var eMap = Game.Geometry.heightMap(mapSize, roughness, seed);

    // randomly set percentages for each elevation division:
    // DEEP_WATER, SHALLOW_WATER, COASTAL, PLAINS, HILLS, MONTANE, ALPINE, SNOWCAP
    var numCats = Game.BiomeTypes.elevations.length;
    var fairPct = 1.00 / numCats;
    var cutoffPercents = new Array(numCats);

    var cutoff, marker = 0;
    for (var j = 0; j < numCats; j++) {
        // pick a cutoff % that's "around" what we'd expect from an equal division
        // use the fairPct as the mean, and a random standard deviation,
        // and pick a random value from the resulting normal distribution

        // set the waterline to what we've defined
        if (j === 0) {
            cutoffPercents[j] = waterline / randomFloat(1.1, 2);
        } else if (j === 1) {
            cutoffPercents[j] = waterline;
            marker = waterline;
        } else {
            do {
                cutoff = randomNormal(fairPct, randomFloat(0.005, 0.025));
            } while (cutoff <= 0);
            cutoffPercents[j] = cutoff + marker;
            marker += cutoff;
        }
    }
    cutoffPercents = normalizeArray(cutoffPercents);
    console.log(cutoffPercents);
    // now that we have our cutoff ranges defined and normalized,
    // we can loop through our data array applying our
    // appropriate zone based on the value.
    for (var x = 0; x < mapSize; x++) {
        for (var y = 0; y < mapSize; y++) {
            var elev = eMap[x][y];
            for (var k = 0; k < cutoffPercents.length; k++) {
                if (elev <= cutoffPercents[k]) {
                    eMap[x][y] = Game.BiomeTypes.elevations[k];
                    break;
                }
            }
        }
    }

    Game.Geometry.consoleOut(eMap, Game.BiomeTypes.elevations, ['▓', '▒', "'", '"', "^", "*", '∆', '∆'])

    return eMap;
};

Game.World.prototype.generatePrecipitationMap = function(options) {
    options = options || {};
    var mapSize = nearestPowerOf2(options.mapSize) || 256;

    // Step 2: generate Precipitation map = heightMap mask -> "moisture" for each tile
    // same function and parameters as above.
    // smoother values for roughness would probably work best here.
    //var lod = Math.round(Math.log(mapSize) / Math.log(2));

    //var mean = randomInt(15, 25);
    //var roughness = randomNormalInt(mean, 5) / 100;
    var roughness = randomFloat(0,0.4);
    var pMap = Game.Geometry.heightMap(mapSize, roughness);

    // set percentages for each division:
    // ARID, SEMIARID, MODERATE, HUMID, RAINY
    var numCats = Game.BiomeTypes.precipitations.length;
    var fairPct = 1.00 / numCats;
    var cutoffPercents = new Array(numCats);

    for (var j = 0, marker = 0; j < numCats; j++) {
        // pick a cutoff % that's "around" what we'd expect from an equal division
        // use the fairPct as the mean, and a random standard deviation,
        // and pick a random value from the resulting normal distribution
        var cutoff;
        do {
            cutoff = randomNormal(fairPct, 0.05); //randomFloat(0.005, 0.1));
        } while (cutoff <= 0);

        // if we wanted to make any adjustments to any category
        // like we do with elevation and temperature,
        // this is where it would go

        cutoffPercents[j] = cutoff + marker;
        marker += cutoff;
    }
    cutoffPercents = normalizeArray(cutoffPercents);

    // now that we have our cutoff ranges defined and normalized,
    // we can loop through our data array applying our
    // appropriate zone based on the value.
    for (var x = 0; x < mapSize; x++) {
        for (var y = 0; y < mapSize; y++) {
            var precip = pMap[x][y];
            for (var k = 0; k < cutoffPercents.length; k++) {
                if (precip <= cutoffPercents[k]) {
                    pMap[x][y] = Game.BiomeTypes.precipitations[k];
                    break;
                }
            }
        }
    }

    Game.Geometry.consoleOut(pMap, Game.BiomeTypes.precipitations, [".", '"', "%", '▒', '▓']);

    return pMap;
};

Game.World.prototype.generateTemperatureMap = function(options) {
    options = options || {};
    var mapSize = nearestPowerOf2(options.mapSize) || 256;
    var normalMax = options.normalMax || 35;
    var normalMin = options.normalMin || -25;
    var extremeMax = options.extremeMax || 50;
    var extremeMin = options.extremeMin || -35;

    // Step 3: generate Temperature gradient
    // call Math.getGaussianFunction(mean, std, peakHeight)
    // mean: set this to the "equator" of the map.
    // std: this is how quickly the avg temperature "drops off" beyond the equator;
    //      smaller values = lower temps closer to the equator
    // peakHeight: default value of 1.0, should be fine here
    // this returns a function that can be used to find the Gaussian probability of a
    // given value of X (or in the case of our map, a given latitude/y-coordinate).

    var tMap = new Array(mapSize);
    for (var i = 0; i < mapSize; i++) {
        tMap[i] = new Array(mapSize);
    }
    var equator = mapSize / 2;
    var stdev = equator / randomFloat(0.5, 3.5);  // larger denominator will tend toward 'colder' maps
    // limiting the maxValue gives a chance to not have any highest-temp zones at all.
    // remove or comment out the next line if you want to change this.
    var maxValue = randomFloat(0.65, 1);
    var temperatureGradient = Math.getGaussianFunction(equator, stdev, maxValue);
    // temperatureGradient(y) will return a value between 0-maxValue;
    // need to normalize this to an actual temperature range
    // minTemp < arctic < subarctic < boreal < temperate < subtropic < tropic < maxTemp

    // set division cutoffs:
    // TROPICAL, SUBTROPICAL, TEMPERATE, BOREAL, SUBARCTIC, ARCTIC
    // "normal" (ie., Earth-like) temperature ranges are -25C to +35C,
    // with 10 degrees C between each division.
    // Let's randomly extend this range in either direction,
    // while keeping the 10 degrees C for the in-between zones for convenience.
    var minTemp = randomInt(extremeMin, normalMin);      // random extreme lowest temp for the world
    var maxTemp = randomInt(normalMax, extremeMax);        // random extreme highest temp for the world
    var numCats = Game.BiomeTypes.temperatures.length;
    var fairPct = 1.00 / numCats;
    var cutoffPercents = new Array(numCats);

    var normalRange = normalMax - normalMin;
    var degPerCat = normalRange / numCats;

    // make a temperature chance/cutoff array based on the
    // Game.BiomeTypes.temperatures array.
    for (var j = 0, marker = 0; j < numCats; j++) {
        // pick a cutoff % that's "around" what we'd expect from an equal division
        // use the fairPct as the mean, and a random standard deviation,
        // and pick a random value from the resulting normal distribution
        var cutoff;
        do {
            cutoff = randomNormal(fairPct, 0.05);   //randomFloat(0.005, 0.1));
        } while (cutoff <= 0);

        // for the first and the last temperature zone, we want to use
        // our "extreme" min/max temps, so let's add some extra amount of
        // the appropriate percentage, and normalize later.
        if (j === 0) {
        //    cutoff += ((normalMin - minTemp) * (fairPct / degPerCat)) / (randomFloat(1,3));
        }
        if (j === numCats - 1) {
        //    cutoff += ((maxTemp - normalMax) * (fairPct / degPerCat)) / (randomFloat(1,3));
        }
        cutoffPercents[j] = cutoff + marker;
        marker += cutoff;
    }
    cutoffPercents = normalizeArray(cutoffPercents);

    // now that we have our cutoff ranges defined and normalized,
    // we can loop through our data array applying our
    // temperature gradient function, along with the
    // appropriate zone based on the value.

    var thisTemp, assign;
    var coldCount = 0;
    var hotCount = 0;
    for (var y = 0; y < mapSize; y++) {
        for (var x = 0; x < mapSize; x++) {
            // let's let each x vary slightly around y
            thisTemp = temperatureGradient(randomNormalInt(y, 1));
            for (var k = 0; k < cutoffPercents.length; k++) {
                if (thisTemp <= cutoffPercents[k]) {
                    assign = Game.BiomeTypes.temperatures[k];
                    if (assign === Game.BiomeTypes.temperatures[0]) {coldCount++;}
                    if (assign === Game.BiomeTypes.temperatures[Game.BiomeTypes.temperatures.length-1]) {hotCount++;}
                    tMap[x][y] = assign;
                    break;
                }
            }
        }
    }

    Game.Geometry.consoleOut(tMap, Game.BiomeTypes.temperatures, [".", '"', "*", '#', '▒', '▓']);

    var mapAreaPercent = 100 / (mapSize * mapSize);
    console.log('polar: ' + coldCount * mapAreaPercent + "%, tropic: " + hotCount * mapAreaPercent + "%");
    return tMap;
};

Game.World.prototype.createArea = function(options) {
    // pick random Biome template
    // use the dungeonGenerator(width, height, tileset) assigned by Biome selection
    // dungeonGenerator should return a 2D array of tiles
    // assign Area.map = new Map(tiles)

    options = options || {};
    var width;
    var height;

    var area = new Game.Area(options);
    this.areas.push(area);
    area.world = this;
    area.id = this.areas.length - 1;

    var biome;      // pick randomly?
    var grid;        // = dungeonGenerator(options)
    area.map = new Game.Map(grid);
    area.setupFov();
};




Game.World.prototype.randomLevel = function(params) {
    params = params || {};
    // the defaults here should almost always result in a area size that
    // is larger than the game screen.
    // TODO: figure out a better algorithm for appropriate size now that user can resize the game screen
    var meanWidth = params['meanWidth'] || Game.screenWidth * 1.5;
    var meanHeight = params['meanHeight'] || Game.screenHeight * 1.5;

    var stdWidth = params['stdWidth'] || meanWidth / 9;         // equivalent to Game.screenWidth / 6
    var stdHeight = params['stdHeight'] || meanHeight / 9;      // if meanWidth is set via defaults

    var rndWidth = randomNormalInt(meanWidth, stdWidth);
    var rndHeight = randomNormalInt(meanHeight, stdHeight);

    rndWidth = (rndWidth % 2 === 0) ? rndWidth : (rndWidth + 1);    // make sure height/width are even #s
    rndHeight = (rndHeight % 2 === 0) ? rndHeight : (rndHeight + 1);

    // TODO: random map type as well?

    return {width: rndWidth, height: rndHeight};
};




Game.World.prototype.render = function(tiles) {
    if (!tiles || tiles === []) {
        return;
    }

    // loop through tiles array, building output string depending on tile type
    var gridOut = "\n\r";

    for (var x = 0; x < tiles.length; x++) {
        for (var y = 0; y < tiles[x].length; y++) {
            if (tiles[x][y] === Game.Tile.nullTile) {
                gridOut += "█";
            } else if (tiles[x][y] === Game.Tile.floorTile) {
                gridOut += "░";
            } else if (tiles[x][y] === Game.Tile.wallTile) {
                gridOut += "▓";
            } else if (tiles[x][y] === Game.Tile.corridorTile) {
                gridOut += "▒";
            }
        }
        gridOut += "\n\r";
    }

    console.log(gridOut);
};




/*
code from dance-of-death-worldgen by nolithius (Ebyan Alvarez-Buylla)
https://code.google.com/p/dance-of-death-worldgen/source/browse/#svn%2Ftrunk%2Fsrc%2Fcom%2Fnolithius%2Fdodworldgen%2Fmaps
 */

/*
Game.World.prototype.initMap = function(options) {

    options = options || {};
    this.width = options['width'] || Game.screenWidth * 2;
    this.height = options['height'] || Game.screenHeight * 2;
    this.maxElevation = options['maxElevation'] || 255;

    // initialize grid array
    this.worldMap = new Array(this.width);
    for (var x = 0; x < this.width; x++) {
        this.worldMap[x] = new Array(this.height);
        for (var y = 0; y < this.height; y++) {
            this.worldMap[x][y] = Game.Tile.nullTile;
        }
    }

};

// draw elevation as a grayscale value
Game.World.prototype.drawElevation = function() {

    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            // convert to gray for drawing
            var b = this.worldMap[x][y].elevation;
            var color = Math.min(0xFFFFFF, b << 16 | b << 8 | b);

            // Screen.drawTile(0, x, y, 0, color);
        }
    }
};

// draw tiles by type
// setTileTypeByElevation() must be called before this.
Game.World.prototype.draw = function() {

    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            var tile = this.worldMap[x][y];
            // Screen.drawTile(tile.ascii, x, y, tile.foreground, tile.background);
        }
    }
};

// normalizes the elevation values from 0 to this.maxElevation,
// and returns the highest point (useful to place dungeon)
Game.World.prototype.normalize = function() {
    var smallest = Number.MAX_VALUE;
    var largest = 0;

    // find the largest and smallest tiles
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            if (this.worldMap[x][y].elevation > largest) {
                largest = this.worldMap[x][y].elevation;
            }
            if (this.worldMap[x][y].elevation < smallest) {
                smallest = this.worldMap[x][y].elevation;
            }
        }
    }

    // normalize
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            var percent = (this.worldMap[x][y].elevation - smallest) / (largest - smallest);
            this.worldMap[x][y].elevation = Math.round(percent * this.maxElevation);

        }
    }
};

// calculate the elevation that corresponds to the waterline,
// and pass it into setTileByElevation().
// param waterPercent = the percentage of water in the world.
Game.World.prototype.calculateWaterline = function(waterPercent) {
    waterPercent = waterPercent || 0.6;

    // sample for accurate land-earth balance
    // (do this on a searate loop, after the mask has been applied, and after normalized)
    var sample = [];
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            sample.push(this.worldMap[x][y].elevation);
        }
    }
    sample.sort(sortNumber);

    var threshold = sample[sample.length * waterPercent];
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            this.worldMap[x][y].setTileTypeByElevation(threshold);
        }
    }
};

// multiply map
// creates a map by multiplying the source and mask values, then normalizes
// @param source = the base map (any range allowed)
// @param mask = the mask to multiply (values from 0 to maxElevation)
Game.World.prototype.multiplyMap = function(source, mask) {
    for (var x = 0; x < this.width; x++) {
        for (var y = 0; y < this.height; y++) {
            // multiply blending
            this.worldMap[x][y].elevation =
                source.grid[x][y].elevation * (mask.grid[x][y].elevation / this.maxElevation);
        }
    }

    this.normalize();
};

// Perlin noise map
Game.World.prototype.noiseMap = function() {
    var bitmapData = new BitmapData(this.width, this.height, false, 0);
    bitmapData.perlinNoise(this.width / 2, this.height / 2, 8, Math.floor(Math.random() * 10000), false, true, 7, true);
    var pixels = bitmapData.getVector(bitmapData.rect);
    for (var i = 0; i < pixels.length; i++) {
        var ix = i % this.width;
        var iy = Math.floor(i / this.width);

        // set the elevation to the blue value of this noise (grayscale)
        this.worldMap[ix][iy].elevation = pixels[i] & 0x0000FF;
    }

};

Game.World.TerrainTile = {
    TYPE_BLANK: 0,

    TYPE_DEEP_WATER: 1,
    TYPE_SHALLOW_WATER: 2,

    TYPE_COASTLINE: 3,
    TYPE_PLAINS: 4,
    TYPE_FOREST: 5,
    TYPE_HILL: 6,
    TYPE_MOUNTAIN: 7,


    COLOR_BLACK: 0x000000,
    COLOR_BLUE: 0x0000fc,
    COLOR_BROWN: 0xa47541,
    COLOR_GREEN: 0x009900,
    COLOR_LIGHTBLUE: 0x118cff,
    COLOR_LIGHTGRAY: 0xd2d2d2,
    COLOR_LIMEGREEN: 0x00ff00,
    COLOR_WHITE: 0xffffff,
    COLOR_YELLOW: 0xffff00,

    THRESHOLD_SHALLOW_WATER: 40,        // percent of waterline
    THRESHOLD_COASTLINE: 15,            // percent above waterline
    THRESHOLD_PLAINS: 35,               // percent above waterline
    THRESHOLD_MOUNTAIN: 25,             // percent below maxElevation
    THRESHOLD_HILL: 50,                 // percent below maxElevation

    x: null,
    y: null,
    elevation: 0,
    name: "",
    ascii: 32,
    foregroundColor: 0xffffff,
    backgroundColor: 0x000000,
    type: null
};

Game.World.TerrainTile.prototype.init = function(x, y) {
    this.x = x;
    this.y = y;
};

Game.World.TerrainTile.prototype.getType = function() {
    return this.type;
};

Game.World.TerrainTile.prototype.setType = function(typeValue) {
    this.type = typeValue;

    var tileType = Game.World.TerrainTileTypes[typeValue];

    if (tileType) {
        this.name = tileType.name;
        this.ascii = tileType.ascii;
        this.foregroundColor = tileType.foregroundColor;
        this.backgroundColor = tileType.backgroundColor;
    }
};

Game.World.TerrainTile.prototype.setTileTypeByElevation = function(waterLine) {
    waterLine = waterLine || 128;

    if (this.elevation < waterLine) {
        if (elevation > waterLine - this.THRESHOLD_SHALLOW_WATER) {
            this.type = this.TYPE_SHALLOW_WATER;
        } else {
            this.type = this.TYPE_DEEP_WATER;
        }
    } else if (this.elevation < waterLine + this.THRESHOLD_COASTLINE) {
        this.type = this.TYPE_COASTLINE;

    } else if (this.elevation < waterLine + this.THRESHOLD_PLAINS) {
        this.type = this.TYPE_PLAINS;

    } else if (this.elevation > this.maxElevation - this.THRESHOLD_MOUNTAIN) {
        this.type = this.TYPE_MOUNTAIN;

    } else if (this.elevation > this.maxElevation - this.THRESHOLD_HILL) {
        this.type = this.TYPE_HILL;

    } else {
        this.type = this.TYPE_FOREST;
    }

};
*/