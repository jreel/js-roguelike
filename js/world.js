/**
 * Created by jreel on 4/4/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

Game.World = function(depth) {
    this.depth = depth || Game.numLevels;
    this.levels = new Array(this.depth);     // contains Level objects, one per depth

    // generate map for each level
    // TODO: varied map types
    for (var z = 1; z <= this.depth; z++) {
        var rndlvl = this.randomLevel({meanWidth: 80, meanHeight: 40});
        this.levels[z] = new Game.Level({
                level: z,
                width: rndlvl.width,
                height: rndlvl.height
                //width: Game.screenWidth,        // comment out these two lines and uncomment
                //height: Game.screenHeight       // the above two, to restore pseudo-random map size
            });
        var map = this.levels[z].generateMap();
        this.levels[z].map = new Game.Map(map);
        this.levels[z].placeExits();
        this.levels[z].setupFov();
    }

    // we can also distribute random 'special' items throughout the world here
    // for now, we'll just add one of each weapon and armor randomly
    var itemTemplates = ['dagger', 'sword', 'staff', 'leathervest', 'chainmail', 'platearmor', 'spikyarmor'];
    for (var j = 0; j < itemTemplates.length; j++) {
        var specialItem = Game.ItemRepository.create(itemTemplates[j]);
        var randlevel = randomInt(1, this.depth);
        this.levels[randlevel].addItemAtRandomPosition(specialItem);
    }
};

Game.World.prototype.randomLevel = function(params) {
    params = params || {};
    // the defaults here should almost always result in a level size that
    // is larger than the game screen.
    // TODO: figure out a better algorithm for appropriate size now that user can resize the game screen
    var meanWidth = params['meanWidth'] || Game.screenWidth * 1.5;
    var meanHeight = params['meanHeight'] || Game.screenHeight * 1.5;

    var stdWidth = params['stdWidth'] || meanWidth / 9;         // equivalent to Game.screenWidth / 6
    var stdHeight = params['stdHeight'] || meanHeight / 9;      // if meanWidth is set via defaults

    var rndWidth = randomNormalInt(meanWidth, stdWidth);
    var rndHeight = randomNormalInt(meanHeight, stdHeight);

    // TODO: random map type as well?

    return {width: rndWidth, height: rndHeight};
};



