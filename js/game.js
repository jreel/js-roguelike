/**
 * Created by jreel on 3/27/2015.
 * Thanks to the "Building a Roguelike in Javascript" tutorial by Dominic
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
        msg: null
    },
    currentScreens: {
        main: null,
        msg: null
    },
    screenWidth: 50,       // this should be an EVEN number
    screenHeight: 30,      // this should also be an EVEN number
    msgScreenHeight: 10,
    numLevels: 10,

    // TODO: extra players, player creation routine
    thePlayer: null,
    theWorld: null,

    Templates: {
        Monsters: null,
        Items: null,
        Biomes: null
    },

    init: function() {
        // Any necessary initialization will go here.
        this.displays.main = new ROT.Display({width: this.screenWidth,
                                        height: this.screenHeight + 1,
                                        fontSize: 18,
                                        //fontFamily: "Segoe UI Symbol",
                                        forceSquareRatio: true});
        this.displays.msg = new ROT.Display({width: this.screenWidth,
                                        height: this.msgScreenHeight,
                                        fontSize: 16,
                                        //fontFamily: "Segoe UI Symbol",
                                        forceSquareRatio: false });

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
            });
        };
        // Bind keyboard input events
        // TODO: mouse input
        bindEventToScreen('keydown');
        //  bindEventToScreen('keyup');
        // bindEventToScreen('keypress');
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
            this.currentScreens[display].enter();
            this.refresh();
        }
    }
};


window.onload = function() {
    // Check if rot.js is supported on this browser
    if (ROT.isSupported()) {
        // Initialize the game
        Game.init();

        // Add the container to the HTML page
        document.body.appendChild(Game.displays.main.getContainer());
        document.body.appendChild(document.createElement("br"));
        document.body.appendChild(Game.displays.msg.getContainer());

        // TODO: additional displays
        Game.switchScreen(Game.Screen.messageScreen, 'msg');
        // Load the start screen
        Game.switchScreen(Game.Screen.startScreen, 'main');
    } else {
        alert("The rot.js library isn't supported by your browser.");
    }
};