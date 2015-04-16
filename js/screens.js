/**
 * Created by jreel on 3/27/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// DONE?: additional displays
// TODO: status screens for party, etc. - still a long way off
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
        // DONE?: change to something more aesthetic

        var logoSize = ROT.Text.measure(Game.logo);

        display.setOptions({
            width: logoSize.width + 2,
            height: logoSize.height + 10,
            fontSize: 14,
            //fontFamily: "Segoe UI Symbol",
            forceSquareRatio: false,
            spacing: 1
        });

        var row = 1;
        var col = 1;
        for (var i = 0; i < Game.logo.length; i++) {
            if (Game.logo.charAt(i) == '\n') {
                row++;
                col = 1;
            } else {
                display.draw(col, row, Game.logo.charAt(i));
                col++;
            }
        }
        var introtext = ["%c{#8ff}A Javascript Roguelike", "", "%c{#888}(currently in pre-alpha development -", "%c{#888}there's not really a \"Tower\" yet!)", "", "%c{#ff8}Press [Enter] to start."];
        for (t = 0; t < introtext.length; t++) {
            var textSize = ROT.Text.measure(introtext[t]);
            var centerStart = (logoSize.width - textSize.width) / 2;
            display.drawText(centerStart, logoSize.height + 3 + t, introtext[t]);
        }

    },
    handleInput: function(inputType, inputData) {
        // When [Enter] is pressed, go to the play screen
        // TODO: mouse input
        if (inputType === 'keydown') {
            if (inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.playScreen, 'main');
            }
        }
    }
};

// Define our playing screen
Game.Screen.playScreen = {
    player: null,           // TODO: party system
    gameOver: false,
    subScreen: null,        // TODO: move subScreens to separate display

    enter: function(display) {
        // console.log("Entered play screen.");

        // if we are entering from the lose screen, be sure to reset
        // the gameOver flag
        if (this.gameOver) {
            this.gameOver = false;
        }

        display.setOptions({
            width: Game.screenWidth,
            height: Game.screenHeight + 1,
            fontSize: 18,
            //fontFamily: "Segoe UI Symbol",
            forceSquareRatio: true,
            spacing: 1
        });

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

        // re-set in case we just exited a subscreen
        display.setOptions({
            width: Game.screenWidth,
            fontSize: 18,
            //fontFamily: "Segoe UI Symbol",
            forceSquareRatio: true
        });

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

    },

    handleInput: function(inputType, inputData) {
        // TODO: mouse input
        // if the game is over, player can press Enter to go to the losing screen.
        if (this.gameOver) {
            if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
                Game.switchScreen(Game.Screen.loseScreen, 'main');
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
            } else if (cmd === ROT.VK_I) {          // inventory screen
                if (Game.Screen.inventoryScreen.setup(this.player, this.player.getInventory())) {
                    this.setSubScreen(Game.Screen.inventoryScreen);
                } else {
                    Game.sendMessage('warning', this.player, "You are not carrying anything.");
                    Game.refresh();
                }
                return;
            } else if (cmd === ROT.VK_D) {          // drop screen
                if (Game.Screen.dropScreen.setup(this.player, this.player.getInventory())) {
                    this.setSubScreen(Game.Screen.dropScreen);
                } else {
                    Game.sendMessage('warning', this.player, "You have nothing to drop.");
                    Game.refresh();
                }
                return;
            } else if (cmd === ROT.VK_E) {      // eat screen
                if (Game.Screen.eatScreen.setup(this.player, this.player.getInventory())) {
                    this.setSubScreen(Game.Screen.eatScreen);
                } else {
                    Game.sendMessage('warning', this.player, "You do not have any food.");
                    Game.refresh();
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
                    Game.sendMessage('default', this.player, "You pick up %s", item.describeA() + ".");
                } else {
                    Game.sendMessage('warning', this.player, "Your inventory is full! Nothing was picked up.");
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

Game.Screen.statsLine = {
    enter: function() {

    },
    exit: function() {

    },
    render: function(display) {
        if (!Game.thePlayer || Game.thePlayer === null) {
            return;
        }
        var hpLabel = '%c{white}%b{black}HP: ';
        var hpState = Game.thePlayer.getHpState();
        display.drawText(0, 0, hpLabel + hpState);

        // show current hunger state
        var hungerState = Game.thePlayer.getHungerState();
        var textLength = stripTokens(hungerState).length;
        var screenWidth = display.getOptions().width;
        display.drawText(screenWidth - textLength, 0, hungerState);
    },
    handleInput: function(inputType, inputData) {

    }
};

Game.Screen.helpLine = {
    enter: function() {

    },
    exit: function() {

    },
    render: function(display) {
        if (!Game.thePlayer || Game.thePlayer === null) {
            return;
        }
        display.drawText(0, 0, "%c{#fff}%b{#000}[⇦⇧⇩⇨] move/attack, [Space] pick up, [I] inventory, [D] drop, [E] eat");
    },
    handleInput: function(inputType, inputData) {

    }
};

Game.Screen.messageScreen = {
    enter: function() {

    },
    exit: function() {

    },
    render: function(display) {
        // Get the messages in the queue and render them
        if (!Game.thePlayer || (Game.thePlayer === null)) {
            return;
        }

        var messages = Game.thePlayer.messages;
        var messageOut = 0;
        for (var m = 0; m < messages.length; m++) {
            // draw each message, adding the number of lines
            messageOut += display.drawText(
                0,
                messageOut,
                '%c{#fff}%b{#000}' + messages[m]
            );
        }
    },
    handleInput: function(inputType, inputData) {

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
        Game.thePlayer.clearMessages();
        Game.displays.msg.clear();
    },
    exit: function() {
        // console.log("Exited lose screen.");
        Game.thePlayer.clearMessages();
        Game.displays.msg.clear();
    },
    render: function(display) {
        // TODO: make this more aesthetic, maybe add more stats
        for (var i = 0; i < 20; i++) {
            display.drawText(2, i + 1, "%b{red}You lose! :(");
        }
        /*
        display.drawText(2, Game.screenHeight - 2, "Turns Taken: " + Game.thePlayer.turnNumber);
        display.drawText(2, Game.screenHeight - 1, "Furthest Level Reached: " + Game.thePlayer.furthestLevel);
        display.drawText(2, Game.screenHeight, "Press [Enter] to go back to the start screen if you want to try again!");
        */
        Game.sendMessage('info', Game.thePlayer, "Turns Taken: %c{}" + Game.thePlayer.turnNumber);
        Game.sendMessage('info', Game.thePlayer, "Furthest Level Reached: %c{}" + Game.thePlayer.furthestLevel);
        Game.sendMessage('info', Game.thePlayer, "Press [Enter] to go back to the start screen if you want to try again!");
    },
    handleInput: function(inputType, inputData) {
        // TODO: mouse input
        if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
            Game.switchScreen(Game.Screen.startScreen, 'main');
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
    this.player = Game.thePlayer;
    this.title = template['title'] || "Some Items";
    this.caption = template['caption'] || "(Press [Enter] or [Esc] to close.)";
    this.okFunction = template['ok'] || null;
    // whether the user can select items at all
    this.canSelect = template['canSelect'] || false;
    // whether the user can select multiple items
    this.canSelectMultiple = template['canSelectMultiple'] || false;
    // filter function: uses identity function by default
    this.filterFunction = template['filter'] || function(x) { return x; }
};
Game.Screen.ItemListScreen.prototype.setup = function(player, items) {
    this.player = player;
    // should be called before switching to the screen
    var count = 0;
    // iterate over each item, applying the filter function and
    // counting the number of acceptable items
    var that = this;
    this.items = items.map(function(item) {
        // transform the item into null if not acceptable
        if (that.filterFunction(item)) {
            count++;
            return item;
        } else {
            return null;
        }
    });
    // clean set of selected indices
    this.selectedIndices = {};
    return count;
};
Game.Screen.ItemListScreen.prototype.render = function(display) {

    display.setOptions({
        fontSize: 16,
        forceSquareRatio: false
    });
    var availSize = display.computeSize(Game.windowWidth, Game.windowHeight);
    display.setOptions({width: availSize[0]});


    var letters = 'abcdefghijklmnopqrstuvwxyz';
    // render the caption in the top row
    display.drawText(1, 1, this.title);
    var row = 0;
    for (var i = 0; i < this.items.length; i++) {
        if (this.items[i]) {
            // get the letter matching the item's index
            var letter = letters.substring(i, i + 1);
            // if we have selected an item, show a +, else show a dash
            // between the letter and the item's name
            var selectionState = (this.canSelect && this.canSelectMultiple &&
                this.selectedIndices[i]) ? '+' : '-';
            // render at the correct row and add 3 (title + blank line).
            // for some reason, stringing this all together into a single drawText argument results in
            // mis-aligned text in the display.
            display.draw(1, 3 + row, letter);
            display.draw(3, 3 + row, selectionState);
            display.draw(5, 3 + row, this.items[i].character, this.items[i].foreground, this.items[i].background);
            display.drawText(7, 3 + row, this.items[i].describeA());
            row++;
        }
    }
    display.drawText(1, 5 + row, this.caption);
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
    // TODO: separate display?
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
            // TODO: separate display?
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
    title: 'Your Inventory:',
    caption: '(press [Enter] or [Esc] to close)',
    canSelect: false
});

Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
    title: 'Select Items to Pick Up:',
    caption: '(letter key to select, \n[Enter] confirm, [Esc] cancel)',
    canSelect: true,
    canSelectMultiple: true,
    ok: function(selectedItems) {
        // try to pick up all items, messaging the player if they
        // couldn't all be picked up
        if (!this.player.pickupItems(Object.keys(selectedItems))) {
            Game.sendMessage('warning', this.player, "Your inventory is full! Not all items were picked up.");
        }
        return true;
    }
});

Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
    title: 'Select Item to Drop:',
    caption: '(letter key to drop item, \n[Enter] or [Esc] to cancel)',
    canSelect: true,
    canSelectMultiple: false,           // should this be true?
    ok: function(selectedItems) {
        // drop the selected item
        this.player.dropItem(Object.keys(selectedItems)[0]);
        return true;
    }
});

Game.Screen.eatScreen = new Game.Screen.ItemListScreen({
    title: 'Choose Item to Eat:',
    caption: '(letter key to eat item, \n[Enter] or [Esc] to cancel)',
    canSelect: true,
    canSelectMultiple: false,
    filter: function(item) {
        return item && item.isEdible;
    },
    ok: function(selectedItems) {
        // eat the item, removing it if no portions remain
        var key = Object.keys(selectedItems)[0];
        var item = selectedItems[key];
        if (item.remainingPortions < item.maxPortions && item.remainingPortions === 1) {
            Game.sendMessage('default', this.player, "You finish off the %s.", item.name);
        } else if (item.remainingPortions > 1) {
            Game.sendMessage('default', this.player, "You eat some of the %s.", item.name);
        } else {
            Game.sendMessage('default', this.player, "You eat the %s.", item.name);
        }
        item.eat(this.player);
        if (item.remainingPortions <= 0) {
            this.player.removeItem(key);
        }
        return true;
    }
});
