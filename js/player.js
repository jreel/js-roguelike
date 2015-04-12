/**
 * Created by jreel on 4/4/2015.
 */

// TODO: player creation, different classes, etc.
// TODO: party system
Game.Player = function(template) {
    template = template || {};
    // Call the Entity constructor with our properties
    Game.Entity.call(this, template);

    this.name = template['name'] || "hero";
    this.description = template['description'] || "This hero will surely save the day!";

    // Set defaults for inherited Entity properties
    this.character = template['character'] || '@';
    this.foreground = template['foreground'] || 'white';
    this.background = template['background'] || 'black';

    this.isLiving = template['isLiving'] || true;
    this.canBePickedUp = template['canBePickedUp'] || false;
    this.canBeDropped = template['canBeDropped'] || false;

    // Our own properties (sibling of Creature so some duplicate properties)
    this.isHostile = template['isHostile'] || false;
    this.maxHP = template['maxHP'] || 10;
    this.hp = template['hp'] || this.maxHP;
    this.defense = template['defense'] || 0;
    this.baseAttackValue = template['baseAttackValue'] || 1;

    // TODO: how should sightRadius be handled for variable fov?
    this.sightRadius = template['sightRadius'] || 6;
    this.inventory = new Array(template['inventorySlots'] || 22);

    // Instantiate any of our own properties from the passed args
    this.turnNumber = 0;        // incremented after each turn (in screens.js input handler)

    this.furthestLevel = 1;     // incremented whenever a new world level is reached

};
// Make players inherit all functionality of creatures
Game.Player.extend(Game.Entity);

// Add mixins
augment(Game.Player, Game.Mixins.movable);
augment(Game.Player, Game.Mixins.destructible);
augment(Game.Player, Game.Mixins.attacker);
augment(Game.Player, Game.Mixins.actor);
augment(Game.Player, Game.Mixins.messageRecipient);
augment(Game.Player, Game.Mixins.holdsInventory);

// overrides generic actor mixin
Game.Player.prototype.act = function() {

    // detect if the game is over
    // TODO: party system
    if (this.hp < 1) {
        Game.Screen.playScreen.setGameOver(true);
        // send a last message
        Game.sendMessage(this, 'You have died! :( Press [Enter] to continue.');
    }
    // re-render the screen
    Game.refresh();
    // lock the engine and wait asynchronously
    // for the player to press a key
    Game.currentLevel.engine.lock();
    // clear the message queue
    // this.clearMessages();

};





