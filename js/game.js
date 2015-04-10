/**
 * Created by jreel on 3/27/2015.
 * Thanks to the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */


var Game = {
    // TODO: add extra displays
    display: null,
    currentScreen: null,
    screenWidth: 50,       // this should be an EVEN number
    screenHeight: 30,      // this should also be an EVEN number
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
        this.display = new ROT.Display({width: this.screenWidth,
                                         height: this.screenHeight + 1});

        // Create a helper function for binding to an event
        // and making it send that event to the screen
        var game = this; // So that we don't lose this

        var bindEventToScreen = function(event) {
            window.addEventListener(event, function(e) {
                // When an event is received, send it to the screen
                // (if there is one)
                if (game.currentScreen !== null) {
                    // Send the event type and data to the screen
                    game.currentScreen.handleInput(event, e);
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
        // Clear the screen
        this.display.clear();
        // Render the screen
        this.currentScreen.render(this.display);
        // TODO: additional displays
    },

    switchScreen: function(screen) {
        // TODO: support for additional display areas
        // If we had a screen before, notify it that we exited
        if (this.currentScreen !== null) {
            this.currentScreen.exit();
        }
        // Clear the display
        this.display.clear();
        // Update the current screen, notify it we entered
        // and then render it
        this.currentScreen = screen;
        if (!this.currentScreen !== null) {
            this.currentScreen.enter();
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
        document.body.appendChild(Game.display.getContainer());

        // TODO: additional displays
        // Load the start screen
        Game.switchScreen(Game.Screen.startScreen);
    } else {
        alert("The rot.js library isn't supported by your browser.");
    }
};