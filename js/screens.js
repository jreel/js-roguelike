/**
 * Created by jreel on 3/27/2015.
 * Thanks to the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// TODO: additional displays
Game.Screen = {};

// Define our initial start screen
Game.Screen.startScreen = {
    enter: function() {
        // console.log("Entered start screen.");
    },
    exit: function() {
        // console.log("Exited start screen.");
    },
    render: function(display) {
        // Render our prompt to the screen
        // TODO: change to something more aesthetic
        display.drawText(1, 1, "%c{yellow}Javascript Roguelike");
        display.drawText(1, 2, "Press [Enter] to start!");
    },
    handleInput: function(inputType, inputData) {
        // When [Enter] is pressed, go to the play screen
        // TODO: mouse input
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.playScreen);
            }
        }
    }
};

// Define our playing screen
Game.Screen.playScreen = {
    gameOver: false,

    enter: function() {
        // console.log("Entered play screen.");

        // if we are entering from the lose screen, be sure to reset
        // the gameOver flag
        if (this.gameOver) {
            this.gameOver = false;
        }

        // generate player and world
        // TODO: player generation, party system
        Game.thePlayer = new Game.Player(Game.HeroTemplates.default);
        Game.theWorld = new Game.World(Game.numLevels);

        // set and populate the current level
        Game.currentLevel = Game.theWorld.levels[1];
        Game.currentLevel.populateMap();    // population = random normal based on map size
        Game.thePlayer.level = Game.currentLevel;

        // Start the current level engine
        Game.currentLevel.engine.start();
        /*
        if (Game.currentLevel.engine._lock > 0) {
            Game.currentLevel.engine.unlock();
        }
        */
    },

    exit: function() {
        // console.log("Exited play screen.");
    },

    render: function(display) {
        var screenWidth = Game.screenWidth;
        var screenHeight = Game.screenHeight;

        var level = Game.currentLevel;

        var mapWidth = level.map.width;
        var mapHeight = level.map.height;

        var playerX = Game.thePlayer.x;
        var playerY = Game.thePlayer.y;

        // Make sure the x-axis doesn't go to the left of the left bound
        var topLeftX = Math.max(0, playerX - (screenWidth / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftX = Math.min(topLeftX, mapWidth - screenWidth);

        // Make sure the y-axis doesn't go above the top bound
        var topLeftY = Math.max(0, playerY - (screenHeight / 2));
        // Make sure we still have enough space to fit an entire game screen
        topLeftY = Math.min(topLeftY, mapHeight - screenHeight);

        // Find all visible map cells based on FOV or previous visit
        // TODO: different FOV for different map types
        var visibleCells = {};
        var map = level.map;
        level.fov.compute(
            playerX, playerY,
            Game.thePlayer.sightRadius,
            function(x, y, radius, visibility) {
                visibleCells[x + "," + y] = true;
                // mark cell as explored
                map.setExplored(x, y, true);
            }
        );

        // Render visible and explored map cells
        for (var x = topLeftX; x < topLeftX + screenWidth; x++) {
            for (var y = topLeftY; y < topLeftY + screenHeight; y++) {
                if (map.isExplored(x, y)) {
                    // fetch the glyph for the tile and render it
                    // to the screen at the offset position
                    var glyph, fg, bg;
                    // if we are at a cell within the fov, check if
                    // there are visible items or entities
                    if (visibleCells[x + ',' + y]) {
                        // check for entities first, since they should
                        // be drawn on top of items
                        // TODO: refactor based on proper stacking order for future tile graphics
                        if (level.getEntityAt(x, y)) {
                            glyph = level.getEntityAt(x, y);
                        } else if (level.getItemsAt(x, y)) {
                            // if we have items, render the topmost one
                            var items = level.getItemsAt(x, y);
                            glyph = items[items.length - 1];
                        } else {
                            glyph = map.getTile(x, y);
                        }
                        fg = glyph.foreground;
                        bg = glyph.background;
                    } else {
                        // tile was previously explored but is not currently
                        // within the fov; render it darker
                        // TODO: colors/params based on map type
                        glyph = map.getTile(x, y);
                        fg = glyph.darken().foreground;
                        bg = glyph.darken().background;
                    }
                    display.draw(
                        x - topLeftX,
                        y - topLeftY,
                        glyph.character,
                        fg,
                        bg);
                }
            }
        }

        // Get the messages in the queue and render them
        // TODO: separate display area for messages
        var messages = Game.thePlayer.messages;
        var messageOut = 0;
        for (var m = 0; m < messages.length; m++) {
            // draw each message, adding the number of lines
            messageOut += display.drawText(
                0,
                messageOut,
                '%c{white}%b{black}' + messages[m]
            );
        }

        // Render player HP
        // TODO: separate display area for player stats
        var stats = '%c{white}%b{black}';
        stats += String.format('HP: %s/%s ', Game.thePlayer.hp, Game.thePlayer.maxHP);
        display.drawText(0, screenHeight, stats);
    },

    handleInput: function(inputType, inputData) {
        // TODO: mouse input
        // if the game is over, player can press Enter to go to the losing screen.
        if (this.gameOver) {
            if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.loseScreen);
                if (Game.currentLevel.engine._lock > 0) {
                    Game.currentLevel.engine.unlock();
                }
            }
            return;
        }
        if (inputType === 'keydown') {
             // Movement
            if (inputData.keyCode === ROT.VK_LEFT) {
                this.move(-1, 0);
            } else if (inputData.keyCode === ROT.VK_RIGHT) {
                this.move(1, 0);
            } else if (inputData.keyCode === ROT.VK_UP) {
                this.move(0, -1);
            } else if (inputData.keyCode === ROT.VK_DOWN) {
                this.move(0, 1);
            } else if (inputData.keyCode === ROT.VK_SPACE) {
                this.handleSpecialTile();
            } else {
                // not a valid key
                return;
            }
            // Unlock the engine
            Game.thePlayer.turnNumber++;
            Game.currentLevel.engine.unlock();
        }
    },

    move: function(dX, dY) {
        var newX = Game.thePlayer.x + dX;
        var newY = Game.thePlayer.y + dY;
        // Try to move to the new cell
        Game.thePlayer.tryMove(newX, newY, Game.currentLevel);
    },

    handleSpecialTile: function() {
        // TODO: should this be moved to Level or Map?
        // get tile type that the player is on
        var x = Game.thePlayer.x;
        var y = Game.thePlayer.y;
        var tile = Game.currentLevel.map.getTile(x, y);
        // switch case depending on tile
        if (tile === Game.Tile.prevLevelTile) {
            Game.currentLevel.changeLevel(-1);
        } else if (tile === Game.Tile.nextLevelTile) {
            Game.currentLevel.changeLevel(1);
        }
    },

    setGameOver: function(gameLost) {
        // TODO: should this be moved to Game object?
        this.gameOver = gameLost;
    }

};

// Define our winning screen
// TODO: define and implement actual win conditions
Game.Screen.winScreen = {
    enter: function() {
        // console.log("Entered win screen.");
    },
    exit: function() {
        // console.log("Exited win screen.");
    },
    render: function(display) {
        // Render our prompt to the screen
        for (var i = 0; i < 22; i++) {
            // Generate random background colors
            var r = Math.round(Math.random() * 255);
            var b = Math.round(Math.random() * 255);
            var g = Math.round(Math.random() * 255);
            var background = ROT.Color.toRGB([r, g, b]);
            display.drawText(2, i + 1, "%b{" + background + "}You win!");
        }
    },
    handleInput: function(inputType, inputData) {
        // Not much to do here
    }
};

// Define the losing screen
Game.Screen.loseScreen = {
    enter: function() {
        // console.log("Entered lose screen.");
    },
    exit: function() {
        // console.log("Exited lose screen.");
    },
    render: function(display) {
        // TODO: make this more aesthetic, maybe add more stats
        for (var i = 0; i < 20; i++) {
            display.drawText(2, i + 1, "%b{red}You lose! :(");
        }
        display.drawText(2, Game.screenHeight - 2, "Turns Taken: " + Game.thePlayer.turnNumber);
        display.drawText(2, Game.screenHeight - 1, "Furthest Level Reached: " + Game.thePlayer.furthestLevel);
        display.drawText(2, Game.screenHeight, "Press [Enter] to go back to the start screen if you want to try again!");
    },
    handleInput: function(inputType, inputData) {
        // TODO: mouse input
        if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
            Game.switchScreen(Game.Screen.startScreen);
        }
    }
};
