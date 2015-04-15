/**
 * Created by jreel on 3/29/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

/*  ITEM = non-living, non-scripted thing; no actions or behaviors. */

Game.Item = function(template) {
    var defaults = {
        name: "item",
        description: "This is an unusual item of unknown origin."

    };

    // apply defaults into our template where needed
    template = applyDefaults(template, defaults);

    // Call the Glyph constructor with composite template
    // this should also handle applying any mixins
    Game.DynamicGlyph.call(this, template);

    // Set up any of our own properties that still need it

};
Game.Item.extend(Game.DynamicGlyph);


// TODO: items with the holdsInventory mixin = containers!







// TODO: repository system? move to own file?
Game.Weapon = function(template) {
    template = template || {};
    // Call the Item constructor with our properties
    Game.Item.call(this, template);

    this.name = template['name'] || "weapon";
    this.description = template['description'] || "This appears to be some sort of weapon.";

    // Set defaults for inherited Item properties
    this.wearable = template['wearable'] || false;
    this.wieldable = template['wieldable'] || true;
    this.isWeapon = template['isWeapon'] || true;
    this.isArmor = template['isArmor'] || false;
    this.stackLimit = template['stackLimit'] || 1;
    this.durability = template['durability'] || 10;

    // Instantiate any of our own properties from the passed args
    this.attackTypes = template['attackTypes'] || {bash:
    {chance: 100,
        atkRange: {min: 1, max: 1},
        atkSpeed: 5,
        dmgType: 'blunt',
        dmgAmount: {n: 1, d: 3},
        modSTR: 0,
        modMove: 0
    }};




    // calculate total attack weights and store as a property for
    // easier access later
    var runningTotal = 0;
    for (var i = 0; i < this.attackTypes.length; i++) {
        runningTotal += this.attackTypes[i].chance;
    }
    this.totalAttackChance = runningTotal;

};
// Make weapons inherit all functionality of items
Game.Weapon.extend(Game.Item);

Game.Weapon.prototype.randomAttack = function() {
    // TODO: call weightedRandom function instead
    var roll = randomInt(1, this.totalAttackChance);
    var totalChance = 0;
    for (var atk in this.attackTypes) {
        totalChance += atk.chance;
        if (roll <= totalChance) {
            return atk;
        }
    }
};


