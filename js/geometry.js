/**
 * Created by jreel on 4/24/2015.
 */

Game.Geometry = {};

Game.Geometry.roomRect = function(topLeftX, topLeftY, bottomRightX, bottomRightY) {
    // this differs from the 'standard' rectangle object in that it is defined by
    // the 4 cells at each *interior* corner.
    // (which is slightly different than x, y, width, height)
    this.topLeftX = topLeftX;
    this.topLeftY = topLeftY;
    this.bottomRightX = bottomRightX;
    this.bottomRightY = bottomRightY;
};

Game.Geometry.roomRect.prototype.getWidth = function() {
    return (this.bottomRightX + 1) - this.topLeftX;
};

Game.Geometry.roomRect.prototype.getHeight = function() {
    return (this.bottomRightY + 1) - this.topLeftY;
};

Game.Geometry.roomRect.prototype.getArea = function() {
    return this.getWidth() * this.getHeight();
};

Game.Geometry.drawLine = function(grid, startX, startY, endX, endY, penTile) {
    var dx = Math.abs(endX - startX);
    var sx = (startX < endX) ? 1 : -1;
    var dy = Math.abs(endY - startY);
    var sy = (startY < endY) ? 1 : -1;
    var err = (dx > dy ? dx : -dy) / 2;

    var x = startX;
    var y = startY;
    while (true) {
        grid[x][y] = penTile;
        if (x === endX && y === endY) {
            break;
        }
        var e = err;
        if (e > -dx) {
            err -= dy;
            x += sx;
        }
        if (e < dy) {
            err += dx;
            y += sy;
        }
    }
};

Game.Geometry.drawCircle = function(grid, centerX, centerY, radius, penTile) {
    // using 'midpoint circle algorithm' from Wikipedia page of the same name
    var x = radius;
    var y = 0;
    var radiusError = 1 - x;

    while (x >= y) {
        grid[ x + centerX][ y + centerY] = penTile;
        grid[ y + centerX][ x + centerY] = penTile;
        grid[-x + centerX][ y + centerY] = penTile;
        grid[-y + centerX][ x + centerY] = penTile;
        grid[-x + centerX][-y + centerY] = penTile;
        grid[-y + centerX][-x + centerY] = penTile;
        grid[ x + centerX][-y + centerY] = penTile;
        grid[ y + centerX][-x + centerY] = penTile;
        y++;
        if (radiusError < 0) {
            radiusError += 2 * y + 1;
        } else {
            x--;
            radiusError += 2 * (y - x) + 1;
        }
    }
};


Game.Geometry.fillCircle = function(grid, centerX, centerY, radius, fillTile) {
    // copied from the DrawFilledCircle algorithm
    // http://stackoverflow.com/questions/1201200/fast-algorithm-for-drawing-filled-circles
    var x = radius;
    var y = 0;
    var xChange = 1 - (radius << 1);
    var yChange = 0;
    var radiusError = 0;

    while (x >= y) {
        for (var i = centerX - x; i <= centerX + x; i++) {
            grid[i][centerY + y] = fillTile;
            grid[i][centerY - y] = fillTile;
        }
        for (var j = centerX - y; j <= centerX + y; j++) {
            grid[j][centerY + x] = fillTile;
            grid[j][centerY - x] = fillTile;
        }
        y++;
        radiusError += yChange;
        yChange += 2;
        if (((radiusError << 1) + xChange) > 0) {
            x--;
            radiusError += xChange;
            xChange += 2;
        }
    }
};

/*
    Diamond-Square algorithm for generating heightmaps
    from http://stackoverflow.com/questions/2755750/diamond-square-algorithm
    JS implementation by Joel: http://pastebin.com/0HXRjFfJ
 */
Game.Geometry.heightMap = function(divisions, roughness, seed) {
    // levelOfDetail is any integer greater than one;
    // this is the power of 2 to use to generate the map.

    //var divisions = 1 << levelOfDetail;

    roughness = roughness || Math.random();

    var data = new Array(divisions + 1);
    for (var i = 0; i < data.length; i++) {
        data[i] = new Array(divisions + 1);
    }

    // initial seed value for the corners
    seed = seed || Math.random();
    data[0][0] = data[0][divisions] = data[divisions][0] = data[divisions][divisions] = seed;

    //console.log('roughness: ' + roughness + ', seed: ' + seed);
    var h = roughness;       // the range (-h -> +h) for the average offset
    // at iteration 'n', we add a random perturbation to the grid:
    // -h^n <= perturbation <= h^n
    // small values for roughness result in smoother terrain

    // side length is distance of a single square side
    // or distance of diagonal in diamond

    for (var sideLength = divisions;
        // side length must be >= 2 so we always have
        // a new value (if it's 1, we overwrite existing values
        // on the last iteration)
     sideLength >= 2;
        // each iteration we are looking at smaller squares and
        // diamonds, and we decrease the variation of the offset
     sideLength /= 2, h *= roughness) {

        // half the length of the side of a square or
        // distance from diamond center to one corner
        // (just to make the calcs below a little clearer)
        var halfSide = sideLength / 2.0;

        // generate the new square values
        for (var x = 0; x < divisions; x += sideLength) {
            for (var y = 0; y < divisions; y += sideLength) {
                // x, y is the upper left corner of square
                // calculate average of existing corners
                var avg = data[x][y] +              // top left
                          data[x+sideLength][y] +   // top right
                          data[x][y+sideLength] +   // lower left
                          data[x+sideLength][y+sideLength]; // lower right
                avg /= 4.0;

                // height of the center is avg plus random offset.
                // calculate random value in range of 2h
                // and then subtract h so the end value
                // is in the range (-h, +h)
                data[x+halfSide][y+halfSide] = avg + (2 * Math.random() * h) - h;

            }
        }

        // generate the diamond values
        // since diamonds are staggered, we only move x by half side
        // NOTE: if the data shouldn't wrap east-west, then x <= divisions
        // to generate the far edge values
        for (x = 0; x < divisions; x += halfSide) {
            // and y is offset by half a side, but moved by
            // the full side length
            // NOTE: if data shouldn't wrap north-south, then y <= divisions
            // to generate the far edge values
            for (y = (x + halfSide) % sideLength; y <= divisions; y += sideLength) {
                // x, y is center of diamond
                // note we must use mod and add divisions for subtraction
                // so that we can wrap around the array to find the corners
                avg = data[(x-halfSide + divisions) % (divisions)][y] +     // left of center
                      data[(x+halfSide) % (divisions)][y] +                 // right of center
                      data[x][(y+halfSide) % (divisions)] +                 // below center
                      data[x][(y-halfSide + divisions) % (divisions)];      // above center
                avg /= 4.0;

                // new value = avg plus random offset
                // calculate random value in range of 2h
                // and then subtract h so the end value
                // is in the range (-h, +h)

                // update value for center of diamond
                data[x][y] = avg + (2 * Math.random() * h) - h;

                // wrap values on the edges
                // remove this and adjust loop condition above
                // for non-wrapping values
                // (remove y condition to keep only east-west wrapping)
                if (x === 0) {
                    data[divisions][y] = avg;
                }
                /*
                if (y === 0) {
                    data[x][divisions] = avg;
                }
                */
            }
        }
    }

    // unfortunately, the rest of our game code requires EVEN width/height,
    // so we need to trim one row & one col from our data.
    // loop through the outer array (x) and drop the last element of each inner (y) array,
    // then drop the last x array.
    for (x = 0; x < data.length; x++) {
        data[x].shift();
    }
    data.shift();

    // scale the data to largest/smallest values
    // this will ensure that we actually have a good chance of having water
    // if not, use normalizeGrid(data) instead
    data = scaleGrid(data);

    // let's render it to the console for now
    //Game.Geometry.consoleOut(data);
    //console.log(data);
    return data;
};

/*
 for (i = 0; i < levelOfDetail; i++) {
 var q = 1 << 1;
 var side = 1 << (levelOfDetail - i);
 var s = side >> 1;
 for (var x = 0; x < divisions; x += side) {
 for (var y = 0; y < divisions; y += side) {
 if (side > 1) {
 var half = side / 2;
 var avg = (data[x][y] + data[x+side][y] +
 data[x+side][y] + data[x+side][y+side]) / 4.0;
 data[x+half][y+half] = avg + (2 * ROT.RNG.getUniform() * h) - h;
 }
 }
 }
 if (s > 0) {
 for (j = 0; j <= divisions; j += s) {
 for (k = (j + s) % side; k <= divisions; k += side) {
 x = j - s;
 y = k - s;
 half = side / 2;
 avg = 0;
 var sum = 0;
 if (x >= 0) {
 avg += data[x][y+half];
 sum++;
 }
 if (y >= 0) {
 avg += data[x+half][y];
 sum++;
 }
 if (x + side <= divisions) {
 avg += data[x+side][y+half];
 sum++;
 }
 if (y + side <= divisions) {
 avg += data[x+half][y+side];
 sum++;
 }
 data[x+half][y+half] = (avg / sum) + (2 * ROT.RNG.getUniform() * h) - h;
 }
 }
 }
 h *= roughness;
 }
 */

/*
 Game.Geometry.heightMap = function(levelOfDetail, roughness, SEED) {
 // levelOfDetail is any number greater than one;
 // this is the power of 2 to use to generate the map.

 var divisions = 1 << levelOfDetail;

 roughness = roughness || ROT.RNG.getUniform();

 var data = new Array(divisions + 1);
 for (var i = 0; i < data.length; i++) {
 data[i] = new Array(divisions + 1);
 }

 // initial seed value for the corners
 SEED = SEED || ROT.RNG.getUniform();
 data[0][0] = data[0][divisions] = data[divisions][0] = data[divisions][divisions] = SEED;

 var h = roughness;       // the range (-h -> +h) for the average offset
 // at iteration 'n', we add a random perturbation to the grid:
 // -h^n <= perturbation <= h^n
 // small values for roughness result in smoother terrain

 // side length is distance of a single square side
 // or distance of diagonal in diamond

 for (var sideLength = divisions;
 // side length must be >= 2 so we always have
 // a new value (if it's 1, we overwrite existing values
 // on the last iteration)
 sideLength >= 2;
 // each iteration we are looking at smaller squares and
 // diamonds, and we decrease the variation of the offset
 sideLength /= 2, h *= roughness) {

 console.log('h: ' + h);
 // half the length of the side of a square or
 // distance from diamond center to one corner
 // (just to make the calcs below a little clearer)
 var halfSide = sideLength / 2.0;

 // generate the new square values
 for (var x = 0; x < divisions; x += sideLength) {
 for (var y = 0; y < divisions; y += sideLength) {
 // x, y is the upper left corner of square
 // calculate average of existing corners
 var avg = data[x][y] +              // top left
 data[x+sideLength][y] +   // top right
 data[x][y+sideLength] +   // lower left
 data[x+sideLength][y+sideLength]; // lower right
 avg /= 4.0;

 // height of the center is avg plus random offset.
 // calculate random value in range of 2h
 // and then subtract h so the end value
 // is in the range (-h, +h)
 data[x+halfSide][y+halfSide] = avg + (2 * ROT.RNG.getUniform() * h) - h;

 }
 }

 // generate the diamond values
 // since diamonds are staggered, we only move x by half side
 // NOTE: if the data shouldn't wrap, then x < DATA_SIZE
 // to generate the far edge values
 for (x = 0; x < divisions; x += halfSide) {
 // and y is offset by half a side, but moved by
 // the full side length
 // NOTE: if data shouldn't wrap, then y < divisions + 1
 // to generate the far edge values
 for (y = (x + halfSide) % sideLength; y < divisions; y += sideLength) {
 // x, y is center of diamond
 // note we must use mod and add divisions for subtraction
 // so that we can wrap around the array to find the corners
 avg = data[(x-halfSide + divisions) % (divisions)][y] +     // left of center
 data[(x+halfSide) % (divisions)][y] +                 // right of center
 data[x][(y+halfSide) % (divisions)] +                 // below center
 data[x][(y-halfSide + divisions) % (divisions)];      // above center
 avg /= 4.0;

 // new value = avg plus random offset
 // calculate random value in range of 2h
 // and then subtract h so the end value
 // is in the range (-h, +h)

 // update value for center of diamond
 data[x][y] = avg + (2 * ROT.RNG.getUniform() * h) - h;

 // wrap values on the edges
 // remove this and adjust loop condition above
 // for non-wrapping values
 if (x === 0) {
 data[divisions][y] = avg;
 }
 if (y === 0) {
 data[x][divisions] = avg;
 }
 }
 }
 }

 // unfortunately, the rest of our game code requires EVEN width/height,
 // so we need to trim one row & one col from our data.
 // loop through the outer array (x) and pop each inner (y) array,
 // then pop the last x array.
 for (x = 0; x < data.length; x++) {
 data[x].pop();
 }
 data.pop();


 // let's render it to the console for now
 Game.Geometry.consoleOut(data);

 return data;
 };
 */

Game.Geometry.consoleOut = function(data, compareArray, characterArray) {
    if (!data) {
        return;
    }

    // convert array to string for output.
    // (notice we need to break by rows, so the loops are reversed from the usual)

/*
    var dataOut = "\n\r";
    for (var y = 0; y < data[0].length; y++) {
        for (var x = 0; x < data.length; x++) {
            var percent = data[x][y] / maxValue;

            if (percent < 0.25) {
                 dataOut += "▓";

            } else if (percent < 0.5) {
                dataOut += "▒";

            } else if (percent < 0.75) {
                dataOut += "░";

            } else {
                dataOut += " ";
            }
        }
        dataOut += "\n\r";
    }
*/
    var width = data.length;
    var height = data[0].length;
    var dataOut = "\n\r";
    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var d = data[x][y];
            for (var k = 0; k < compareArray.length; k++) {
                if (d === compareArray[k]) {
                    dataOut += characterArray[k];
                }
            }
        }
        dataOut += "\n\r";
    }

    console.log(dataOut);
};