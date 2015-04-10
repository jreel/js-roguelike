/**
 * Created by jreel on 4/4/2015.
 */

Game.World = function(depth) {
    this.depth = depth || Game.numLevels;
    this.levels = new Array(this.depth);     // contains Level objects, one per depth

    // generate map for each level
    // TODO: varied map types
    for (var z = 1; z <= this.depth; z++) {
        var rndlvl = this.randomLevel();
        this.levels[z] = new Game.Level({
                level: z,
//                width: rndlvl.width,
//                height: rndlvl.height
                width: Game.screenWidth,        // comment out these two lines and uncomment
                height: Game.screenHeight       // the above two, to restore pseudo-random map size
            });
        var map = this.levels[z].generateMap();
        this.levels[z].map = new Game.Map(map);
        this.levels[z].placeExits();
        this.levels[z].setupFov();
    }
};

Game.World.prototype.randomLevel = function(params) {
    params = params || {};
    // the defaults here should almost always result in a level size that
    // is larger than the game screen.
    var meanWidth = params['meanWidth'] || Game.screenWidth * 1.5;
    var meanHeight = params['meanHeight'] || Game.screenHeight * 1.5;

    var stdWidth = params['stdWidth'] || Game.screenWidth / 6;
    var stdHeight = params['stdHeight'] || Game.screenHeight / 6;

    var rndWidth = randomNormalInt(meanWidth, stdWidth);
    var rndHeight = randomNormalInt(meanHeight, stdHeight);

    // TODO: random map type as well?

    return {width: rndWidth, height: rndHeight};
};



