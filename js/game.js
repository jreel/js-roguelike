/**
 * Created by jreel on 3/27/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */


var Game = {
    version: "2016.04.05-01",

    // DONE?: add extra displays
    // TODO: more displays for party/status - still a long way off
    displays: {
        title: null,
        main: null,
        msg: null,
        help: null,
        stats: null
    },
    currentScreens: {
        title: null,
        main: null,
        msg: null,
        help: null,
        stats: null
    },

    // dimensions of output areas
    /*
        As of March 2016, the most common screen resolutions are
        1366x768, 1920x1080, and 1280x800 (in that order).

        We'll set our initial windowWidth/Height to the smallest
        values for each: 1280x768. (it will be adjusted later)
     */
    windowWidth: 1280,           // pixels
    windowHeight: 768,          // pixels
    playDivWidth: 800,
    statsDivWidth: 480,
    playDivHeight: 0,

    /*
     +-------------------------------+
     |   title   (press H for help)  |
     +--------------------+----------+
     |                    |  stats   |
     |     game play      |          |
     |       (map)        | commands |
     |      screen        |          |
     |                    |          |
     |                    |          |
     +--------------------+----------+
     |   game messages               |
     |                               |
     |                               |
     +-------------------------------+
     */
    playScreenWidth: 60,            // characters
    playScreenHeight: 40,           // characters

    statsScreenWidth: 20,           // minimum acceptable width
    statsScreenHeight: 40,

    msgScreenWidth: 80,
    msgScreenHeight: 10,

    helpScreenWidth: 80,
    helpScreenHeight: 1,

    titleScreenWidth: 80,
    titleScreenHeight: 50,


    // TODO: extra players, player creation routine
    player: null,
    currentWorld: null,
    worlds: [],
    gameOver: false,

    Templates: {
        Monsters: null,
        Items: null,
        Biomes: null
    },

    init: function() {


        this.calcInitDisplaySize();


        // Create a helper function for binding to an event
        // and making it send that event to the screen
        var game = this;
        var bindEventToScreen = function(event) {
            window.addEventListener(event, function(e) {
                // When an event is received, send it to the screen
                // (if there is one)
                if (game.currentScreens.main !== null) {
                    // Send the event type and data to the screen
                    game.currentScreens.main.handleInput(event, e);
                }
                else if (game.currentScreens.title !== null) {
                    game.currentScreens.title.handleInput(event, e);
                }
                e.stopPropagation();
            });
        };
        // Bind keyboard input events
        // TODO: mouse input
        bindEventToScreen('keydown');
        //  bindEventToScreen('keyup');
        // bindEventToScreen('keypress');
    },

    calcInitDisplaySize: function() {

        // find the right pixel height of play area and stats area displays
        var availSize, playWidth, playHeight;

        // get a window width/height that is 800x600 (or whatever we've defined as windowWidth/Height,
        // or 90% of what's available (if < windowWidth x windowHeight).
        this.windowWidth =
            (window.innerWidth < this.windowWidth) ? Math.floor(window.innerWidth * 0.90) : this.windowWidth;
        this.windowHeight =
            (window.innerHeight < this.windowHeight) ? Math.floor(window.innerHeight * 0.90) : this.windowHeight;

        // set the available playarea div and statsarea div sizes in pixels, based on window size
        this.statsDivWidth = Math.floor(this.windowWidth * (1 / 3));
        this.playDivWidth = this.windowWidth - this.statsDivWidth;

        // set options for the displays
        this.displays.main = new ROT.Display({
                fontSize: 14,
                //fontFamily: "'Cambria', 'Segoe UI Symbol', 'symbola', 'monospace'",
                forceSquareRatio: true,
                spacing: 1
            }
        );

        this.displays.msg = new ROT.Display({
                fontSize: 14,
                //fontFamily: "'Cambria', 'Segoe UI Symbol', 'symbola', 'monospace'",
                forceSquareRatio: false
            }
        );

        this.displays.help = new ROT.Display({
                fontSize: 14,
                //fontFamily: "'Cambria', 'Segoe UI Symbol', 'symbola', 'monospace'",
                forceSquareRatio: false
            }
        );

        this.displays.stats = new ROT.Display({
                fontSize: 14,
                //fontFamily: "'Cambria', 'Segoe UI Symbol', 'symbola', 'monospace'",
                //fontStyle: 'bold',
                forceSquareRatio: false
            }
        );

        this.displays.title = new ROT.Display({
                fontSize: 14,
                //fontFamily: "'Cambria', 'Segoe UI Symbol', 'symbola', 'monospace'",
                forceSquareRatio: false,
                spacing: 1
            }
        );

        // calculate initial display sizes based on above options

        // calculate character size of main display area based on playarea width and full window height
        availSize = this.displays.main.computeSize(this.playDivWidth, this.windowHeight);  // returns [numCellsX, numCellsY]

        // playscreen must be even dimensions on width and height
        playHeight = availSize[1] - this.msgScreenHeight - this.helpScreenHeight;
        if (playHeight % 2 !== 0) {
            playHeight -= 1;
        }
        playWidth = availSize[0];
        if (playWidth % 2 !== 0) {
            playWidth -= 1;
        }

        this.playScreenWidth = playWidth;
        this.playScreenHeight = playHeight;
        this.displays.main.setOptions({ width: this.playScreenWidth, height: this.playScreenHeight });

        // unfortunately, we have to do this separately for each display, since they may all be using
        // slightly different font sizes/options and therefore have different available grid sizes

        // stats display: using previously calculated pixel width
        availSize = this.displays.stats.computeSize(this.statsDivWidth, this.windowHeight);
        this.statsScreenWidth = availSize[0];
        this.statsScreenHeight =
            Math.min((availSize[1] - this.msgScreenHeight - this.helpScreenHeight), this.playScreenHeight);
        this.displays.stats.setOptions({ width: this.statsScreenWidth, height: this.statsScreenHeight });

        // message display is easy, it's the full width and a pre-defined character height
        availSize = this.displays.msg.computeSize(this.windowWidth, this.windowHeight);
        this.msgScreenWidth = availSize[0];
        this.displays.msg.setOptions({ width: this.msgScreenWidth, height: this.msgScreenHeight });

        // the help display line is even easier: full width, height of 1
        availSize = this.displays.help.computeSize(this.windowWidth, this.windowHeight);
        this.helpScreenWidth = availSize[0];
        this.displays.help.setOptions({ width: this.helpScreenWidth, height: 1 });

        // title screen: full width, full height
        availSize = this.displays.title.computeSize(this.windowWidth, this.windowHeight);
        this.titleScreenWidth = availSize[0];
        this.titleScreenHeight = availSize[1];
        this.displays.title.setOptions({ width: this.titleScreenWidth, height: this.titleScreenHeight });

    },

    recalcDisplaySize: function() {
        // called in Game.init and in window.onresize
        if (!this.displays.main || this.displays.main === null) {
            return;
        }

        var availSize, playWidth, playHeight;

        // calculate character size of main display area based on playarea width and playarea height
        availSize = this.displays.main.computeSize(this.playDivWidth, this.playDivHeight);  // returns [numCellsX, numCellsY]

        // playscreen must be even dimensions on width and height
        playHeight = availSize[1];
        if (playHeight % 2 !== 0) {
            playHeight -= 1;
        }
        playWidth = availSize[0];
        if (playWidth % 2 !== 0) {
            playWidth -= 1;
        }

        // only change display if it needs changing
        if (playWidth === this.playScreenWidth && playHeight === this.playScreenHeight) {
            return false;
        }

        this.playScreenWidth = playWidth;
        this.playScreenHeight = playHeight;
        this.displays.main.setOptions({width: this.playScreenWidth, height: this.playScreenHeight});

        // none of the other displays should be changing after the initial setting

        return true;
    },

    refresh: function() {
        var displays = Object.keys(this.displays);
        for (var d = 0; d < displays.length; d++) {
            var dispkey = displays[d];
            if (this.displays[dispkey] !== null) {
                this.displays[dispkey].clear();
            }
            if (this.currentScreens[dispkey] !== null) {
                this.currentScreens[dispkey].render(this.displays[dispkey]);
            }
        }

        // DONE: additional displays
    },

    switchScreen: function(screen, display) {
        // DONE?: support for additional display areas
        if (!display) {
            display = 'main';
        }

        // If we had a screen before, notify it that we exited
        if (this.currentScreens[display] !== null) {
            this.currentScreens[display].exit();
        }
        // Clear the display
        this.displays[display].clear();
        // Update the current screen, notify it we entered
        // and then render it
        this.currentScreens[display] = screen;
        if (!this.currentScreens[display] !== null) {
            this.currentScreens[display].enter(this.displays[display]);
            this.refresh();
        }
    },


    setGameOver: function(gameLost) {
        this.gameOver = gameLost;
    },

    startNewGame: function() {
        // generate the player and a starting world
        // TODO: player generation, party system
        this.player = new Game.Player(Game.HeroTemplates.default);

        // TODO: starting script
        var world = new Game.World();
        world.worldId = Game.worlds.length;
        Game.worlds.push(world);
        Game.currentWorld = world;

        // pick a new area in the world to start in
        var startingLocation = world.getRandomLandLocation();
        var newArea = world.generateWorldArea(startingLocation.x,
                                              startingLocation.y,
                                              { biome: startingLocation.biome,
                                                dungeonChance: 100,
                                                dungeonDepth: 1 });

        var startingArea = newArea.dungeon.levels[newArea.dungeonDepth];
        world.currentArea = startingArea;

        // add player to world
        var playerStartRoom = startingArea.rooms[startingArea.rooms.length - 1]
        var playerStartX = (playerStartRoom.xStart + playerStartRoom.xEnd) >> 1;
        var playerStartY = (playerStartRoom.yStart + playerStartRoom.yEnd) >> 1;
        this.player.setLocation(playerStartX, playerStartY, startingArea);

        // Start the current area engine
        startingArea.engine.start();

    }
};


window.onload = function() {
    // Check if rot.js is supported on this browser
    if (ROT.isSupported()) {
        // Initialize the game
        Game.init();

        //document.write("<p>" + Game.logo + "</p>");

        // Add the containers to the HTML page
        var helpdiv = document.getElementById("helpDiv");
        var playdiv = document.getElementById("playDiv");
        var statsdiv = document.getElementById("statsDiv");
        var msgdiv = document.getElementById("msgDiv");
        var inputdiv = document.getElementById("inputDiv");
        var titlediv = document.getElementById("titleDiv");

        helpdiv.appendChild(Game.displays.help.getContainer());
        playdiv.appendChild(Game.displays.main.getContainer());
        statsdiv.appendChild(Game.displays.stats.getContainer());
        msgdiv.appendChild(Game.displays.msg.getContainer());
        titlediv.appendChild(Game.displays.title.getContainer());

        // TODO: additional displays


        // after displays are appended to the DOM, we should have a good idea of
        // the correct pixel height of the play area (accounting for help and message displays)
        Game.playDivHeight = document.getElementById("playDiv").offsetHeight;
        // this will be stored and used anytime the play area display size is recalculated
        // we also need to recalculate the stats area height, since we shouldn't be changing it later

        var availSize = Game.displays.stats.computeSize(Game.statsDivWidth, Game.playDivHeight);
        Game.statsScreenWidth = availSize[0];
        Game.statsScreenHeight = availSize[1];
        Game.displays.stats.setOptions({ width: Game.statsScreenWidth, height: Game.statsScreenHeight });


        // Load the start screen
        Game.switchScreen(Game.Screen.startScreen, 'title');

        // hide everything but the title screen at the start.
        helpdiv.style.display = "none";
        playdiv.style.display = "none";
        statsdiv.style.display = "none";
        msgdiv.style.display = "none";
        inputdiv.style.display = "none";

        titlediv.style.display = "block";
        titlediv.style.position = "fixed";
        titlediv.style.left = "0";
        titlediv.style.top = "0";


    } else {
        alert("The rot.js library isn't supported by your browser.");
    }
};


/*
window.onresize = function() {
    Game.recalcDisplaySize();
    Game.refresh();
};
*/