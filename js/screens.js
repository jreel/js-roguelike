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
    player: null,           // TODO: party system
    gameOver: false,
    subScreen: null,        // TODO: move subScreens to separate display

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
        this.player = Game.thePlayer;
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
        // render subscreen instead if there is one
        if (this.subScreen) {
            this.subScreen.render(display);
            return;
        }
        var screenWidth = Game.screenWidth;
        var screenHeight = Game.screenHeight;

        var level = Game.currentLevel;

        var mapWidth = level.map.width;
        var mapHeight = level.map.height;

        var playerX = this.player.x;
        var playerY = this.player.y;

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
            this.player.sightRadius,
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
        var messages = this.player.messages;
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
        stats += String.format('HP: %s/%s ', this.player.hp, this.player.maxHP);
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
        // handle subscreen input if there is one
        if (this.subScreen) {
            this.subScreen.handleInput(inputType, inputData);
            return;
        }
        if (inputType === 'keydown') {
             var cmd = inputData.keyCode;
             // Movement
            if (cmd === ROT.VK_LEFT) {
                this.move(-1, 0);
            } else if (cmd === ROT.VK_RIGHT) {
                this.move(1, 0);
            } else if (cmd === ROT.VK_UP) {
                this.move(0, -1);
            } else if (cmd === ROT.VK_DOWN) {
                this.move(0, 1);
            } else if (cmd === ROT.VK_I || cmd === ROT.VK_D) {    // inventory or drop
                var inv = this.player.getInventory();
                if (inv.filter(function(x){return x;}).length === 0) {
                    // if player has no items, send a message and don't take a turn
                    Game.sendMessage(this.player, "You are not carrying anything.");
                    Game.refresh();
                } else {
                    if (cmd === ROT.VK_I) {
                        // show the inventory
                        Game.Screen.inventoryScreen.setup(this.player, this.player.getInventory());
                        this.setSubScreen(Game.Screen.inventoryScreen);
                    } else if (cmd === ROT.VK_D) {
                        // show the drop screen
                        Game.Screen.dropScreen.setup(this.player, this.player.getInventory());
                        this.setSubScreen(Game.Screen.dropScreen);
                    }
                }
                return;
            } else if (cmd === ROT.VK_SPACE) {
                this.activateTile();
            } else {
                // not a valid key
                return;
            }
            // Unlock the engine
            this.player.turnNumber++;
            Game.currentLevel.engine.unlock();
        }
    },

    move: function(dX, dY) {
        var newX = this.player.x + dX;
        var newY = this.player.y + dY;
        // Try to move to the new cell
        this.player.tryMove(newX, newY, Game.currentLevel);
    },

    activateTile: function() {
        // TODO: should this be moved to Level or Map?
        var x = this.player.x;
        var y = this.player.y;

        // check for items that player wants to pick up
        var items = Game.currentLevel.getItemsAt(x, y);
        if (items) {
            if (items.length === 1) {
                // if only one item, don't show a screen, just try to pick it up
                var item = items[0];
                if (this.player.pickupItems([0])) {
                    Game.sendMessage(this.player, "You pick up %s", item.nameA());
                } else {
                    Game.sendMessage(this.player, "Your inventory is full! Nothing was picked up.");
                }
            } else {
                // show the pickup screen if there are > 1 item
                Game.Screen.pickupScreen.setup(this.player, items);
                this.setSubScreen(Game.Screen.pickupScreen);
            }
        } else {
            // if no items, check for other functions

            // check for special tile
            var tile = Game.currentLevel.map.getTile(x, y);
            // switch case depending on tile
            if (tile === Game.Tile.prevLevelTile) {
                Game.currentLevel.changeLevel(-1);
            } else if (tile === Game.Tile.nextLevelTile) {
                Game.currentLevel.changeLevel(1);
            }
        }
    },

    setGameOver: function(gameLost) {
        // TODO: should this be moved to Game object?
        this.gameOver = gameLost;
    },

    setSubScreen: function(subScreen) {
        // TODO: move subscreens to separate display
        this.subScreen = subScreen;
        // refresh screen on changing the subscreen
        Game.refresh();
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

/*  Generalize the idea of a screen that presents a set of items and allows
    the user to select one or many depending on the scenario. This generalized
    screen will also take care of mapping input to the correct items. In order
    to create these item selection screens, we'll simply have to provide a
    caption (eg. "Your Inventory" or "What would you like to eat?", whether the
    screen should allow any item selection at all (eg, inventory wouldn't while
    picking up items would), and an action to execute if the player successfully
    selects item(s). Note that for screens that don't allow selection, hitting
    Enter or Esc will simply cancel and return to the playScreen, while for
    screens that do allow selection hitting Enter will execute the okFunction
    and then cost a turn if okFunction returns true.

    ItemListScreen will accept a template (similar to Creatures or Items) as
    a constructor. No pagination for now (limited to 22 items shown at once).
    In the screens where user can select multiple items, we want to show a '+'
    when an item is selected.
*/
Game.Screen.ItemListScreen = function(template) {
    // set up based on the template
    this.caption = template['caption'] || "Some Items";
    this.okFunction = template['ok'] || null;
    // whether the user can select items at all
    this.canSelect = template['canSelect'] || false;
    // whether the user can select multiple items
    this.canSelectMultiple = template['canSelectMultiple'] || false;
};
Game.Screen.ItemListScreen.prototype.setup = function(player, items) {
    this.player = player;
    // should be called before switching to the screen
    this.items = items;
    // clean set of selected indices
    this.selectedIndices = {};
};
Game.Screen.ItemListScreen.prototype.render = function(display) {
    var letters = 'abcdefghijklmnopqrstuvwxyz';
    // render the caption in the top row
    display.drawText(0, 0, this.caption);
    var row = 0;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i]) {
            // get the letter matching the item's index
            var letter = letters.substring(i, i + 1);
            // if we have selected an item, show a +, else show a dash
            // between the letter and the item's name
            var selectionState = (this.canSelect && this.canSelectMultiple &&
                this.selectedIndices[i]) ? '+' : '-';
            // render at the correct row and add 2.
            // for some reason, stringing this all together into a single drawText argument results in
            // mis-aligned text in the display.
            display.draw(0, 2 + row, letter);
            display.draw(2, 2 + row, selectionState);
            display.draw(4, 2 + row, this.items[i].character, this.items[i].foreground, this.items[i].background);
            display.drawText(6, 2 + row, this.items[i].nameA());
            row++;
        }
    }
};
Game.Screen.ItemListScreen.prototype.executeOkFunction = function() {
    // gather the selected items
    var selectedItems = {};
    for (var key in this.selectedIndices) {
        if (this.selectedIndices.hasOwnProperty(key)) {
            selectedItems[key] = this.items[key];
        }
    }
    // switch back to the play screen
    // TODO: separate display
    Game.Screen.playScreen.setSubScreen(undefined);
    // call the OK function and end the player's turn if it returned true
    if (this.okFunction(selectedItems)) {
        this.player.level.engine.unlock();
    }
};
Game.Screen.ItemListScreen.prototype.handleInput = function(inputType, inputData) {
    // TODO: mouse input
    if (inputType === 'keydown') {
        // if the user hit escape, hit enter and can't select an item, or hit
        // enter without any items selected, simply cancel out
        if (inputData.keyCode === ROT.VK_ESCAPE ||
            (inputData.keyCode === ROT.VK_RETURN &&
             (!this.canSelect || Object.keys(this.selectedIndices).length === 0))) {
            // TODO: separate display
            Game.Screen.playScreen.setSubScreen(undefined);
        } else if (inputData.keyCode === ROT.VK_RETURN) {
            // handle pressing return when items are selected
            this.executeOkFunction();
        } else if (this.canSelect && inputData.keyCode >= ROT.VK_A &&
            inputData.keyCode <= ROT.VK_Z) {
            // handle pressing a letter if we can select an item
            // check if it maps to a valid item by subtracting 'a' from
            // the keyCode to know what letter of the alphabet was pressed
            var index = inputData.keyCode - ROT.VK_A;
            if (this.items[index]) {
                // if multiple selection is allowed, toggle the selected status
                // else select the item and exit screen
                if (this.canSelectMultiple) {
                    if (this.selectedIndices[index]) {
                        delete this.selectedIndices[index];
                    } else {
                        this.selectedIndices[index] =  true;
                    }
                    // redraw screen
                    Game.refresh();
                } else {
                    this.selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }
    }
};

/* define screens based on ItemListScreen */
Game.Screen.inventoryScreen = new Game.Screen.ItemListScreen({
    caption: 'Your Inventory:',
    canSelect: false
});

Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
    caption: 'Select Items to Pick Up:',
    canSelect: true,
    canSelectMultiple: true,
    ok: function(selectedItems) {
        // try to pick up all items, messaging the player if they
        // couldn't all be picked up
        if (!this.player.pickupItems(Object.keys(selectedItems))) {
            Game.sendMessage(this.player, "Your inventory is full! Not all items were picked up.");
        }
        return true;
    }
});

Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
    caption: 'Select Item to Drop:',
    canSelect: true,
    canSelectMultiple: false,           // should this be true:
    ok: function(selectedItems) {
        // drop the selected item
        this.player.dropItem(Object.keys(selectedItems)[0]);
        return true;
    }
});