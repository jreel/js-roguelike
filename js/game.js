/**
 * Created by jreel on 3/27/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */


var Game = {
    // DONE?: add extra displays
    // TODO: more displays for party/status - still a long way off
    displays: {
        main: null,
        msg: null,
        help: null,
        stats: null
    },
    currentScreens: {
        main: null,
        msg: null,
        help: null,
        stats: null
    },
    windowWidth: 800,           // pixels
    windowHeight: 600,          // pixels
    screenWidth: 40,            // characters
    screenHeight: 24,           // characters
    msgScreenHeight: 10,        // characters

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
        // Any necessary initialization will go here.

        this.displays.main = new ROT.Display({
                                        width: this.screenWidth,
                                        height: this.screenHeight,
                                        fontSize: 14,
                                        //fontFamily: "'Cambria', 'Segoe UI Symbol', 'symbola', 'monospace'",
                                        forceSquareRatio: true,
                                        spacing: 1
                                        });

        this.displays.msg = new ROT.Display({
                                        width: this.screenWidth,
                                        height: this.msgScreenHeight,
                                        fontSize: 14,
                                        //fontFamily: "'Cambria', 'Segoe UI Symbol', 'symbola', 'monospace'",
                                        forceSquareRatio: false
                                        });

        this.displays.help = new ROT.Display({
                                        width: this.screenWidth,
                                        height: 1,
                                        fontSize: 14,
                                        //fontFamily: "'Cambria', 'Segoe UI Symbol', 'symbola', 'monospace'",
                                        forceSquareRatio: false
                                        });

        this.displays.stats = new ROT.Display({
                                    width: this.screenWidth,
                                    height: 1,
                                    fontSize: 14,
                                    //fontFamily: "'Cambria', 'Segoe UI Symbol', 'symbola', 'monospace'",
                                    fontStyle: 'bold',
                                    forceSquareRatio: false
                                    });

        this.recalcDisplaySize();

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
                e.stopPropagation();
            });
        };
        // Bind keyboard input events
        // TODO: mouse input
        bindEventToScreen('keydown');
        //  bindEventToScreen('keyup');
        // bindEventToScreen('keypress');
    },

    recalcDisplaySize: function() {
        // called in Game.init and in window.onresize
        if (!this.displays.main || this.displays.main === null) {
            return;
        }

        var availSize, availWidth, availHeight;

        // get a window width/height that is 800x600 (or whatever we've defined as windowWidth/Height,
        // or 90% of what's available (if < windowWidth x windowHeight).
        this.windowWidth = (window.innerWidth < this.windowWidth) ? Math.floor(window.innerWidth * 0.90) : this.windowWidth;
        this.windowHeight = (window.innerHeight < this.windowHeight) ? Math.floor(window.innerHeight * 0.90) : this.windowHeight;

        availSize = this.displays.main.computeSize(this.windowWidth, this.windowHeight);  // returns [numCellsX, numCellsY]

        // make sure width/height are even
        availWidth = (availSize[0] % 2 === 0) ? availSize[0] : availSize[0] - 1;
        availHeight = availSize[1] - this.msgScreenHeight;
        if (availHeight % 2 !== 0) {
            availHeight -= 1;
        }

        // only change display if it needs changing
        if (availWidth === this.screenWidth && availHeight === this.screenHeight) {
            return false;
        }

        this.screenWidth = availWidth;
        this.screenHeight = availHeight;
        this.displays.main.setOptions({width: this.screenWidth, height: this.screenHeight});

        // unfortunately, we have to do this separately for each display, since they may all be using
        // slightly different font sizes/options and therefore have different available sizes
        availSize = this.displays.msg.computeSize(this.windowWidth, this.windowHeight);
        this.displays.msg.setOptions({width: availSize[0], height: this.msgScreenHeight});

        availSize = this.displays.help.computeSize(this.windowWidth, this.windowHeight);
        this.displays.help.setOptions({width: availSize[0], height: 1});

        availSize = this.displays.stats.computeSize(this.windowWidth, this.windowHeight);
        this.displays.stats.setOptions({ width: availSize[0], height: 1});

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
        document.body.appendChild(Game.displays.help.getContainer());
        document.body.appendChild(document.createElement("br"));
        document.body.appendChild(Game.displays.stats.getContainer());
        document.body.appendChild(document.createElement("br"));
        document.body.appendChild(Game.displays.main.getContainer());
        document.body.appendChild(document.createElement("br"));
        document.body.appendChild(Game.displays.msg.getContainer());

        // TODO: additional displays
        Game.switchScreen(Game.Screen.helpLine, 'help');
        Game.switchScreen(Game.Screen.statsLine, 'stats');
        Game.switchScreen(Game.Screen.messageScreen, 'msg');
        // Load the start screen
        Game.switchScreen(Game.Screen.startScreen, 'main');
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