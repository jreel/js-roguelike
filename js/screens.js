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
            fontSize: 13,
            forceSquareRatio: false,
            spacing: 1,
            fg: '#ccc',
            bg: '#000'
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
        var introtext = ["%c{#8ff}A Javascript Roguelike",
                         "",
                         "%c{#888}(currently in pre-alpha development -",
                         "%c{#888}there's not really a \"Tower\" yet!)",
                         "",
                         "%c{#ff8}Press [Enter] to start."];
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
    subScreen: null,        // TODO: move subScreens to separate display

    enter: function(display) {
        // console.log("Entered play screen.");

        // if we are entering from the lose screen, be sure to reset
        // the gameOver flag
        // TODO: this may need changing if we implement player character creation
        if (Game.gameOver) {
            Game.gameOver = false;
        }

        display.setOptions({
            width: Game.screenWidth,
            height: Game.screenHeight + 1,
            //fontFamily: "'Cambria', 'Segoe UI Symbol', 'symbola', 'monospace'",
            fontSize: 14,
            forceSquareRatio: true,
            spacing: 1
        });

        Game.startNewGame();
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

        var player = Game.player;
        var area = player.area;

        var screenWidth = Game.screenWidth;
        var screenHeight = Game.screenHeight;

        var fontSize, spacing, forceSquare;
        // set display options depending on current area
        if (area.isOverworld()) {
            fontSize = 11;
            spacing = 0.9;
            forceSquare = false;
        }
        else if (area.isWorldArea()) {
            fontSize = 12;
            spacing = 0.9;
            forceSquare = true;
        }
        else {
            fontSize = 13;
            spacing = 1;
            forceSquare = true;
        }

        display.setOptions({
            width: screenWidth,
            height: screenHeight + 1,
            fontSize: fontSize,
            //fontFamily: "Segoe UI Symbol",
            forceSquareRatio: forceSquare,
            spacing: spacing
        });

        if (Game.recalcDisplaySize()) {
            Game.refresh();
        }

        // render the map
        this.renderMap(display);
    },

    handleInput: function(inputType, inputData) {
        // TODO: mouse input
        // if the game is over, player can press Enter to go to the losing screen.
        if (Game.gameOver) {
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
            var player = Game.player;

             // Movement
            if (cmd === ROT.VK_LEFT) {
                this.move(-1, 0);
            }
            else if (cmd === ROT.VK_RIGHT) {
                this.move(1, 0);
            }
            else if (cmd === ROT.VK_UP) {
                this.move(0, -1);
            }
            else if (cmd === ROT.VK_DOWN) {
                this.move(0, 1);
            }
            else if (cmd === ROT.VK_I) {          // inventory screen
                this.showItemsSubScreen(Game.Screen.inventoryScreen, player.inventory,
                                            "You are not carrying anything.");
                return;
            }
            else if (cmd === ROT.VK_D) {          // drop screen
                this.showItemsSubScreen(Game.Screen.dropScreen, player.inventory,
                                        "You have nothing to drop.");
                return;
            }
            else if (cmd === ROT.VK_E) {      // eat screen
                this.showItemsSubScreen(Game.Screen.eatScreen, player.inventory,
                                        "You have nothing to eat.");
                return;
            }
            else if (cmd === ROT.VK_W) {      // wear/wield screen
                this.showItemsSubScreen(Game.Screen.equipScreen, player.inventory,
                                        "You have nothing to wear or wield.");
                return;
            }
            else if (cmd === ROT.VK_X) {      // examine screen
                this.showItemsSubScreen(Game.Screen.examineScreen, player.inventory,
                                        "You have nothing to examine.");
                return;
            }
            else if (cmd === ROT.VK_L) {      // look screen
                // setup the look screen
                var offsets = this.getMapCoordinates(0, 0);
                Game.Screen.lookScreen.setup(player, player.x, player.y, offsets.x, offsets.y);
                this.setSubScreen(Game.Screen.lookScreen);
                return;
            }
            else if (cmd === ROT.VK_H) {      // help screen
                this.setSubScreen(Game.Screen.helpScreen);
                return;
            }
            else if (cmd === ROT.VK_SPACE) {
                this.activateTile();
            }
            else {
                // not a valid key
                return;
            }
            // Unlock the engine
            //this.player.trackers.turnsTaken++;
            player.raiseEvent('onTurnTaken');
            player.area.engine.unlock();
        }
    },

    getMapCoordinates: function(screenX, screenY) {
        // takes ScreenX, ScreenY coordinates and
        // returns correct mapX, mapY coordinates
        var playerX = Game.player.x;
        var playerY = Game.player.y;
        var area = Game.currentWorld.currentArea;
        var mapWidth = area.map.width;
        var mapHeight = area.map.height;
        var screenWidth = Game.screenWidth;
        var screenHeight = Game.screenHeight;

        var mapLeftBound, mapTopBound, mapX, mapY;

        // wrap the x-coordinates if needed
        if (area.map.wrap) {
            // find the left bound (screenX = 0) of the rendered map,
            // based on player map position
            mapLeftBound = playerX - (screenWidth / 2);
            // adjust if needed
            if (mapLeftBound < 0) {
                mapLeftBound += mapWidth;
            }
            mapX = mapLeftBound + screenX;
            if (mapX >= mapWidth) {
                mapX %= mapWidth;
            }
        } else {
            mapLeftBound = Math.max(0, playerX - (screenWidth / 2));
            mapLeftBound = Math.min(mapLeftBound, Math.abs(mapWidth - screenWidth));
            mapX = mapLeftBound + screenX;
        }

        // we don't wrap the y-coordinates in any case
        mapTopBound = Math.max(0, playerY - (screenHeight / 2));
        mapTopBound = Math.min(mapTopBound, Math.abs(mapHeight - screenHeight));
        mapY = mapTopBound + screenY;

        return {x: mapX, y: mapY};
    },

    renderMap: function(display) {
        var player = Game.player;
        var area = player.area;
        var map = area.map;

        var screenWidth = Game.screenWidth;
        var screenHeight = Game.screenHeight;

        var mapWidth = area.width;
        var mapHeight = area.height;

        var playerX = player.x;
        var playerY = player.y

        // Find all visible map cells based on FOV or previous visit
        var visibleCells = {};
        var sightRadius = player.sightRadius * area.sightRadiusMultiplier;
        area.fov.compute(
            playerX, playerY, sightRadius,
            function(x, y, radius, visibility) {
                x = map.getWrappedX(x);
                visibleCells[x + "," + y] = true;
                // mark cell as explored
                map.setExplored(x, y, true);
            }
        );

        // calculate the map coordinates at the top left of the screen
        // (based on centering the view on the player and
        //  wrapping the map if needed)
        var topLeft = this.getMapCoordinates(0, 0);

        // Render visible and explored map cells
        var x, y, sx, sy;
        for (sx = 0, x = topLeft.x; sx < screenWidth; sx++, x++) {
            for (sy = 0, y = topLeft.y; sy < screenHeight; sy++, y++) {

                // if our x has gone past the mapWidth, recalculate and reset
                if (x >= mapWidth) {
                    x = this.getMapCoordinates(sx, sy).x;
                }

                if (map.isExplored(x, y)) {
                    // fetch the glyph for the tile and render it
                    // to the screen at the offset position
                    var glyph, char, fg, bg;
                    // if we are at a cell within the fov, check if
                    // there are visible items or entities
                    if (visibleCells[x + ',' + y]) {
                        // render map tile first, then items, then entities
                        // TODO: refactor based on proper stacking order for future tile graphics

                        glyph = map.getTile(x, y);
                        bg = glyph.background;          // get the map background

                        if (area.getItemsAt(x, y)) {
                            // if we have items, get the glyph of the topmost one
                            var items = area.getItemsAt(x, y);
                            glyph = items[items.length - 1];
                        }
                        if (area.getEntityAt(x, y)) {
                            glyph = area.getEntityAt(x, y);
                        }

                        char = glyph.character;
                        fg = glyph.foreground;
                        // if the item or creature doesn't explicitly set its own background,
                        // use the map background to render.
                        bg = glyph.background || bg;
                    } else {
                        // tile was previously explored but is not currently
                        // within the fov; render it darker
                        // TODO: colors/params based on map type
                        glyph = map.getTile(x, y);
                        char = glyph.character;
                        fg = glyph.darken().foreground;
                        bg = glyph.darken().background;
                    }
                    display.draw(sx, sy, char, fg, bg);
                }
            }
        }
    },

    move: function(dX, dY) {
        var player = Game.player;
        var area = Game.currentWorld.currentArea;
        var mapWidth = area.map.width;
        var newX = player.x + dX;
        // check if we need to wrap around
        if (area.map.wrap) {
            if (newX < 0) {
                newX += mapWidth;
            } else if (newX >= mapWidth) {
                newX %= mapWidth
            }
        }
        var newY = player.y + dY;
        // Try to move to the new cell
        player.tryMove(newX, newY);
    },

    activateTile: function() {
        var player = Game.player;
        var area = Game.currentWorld.currentArea;
        var x = player.x;
        var y = player.y;

        // check for items that player wants to pick up
        var items = area.getItemsAt(x, y);
        if (items) {
            if (items.length === 1) {
                // if only one item, don't show a screen, just try to pick it up
                var item = items[0];
                if (player.pickupItems([0])) {
                    Game.sendMessage('default', player, "You pick up %s", item.describeA() + ".");
                } else {
                    Game.sendMessage('warning', player, "Your inventory is full! Nothing was picked up.");
                }
            } else {
                // show the pickup screen if there are > 1 item
                this.showItemsSubScreen(Game.Screen.pickupScreen, items,
                                        "There is nothing here to pick up.");
            }
        } else {
            // if no items, check for other functions

            // check for special tiles for area changes
            /*
            if (player.changeAreas(x, y)) {
                Game.refresh();
            }
            */
            if (player.changeAreas(x,y)) {
                Game.currentWorld.currentArea = player.area;
            }
        }
    },

    setSubScreen: function(subScreen) {
        // TODO: move subscreens to separate display
        this.subScreen = subScreen;
        // refresh screen on changing the subscreen
        Game.refresh();
    },

    showItemsSubScreen: function(subScreen, items, emptyMessage) {
        var player = Game.player;
        if (items && subScreen.setup(player, items) > 0) {
            this.setSubScreen(subScreen);
        } else {
            Game.sendMessage('warning', player, emptyMessage);
            Game.refresh();
        }
    }

};

Game.Screen.statsLine = {
    enter: function() {

    },
    exit: function() {

    },
    render: function(display) {
        if (!Game.player || Game.player === null || Game.gameOver) {
            display.clear();
            return;
        }

        var player = Game.player;
        var offset = 0;

        // show current area
        var areaLabel = '%c{#fff}%b{#000}Exploring: ';
        var currentBiome = Game.currentWorld.currentArea.biome;
        currentBiome = currentBiome.toLowerCase();
        currentBiome = currentBiome.replace("_", " ");
        //var subBiome = Game.currentWorld.getBiomeName(Game.player.x, Game.player.y).toLowerCase();
        //currentArea += " (" + subBiome.toLowerCase() + ")";

        var coordinateLabel = ' (';
        var xCoordinate = player.x;
        var yCoordinate = player.y;
        coordinateLabel += xCoordinate + ', ' + yCoordinate + ')';

        var areaOut = areaLabel + currentBiome + coordinateLabel;
        display.drawText(offset, 0, areaOut);
        offset += (ROT.Text.measure(areaOut).width + 3);

        // show current hp
        var hpLabel = '%c{#fff}%b{#000}HP: ';
        var hpState = player.getHpState();
        display.drawText(offset, 0, hpLabel + hpState);
        offset += (ROT.Text.measure(hpLabel + hpState).width + 3);

        // show current weapon
        var weaponLabel = '%c{#fff}%b{#000}Wielding: ';
        var weaponName;
        if (player.weapon) {
            weaponName = player.weapon.name;
        } else {
            weaponName = 'nothing';
        }
        display.drawText(offset, 0, weaponLabel + weaponName);
        offset += (ROT.Text.measure(weaponLabel + weaponName).width + 3);

        // show current armor
        var armorLabel = '%c{#fff}%b{#000}Wearing: ';
        var armorName;
        if (player.armor) {
            armorName = player.armor.name;
        } else {
            armorName = 'nothing';
        }
        display.drawText(offset, 0, armorLabel + armorName);
        offset += (ROT.Text.measure(armorLabel + armorName).width + 3);

        // show current hunger state
        var hungerState = player.getHungerState();
        display.drawText(offset, 0, hungerState);

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
        if (!Game.player || Game.player === null || Game.gameOver) {
            display.clear();
            return;
        }
        display.drawText(0, 0, "%c{#fff}%b{#000}[⇦⇧⇩⇨] move/attack, " +
                               "[Space] pick up, [I] inventory, [D] drop, [E] eat, [W] wear/wield");
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
        if (!Game.player || (Game.player === null)) {
            return;
        }

        var messages = Game.player.messages;
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

Game.Screen.gainStatScreen = {
    setup: function(entity) {
        // must be called before rendering
        this.entity = entity;
        this.options = entity.statOptions;
    },
    render: function(display) {

        display.setOptions({
            fontSize: 16,
            forceSquareRatio: false
        });
        var availSize = display.computeSize(Game.windowWidth, Game.windowHeight);
        display.setOptions({ width: availSize[0] });

        var letters = 'abcdefghijklmnopqrstuvwxyz';
        display.drawText(0, 1, 'Level Up!');
        display.drawText(0, 3, 'Choose a stat to increase: ');

        // iterate through the options
        for (var i = 0; i < this.options.length; i++) {
            display.drawText(0, 5 + i,
                letters.substring(i, i + 1) + ' - ' +
                this.options[i][0]);
        }

        // render remaining stat points
        display.drawText(0, 7 + this.options.length,
            "Remaining points: " + this.entity.statPoints);
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            var cmd = inputData.keyCode;
            // if a letter was pressed, check it matches a valid option
            if (cmd >= ROT.VK_A && cmd <= ROT.VK_Z) {
                // check it maps to a valid option by subtracting 'a' from
                // the keyCode to know what letter was pressed
                var index = cmd - ROT.VK_A;
                if (this.options[index]) {
                    // call the stat increasing function
                    this.options[index][1].call(this.entity);
                    // decrease stat points
                    this.entity.statPoints--;
                    // if no stat points left, exit the screen, else refresh
                    if (this.entity.statPoints === 0) {
                        Game.Screen.playScreen.setSubScreen(undefined);
                    } else {
                        Game.refresh();
                    }
                }
            }
        }
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
        Game.player.clearMessages();
        Game.displays.msg.clear();
    },
    render: function(display) {
        display.setOptions({
            fontSize: 16,
            forceSquareRatio: false,
            spacing: 1,
            fg: '#fff',
            bg: '#000'
        });

        // Render our prompt to the screen
        for (var i = 0; i < 12; i++) {
            // Generate random background colors
            var r = Math.round(Math.random() * 255);
            var b = Math.round(Math.random() * 255);
            var g = Math.round(Math.random() * 255);
            var background = ROT.Color.toRGB([r, g, b]);
            display.drawText(2, i + 1, "%b{" + background + "}You win!");
        }

        var player = Game.player;

        var trackers = Object.keys(player.trackers);
        for (var j = 0; j < trackers.length; j++) {
            var trackedStat = trackers[j];
            Game.sendMessage('info', player, trackedStat + ": " + player.trackers[trackedStat]);
        }

        Game.sendMessage('warning', player,
                         "Press [Enter] to go back to the start screen if you would like to play again!"
        );
    },
    handleInput: function(inputType, inputData) {
        // Not much to do here
        if (inputType === 'keydown' && inputData.keyCode === ROT.VK_RETURN) {
            Game.switchScreen(Game.Screen.startScreen, 'main');
        }
    }
};

// Define the losing screen
Game.Screen.loseScreen = {
    enter: function() {
        // console.log("Entered lose screen.");
        //Game.player.clearMessages();
        //Game.displays.msg.clear();
    },
    exit: function() {
        // console.log("Exited lose screen.");
        Game.player.clearMessages();
        Game.displays.msg.clear();
    },
    render: function(display) {
        // TODO: make this more aesthetic, maybe add more stats

        var loseGraphicSize = ROT.Text.measure(Game.loseGraphic);

        display.setOptions({
            width: loseGraphicSize.width + 2,
            height: loseGraphicSize.height + 1,
            fontSize: 14,
            //fontFamily: 'Segoe UI Symbol',
            forceSquareRatio: false,
            spacing: 1,
            fg: '#000',
            bg: '#800'
        });

        var row = 1;
        var col = 0;
        for (var i = 0; i < Game.loseGraphic.length; i++) {
            if (Game.loseGraphic.charAt(i) == '\n') {
                row++;
                col = 0;
            } else {
                display.draw(col, row, Game.loseGraphic.charAt(i));
                col++;
            }
        }

        var player = Game.player;
/*
        var trackers = Object.keys(Game.player.trackers);
        for (var j = 0; j < trackers.length; j++) {
            var trackedStat = trackers[j];
            //Game.sendMessage('info', Game.player, trackedStat + ": " + Game.player.trackers[trackedStat]);
        }
*/
        Game.sendMessage('warning', player, "Press [Enter] to go back to the start screen if you want to try again!");
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
    this.player = Game.player;
    this.title = template['title'] || "Some Items";
    this.caption = template['caption'] || "(Press [Enter] or [Esc] to close.)";
    this.okFunction = template['ok'] || null;
    // whether the user can select items at all
    this.canSelect = template['canSelect'] || false;
    // whether the user can select multiple items
    this.canSelectMultiple = template['canSelectMultiple'] || false;
    // filter function: uses identity function by default
    this.filterFunction = template['filter'] || function(x) { return x; };

    this.handleInput = template['handleInput'];     // fall back to prototype.handleInput()
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
        }
        else {
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
            // check if item is currently worn or wielded
            var suffix;
            if (this.items[i] === this.player.armor) {
                suffix = ' (wearing)';
            }
            else if (this.items[i] === this.player.weapon) {
                suffix = ' (wielding)';
            }
            else {
                suffix = '';
            }
            // render at the correct row and add 3 (title + blank line).
            // for some reason, stringing this all together into a single drawText argument results in
            // mis-aligned text in the display.
            display.draw(1, 3 + row, letter);
            display.draw(3, 3 + row, selectionState);
            display.draw(5, 3 + row, this.items[i].character, this.items[i].foreground, this.items[i].background);
            display.drawText(7, 3 + row, this.items[i].describeA() + suffix);
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
        this.player.area.engine.unlock();
    }
};
Game.Screen.ItemListScreen.prototype.handleInput = function(inputType, inputData) {
    // TODO: mouse input
    if (inputType === 'keydown') {
        var keyCode = inputData.keyCode;

        // if the user hit escape, hit enter and can't select an item, or hit
        // enter without any items selected, simply cancel out
        if (keyCode === ROT.VK_ESCAPE || (keyCode === ROT.VK_RETURN &&
             (!this.canSelect || Object.keys(this.selectedIndices).length === 0))) {
            // TODO: separate display?
            Game.Screen.playScreen.setSubScreen(undefined);
        }

        // handle pressing return when items are selected
        else if (keyCode === ROT.VK_RETURN) {
            this.executeOkFunction();
        }

        // handle pressing a letter if we can select an item
        else if (this.canSelect && keyCode >= ROT.VK_A && keyCode <= ROT.VK_Z) {
            // check if it maps to a valid item by subtracting 'a' from
            // the keyCode to know what letter of the alphabet was pressed
            var index = keyCode - ROT.VK_A;

            if (this.items[index]) {
                // if multiple selection is allowed, toggle the selected status
                // else select the item and exit screen
                if (this.canSelectMultiple) {
                    if (this.selectedIndices[index]) {
                        delete this.selectedIndices[index];
                    }
                    else {
                        this.selectedIndices[index] =  true;
                    }
                    // redraw screen
                    Game.refresh();
                }
                else {
                    this.selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }

        // if space is pressed, select all
        else if (this.canSelectMultiple && keyCode === ROT.VK_SPACE) {
            for (var i in this.items) {
                if (this.items.hasOwnProperty(i)) {
                    this.selectedIndices[i]= true;
                }
            }
        }
    }
};

/* define screens based on ItemListScreen */
Game.Screen.inventoryScreen = new Game.Screen.ItemListScreen({
    title: 'Your Inventory:',
    caption: '(press any key to close)',
    canSelect: false,
    handleInput: function(inputType, inputData) {
        // this one is simple, close the screen on any keypress
        if (inputType === 'keydown' && inputData.keyCode) {
            Game.Screen.playScreen.setSubScreen(undefined);
        }
    }
});

Game.Screen.pickupScreen = new Game.Screen.ItemListScreen({
    title: 'Select Items to Pick Up:',
    caption: '(letter key to select, [Space] to select all, \n[Enter] to confirm, [Esc] to cancel)',
    canSelect: true,
    canSelectMultiple: true,
    ok: function(selectedItems) {
        // try to pick up all items, messaging the player if they
        // couldn't all be picked up
        if (Object.keys(selectedItems).length > 1) {
            Game.sendMessage('default', this.player, "You pick up the things.");
        }
        if (!this.player.pickupItems(Object.keys(selectedItems))) {
            Game.sendMessage('warning', this.player, "Your inventory is full! Not all items were picked up.");
        }
        return true;
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            var cmd = inputData.keyCode;

            // if escape, or enter without any items selected, close the screen
            if (cmd === ROT.VK_ESCAPE ||
                (cmd === ROT.VK_RETURN && Object.keys(this.selectedIndices).length === 0)) {
                Game.Screen.playScreen.setSubScreen(undefined);
            }

            // handle pressing return when items are selected
            else if (cmd === ROT.VK_RETURN) {
                this.executeOkFunction();
            }

            // handle pressing a letter to toggle selection of an item
            else if (cmd >= ROT.VK_A && cmd <= ROT.VK_Z) {
                // check if it maps to a valid item by subtracting 'a' from
                // the keyCode to know what letter of the alphabet was pressed
                var index = cmd - ROT.VK_A;
                if (this.items[index]) {
                    // toggle the selected status
                    if (this.selectedIndices[index]) {
                        delete this.selectedIndices[index];
                    }
                    else {
                        this.selectedIndices[index] = true;
                    }
                    // redraw screen
                    Game.refresh();
                }
            }

            // if space is pressed, select all
            else if (cmd === ROT.VK_SPACE) {
                for (var i in this.items) {
                    if (this.items.hasOwnProperty(i)) {
                        this.selectedIndices[i] = true;
                    }
                }
                Game.refresh();
            }
        }
    }
});

Game.Screen.dropScreen = new Game.Screen.ItemListScreen({
    title: 'Select Item to Drop:',
    caption: '(letter key to drop item, [Esc] to cancel)',
    canSelect: true,
    canSelectMultiple: false,           // should this be true?
    ok: function(selectedItems) {
        // drop the selected item
        this.player.dropItem(Object.keys(selectedItems)[0]);
        return true;
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            var keyCode = inputData.keyCode;

            // if escape, close the screen
            if (keyCode === ROT.VK_ESCAPE) {
                Game.Screen.playScreen.setSubScreen(undefined);
            }

            // handle pressing a letter to select an item
            else if (keyCode >= ROT.VK_A && keyCode <= ROT.VK_Z) {
                // check if keypress maps to a valid item by subtracting 'a' from
                // the keyCode to know what letter of the alphabet was pressed
                var index = keyCode - ROT.VK_A;
                if (this.items[index]) {
                    // select the item and exit screen
                    this.selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }
    }
});

Game.Screen.eatScreen = new Game.Screen.ItemListScreen({
    title: 'Choose Item to Eat:',
    caption: '(letter key to eat item, [Esc] to cancel)',
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
        }
        else if (item.remainingPortions > 1) {
            Game.sendMessage('default', this.player, "You eat some of the %s.", item.name);
        }
        else {
            Game.sendMessage('default', this.player, "You eat the %s.", item.name);
        }
        item.eat(this.player);
        if (item.remainingPortions <= 0) {
            this.player.removeItem(key);
        }
        return true;
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            var keyCode = inputData.keyCode;

            // if escape, close the screen
            if (keyCode === ROT.VK_ESCAPE) {
                Game.Screen.playScreen.setSubScreen(undefined);
            }

            // handle pressing a letter to select an item
            else if (keyCode >= ROT.VK_A && keyCode <= ROT.VK_Z) {
                // check if keypress maps to a valid item by subtracting 'a' from
                // the keyCode to know what letter of the alphabet was pressed
                var index = keyCode - ROT.VK_A;
                if (this.items[index]) {
                    // select the item and exit screen
                    this.selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }
    }
});

Game.Screen.equipScreen = new Game.Screen.ItemListScreen({
    title: 'Choose Item to Equip or Unequip:',
    caption: '(letter key to Equip/Unequip item, [Esc] to cancel)',
    canSelect: true,
    canSelectMultiple: false,
    filter: function(item) {
        return item && item.isEquippable;
    },
    ok: function(selectedItems) {
        var key = Object.keys(selectedItems)[0];
        var item = selectedItems[key];

        // if the selected item is one we are currently wearing, we need to un-equip it
        if (item === this.player.armor) {
            Game.sendMessage('warning', this.player, "You remove your %s.", item.name);
            this.player.takeOff();
        }
        else if (item === this.player.weapon) {
            Game.sendMessage('warning', this.player, "You put away your %s.", item.name);
            this.player.unwield();
        }

        // otherwise, check the type of item, and equip it
        else if (item.isWearable) {
            this.player.unequip(item);
            this.player.wear(item);
            Game.sendMessage('default', this.player, "You are wearing %s.", item.describeA());
        }
        else if (item.isWieldable) {
            this.player.unequip(item);
            this.player.wield(item);
            Game.sendMessage('default', this.player, "You are wielding %s.", item.describeA());
        }
        return true;
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            var keyCode = inputData.keyCode;

            // if escape, close the screen
            if (keyCode === ROT.VK_ESCAPE) {
                Game.Screen.playScreen.setSubScreen(undefined);
            }

            // handle pressing a letter to select an item
            else if (keyCode >= ROT.VK_A && keyCode <= ROT.VK_Z) {
                // check if keypress maps to a valid item by subtracting 'a' from
                // the keyCode to know what letter of the alphabet was pressed
                var index = keyCode - ROT.VK_A;
                if (this.items[index]) {
                    // select the item and exit screen
                    this.selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }
    }
});

Game.Screen.examineScreen = new Game.Screen.ItemListScreen({
    title: 'Choose the item you wish to examine:',
    caption: '(letter key to select item, [Esc] to cancel)',
    canSelect: true,
    canSelectMultiple: false,
    filter: function(item) {
        return item;
    },
    ok: function(selectedItems) {
        var keys = Object.keys(selectedItems);
        if (keys.length > 0) {
            var item = selectedItems[keys[0]];
            Game.sendMessage('info', this.player, "It's %s (%s).", item.describeA(), item.getDetails());
        }
        return true;
    },
    handleInput: function(inputType, inputData) {
        if (inputType === 'keydown') {
            var keyCode = inputData.keyCode;

            // if escape, close the screen
            if (keyCode === ROT.VK_ESCAPE) {
                Game.Screen.playScreen.setSubScreen(undefined);
            }

            // handle pressing a letter to select an item
            else if (keyCode >= ROT.VK_A && keyCode <= ROT.VK_Z) {
                // check if keypress maps to a valid item by subtracting 'a' from
                // the keyCode to know what letter of the alphabet was pressed
                var index = keyCode - ROT.VK_A;
                if (this.items[index]) {
                    // select the item and exit screen
                    this.selectedIndices[index] = true;
                    this.executeOkFunction();
                }
            }
        }
    }

});

Game.Screen.TargetingScreen = function(template) {
    template = template || {};
    // by default, the ok function does nothing, and doesn't consume a turn.
    this.okFunction = template['ok'] || function(x, y) { return false; };
    // the default caption function simply returns an empty string.
    this.captionFunction = template['caption'] || function(x, y) { return ''; };
};

Game.Screen.TargetingScreen.prototype.setup = function(player, startX, startY, offsetX, offsetY) {
    this.player = player;
    this.area = player.area;
    // store original position, subtract the offset
    this.startX = startX - offsetX;
    this.startY = startY - offsetY;
    // store current cursor position
    this.cursorX = this.startX;
    this.cursorY = this.startY;
    // store map offsets
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    // cache the fov
    var visibleCells = {};
    this.area.fov.compute(this.player.x, this.player.y,
                            this.player.sightRadius * this.area.sightRadiusMultiplier,
                            function(x, y, radius, visibility) {
                                visibleCells[x + ',' + y] = true;
                            });
    this.visibleCells = visibleCells;
};

Game.Screen.TargetingScreen.prototype.render = function(display) {
    // render the usual playscreen map
    Game.Screen.playScreen.renderMap.call(Game.Screen.playScreen, display);

    // draw a line from the start to the cursor
    var points = Game.Geometry.getLine(this.startX, this.startY, this.cursorX, this.cursorY);
    var map = this.area.map;
    // highlight cells along the line
    var p, mapX, mapY, entity, items, tile, char, fg, bg;
    for (var i = 0, len = points.length; i < len; i++) {
        p = points[i];
        mapX = p.x + this.offsetX;
        mapY = p.y + this.offsetY;
        bg = '#f6f';

        if (map.isExplored(mapX, mapY)) {
            tile = map.getTile(mapX, mapY);
            char = tile.character;
            fg = tile.foreground;

            if (this.visibleCells[mapX + ',' + mapY]) {
                entity = this.area.getEntityAt(mapX, mapY);
                items = this.area.getItemsAt(mapX, mapY);

                if (items) {
                    var item = items[items.length - 1];
                    char = item.character;
                    fg = item.foreground;
                }
                if (entity) {
                    char = entity.character;
                    fg = entity.foreground;
                }
            }
        }
        else {
            char = Game.Tile.nullTile.character;
            fg = Game.Tile.nullTile.foreground;
        }
        display.draw(p.x, p.y, char, fg, bg);
    }

    // render a caption at the bottom of the screen
    display.drawText(0, Game.screenHeight - 1, this.captionFunction(this.cursorX + this.offsetX, this.cursorY + this.offsetY));
};

Game.Screen.TargetingScreen.prototype.handleInput = function(inputType, inputData) {
    var cmd = inputData.keyCode;
    // move the cursor
    if (inputType == 'keydown') {
        if (cmd === ROT.VK_LEFT) {
            this.moveCursor(-1, 0);
        }
        else if (cmd === ROT.VK_RIGHT) {
            this.moveCursor(1, 0);
        }
        else if (cmd === ROT.VK_UP) {
            this.moveCursor(0, -1);
        }
        else if (cmd === ROT.VK_DOWN) {
            this.moveCursor(0, 1);
        }
        else if (cmd === ROT.VK_ESCAPE) {
            Game.Screen.playScreen.setSubScreen(undefined);
        }
        else if (cmd === ROT.VK_RETURN) {
            this.executeOkFunction();
        }
    }
    Game.refresh();
};

Game.Screen.TargetingScreen.prototype.moveCursor = function(dx, dy) {
    // make sure we stay within bounds
    // TODO: scrolling?
    this.cursorX = Math.max(0, Math.min(this.cursorX + dx, Game.screenWidth));
    this.cursorY = Math.max(0, Math.min(this.cursorY + dy, Game.screenHeight - 1));
};

Game.Screen.TargetingScreen.prototype.executeOkFunction = function() {
    // switch back to the play screen
    Game.Screen.playScreen.setSubScreen(undefined);
    // call the ok function and end the player's turn if return true.
    if (this.okFunction(this.cursorX + this.offsetX, this.cursorY + this.offsetY)) {
        this.area.engine.unlock();
    }
};

Game.Screen.lookScreen = new Game.Screen.TargetingScreen({
    caption: function(x, y) {
        var map = this.area.map;
        // if the tile is explored, we can give a better caption
        if (map.isExplored(x, y)) {
            // if the cell is within fov, check for visible items or entities
            if (this.visibleCells[x + ',' + y]) {
                // tell us about any entities first
                var entity = this.area.getEntityAt(x, y);
                var items = this.area.getItemsAt(x, y);

                if (entity) {
                    return String.format('%s - %s (%s)',
                                         entity.getGlyph(),
                                         entity.describeA(true),
                                         entity.getDetails());
                }
                else if (items) {
                    var item = items[items.length - 1];
                    return String.format('%s - %s (%s)',
                                         item.getGlyph(),
                                         item.describeA(true),
                                         item.getDetails());
                }
            }
            // if no entity/item, or the tile wasn't visible, then use the tile info
            return String.format('%s - %s',
                                 map.getTile(x, y).getGlyph(),
                                 map.getTile(x, y).description);
        }
        // if the tile is not explored, show the null tile description
        else {
            return String.format('%s - %s',
                                 Game.Tile.nullTile.getGlyph(),
                                 Game.Tile.nullTile.description);
        }
    }
});


Game.Screen.helpScreen = {
    render: function(display) {
        display.setOptions({
            fontSize: 16,
            forceSquareRatio: false });
        var availSize = display.computeSize(Game.windowWidth, Game.windowHeight);
        display.setOptions({ width: availSize[0] });

        var text   = 'Shattered Tower Help';
        var border = '--------------------';
        var y = 2;

        var textSize = ROT.Text.measure(text);
        var centerStart = (Game.screenWidth - textSize.width) / 2;
        display.drawText(centerStart, y++, text);
        display.drawText(centerStart, y++, border);
        y++;
        display.drawText(1, y++, '[⇦⇧⇩⇨] to move, attack, break blocks, open doors');
        display.drawText(1, y++, '[Space] to pick up items, or change areas (such as stairs)');
        display.drawText(1, y++, '[I] to view your Inventory');
        display.drawText(1, y++, '[D] to Drop an item');
        display.drawText(1, y++, '[W] to Wear or Wield an item');
        display.drawText(1, y++, '[E] to Eat something');
        display.drawText(1, y++, '[X] to eXamine an item');
        display.drawText(1, y++, '[L] to Look around you');
        display.drawText(1, y++, '[H] to show this Help screen');
        y +=2;
        text = '--- press any key to continue ---';
        textSize = ROT.Text.measure(text);
        centerStart = (Game.screenWidth - textSize.width) / 2;
        display.drawText(centerStart, y++, text);
    },

    handleInput: function(inputType, inputData) {
        Game.Screen.playScreen.setSubScreen(null);
    }
};