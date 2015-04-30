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
        speed: 5,
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
        },
        armorUser: true,
        weaponUser: true,
        experienceGainer: true,
        playerTracker: true         // sets up tracking counters and associated event listeners

    };

    // apply defaults into our template where needed
    template = applyDefaults(template, defaults);

    // Call the Entity constructor with composite template
    Game.Entity.call(this, template);

};
// Make players inherit all functionality of creatures
Game.Player.extend(Game.Entity);


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
        Game.setGameOver(true);
        // send a last message
        Game.sendMessage('danger', this, 'You have died! :( Press [Enter] to continue.');
    }
    // re-render the screen
    Game.refresh();
    // lock the engine and wait asynchronously
    // for the player to press a key
    Game.currentWorld.currentArea.engine.lock();
    this.acting = false;
};





