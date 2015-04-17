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
    windowWidth: 800,
    windowHeight: 600,
    screenWidth: 40,
    screenHeight: 30,
    msgScreenHeight: 10,
    numLevels: 10,

    // TODO: extra players, player creation routine
    thePlayer: null,
    theWorld: null,
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
                                        fontSize: 18,
                                        //fontFamily: "Segoe UI Symbol",
                                        forceSquareRatio: true,
                                        spacing: 1
                                        });

        this.displays.msg = new ROT.Display({
                                        width: this.screenWidth,
                                        height: this.msgScreenHeight,
                                        fontSize: 14,
                                        //fontFamily: "Segoe UI Symbol",
                                        forceSquareRatio: false
                                        });

        this.displays.help = new ROT.Display({
                                        width: this.screenWidth,
                                        height: 1,
                                        fontSize: 14,
                                        forceSquareRatio: false
                                        });

        this.displays.stats = new ROT.Display({
                                    width: this.screenWidth,
                                    height: 1,
                                    fontSize: 14,
                                    fontStyle: 'bold',
                                    forceSquareRatio: false
                                    });

        this.recalcDisplaySize();

        // Create a helper function for binding to an event
        // and making it send that event to the screen
        var game = this; // So that we don't lose this

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
        this.windowWidth = (window.innerWidth < 800) ? Math.floor(window.innerWidth * 0.90) : Math.floor((800 + window.innerWidth) / 2);
        this.windowHeight = (window.innerHeight < 600) ? Math.floor(window.innerHeight * 0.90) : Math.floor((600 + window.innerHeight) / 2);

        var availSize = this.displays.main.computeSize(this.windowWidth, this.windowHeight);  // returns [numCellsX, numCellsY]

        this.screenWidth = (availSize[0] % 2 === 0) ? availSize[0] : availSize[0] - 1;
        this.screenHeight = availSize[1] - this.msgScreenHeight;
        if (this.screenHeight % 2 !== 0) {
            this.screenHeight -= 1;
        }
        this.displays.main.setOptions({width: this.screenWidth, height: this.screenHeight});

        var availSizeM = this.displays.msg.computeSize(this.windowWidth, this.windowHeight);
        this.displays.msg.setOptions({width: availSizeM[0], height: this.msgScreenHeight});

        var availSizeH = this.displays.help.computeSize(this.windowWidth, this.windowHeight);
        this.displays.help.setOptions({width: availSizeH[0], height: 1});

        var availSizeS = this.displays.stats.computeSize(this.windowWidth, this.windowHeight);
        this.displays.stats.setOptions({ width: availSizeS[0], height: 1});

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
        /*
        if (typeof display === 'object') {
            if (display === this.displays.main) {
                display = 'main';
            } else if (display === this.displays.msg) {
                display = 'msg';
            }
        }
        */

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

window.onresize = function() {
    Game.recalcDisplaySize();
    Game.refresh();
};