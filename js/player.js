/**
 * Created by jreel on 4/4/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// TODO: player creation, different classes, etc.
// TODO: party system
Game.Player = function(template) {
    var defaults = {
        name: "hero",
        description: "This hero will surely save the day!",
        character: '@',
        foreground: '#fff',
        background: '#000',
        isHostile: false,

        isActor: true,      // since we don't need the generic actor mixin

        // mixin-specific properties
        movable: true,
        //actor: true,
        destructible: {
            maxHP: 10,
            baseDefenseValue: 0
        },
        attacker: {
            baseAttackValue: 1
        },
        sight: {
            sightRadius: 6
        },
        messageRecipient: true,
        inventoryHolder: {
            inventorySlots: 22
        },
        foodEater: {
            maxFullness: 1000,
            hungerRate: 1
        }
    };

    // apply defaults into our template where needed
    template = applyDefaults(template, defaults);

    // Call the Entity constructor with composite template
    Game.Entity.call(this, template);


    // Some utility and stats counters
    this.turnNumber = 0;        // incremented after each turn (in screens.js input handler)
    this.furthestLevel = 1;     // incremented whenever a new world level is reached
    this.killCount = 0;         // increment for each monster slain

};
// Make players inherit all functionality of creatures
Game.Player.extend(Game.Entity);

// apply mixins that all players should have
/*
augment(Game.Player, Game.Mixins.movable);
augment(Game.Player, Game.Mixins.destructible);
augment(Game.Player, Game.Mixins.attacker);
augment(Game.Player, Game.Mixins.actor);
augment(Game.Player, Game.Mixins.messageRecipient);
augment(Game.Player, Game.Mixins.holdsInventory);
augment(Game.Player, Game.Mixins.eatsFood);
*/

// since we are not calling the generic actor mixin
// TODO: party system
Game.Player.prototype.act = function() {
    if (this.acting) {
        return;
    }
    this.acting = true;
    // add turn hunger before checking player death
    this.addHunger();
    // detect if the game is over
    if (!this.isAlive) {
        Game.Screen.playScreen.setGameOver(true);
        // send a last message
        Game.sendMessage('danger', this, 'You have died! :( Press [Enter] to continue.');
    }
    // re-render the screen
    Game.refresh();
    // lock the engine and wait asynchronously
    // for the player to press a key
    Game.currentLevel.engine.lock();
    // clear the message queue
    // this.clearMessages();
    this.acting = false;
};





