/**
 * Created by jreel on 3/29/2015.
 */

/*  ITEM = non-living, non-scripted thing; no actions or behaviors. */

Game.Item = function(template) {
    template = template || {};
    // Call the Glyph constructor with our properties
    Game.Glyph.call(this, template);

    this.name = template['name'] || "item";
    this.description = template['description'] || "This is an unusual item of unknown origin.";

    // Instantiate any properties from the passed args
    // Game.Item was originally a child (now a sibling) of Game.Entity, and
    // so most of the properties are the same
    this.isDestructible = template['destructible'] || true;
    this.canMove = template['canMove'] || false;
    this.isLiving = template['isLiving'] || false;
    this.canBePickedUp = template['canBePickedUp'] || true;
    this.canBeDropped = template['canBeDropped'] || true;

    // Instantiate any of our own properties from the passed args
    this.wearable = template['wearable'] || false;
    this.wieldable = template['wieldable'] || false;
    this.isWeapon = template['isWeapon'] || false;
    this.isArmor = template['isArmor'] || false;
    this.stackLimit = template['stackLimit'] || 1;
    this.durability = template['durability'] || 1;
    this.weight = template['weight'] || 1;

};
Game.Item.extend(Game.Glyph);

// do items get or need mixins? those are usually for actions/behaviors
// TODO: items which have holdsInventory mixin = containers!

/* other methods */

Game.Item.prototype.nameA = function(capitalize) {
    // optional parameter to capitalize the a/an
    var prefixes = capitalize? ['A', 'An'] : ['a', 'an'];
    var string = this.name;
    var firstLetter = string.charAt(0);
    firstLetter = firstLetter.toLowerCase();

    // if word starts with a vowel use 'an', else use 'a'.
    // (note that this is not perfect.)
    var prefix = 'aeiou'.indexOf(firstLetter) >= 0 ? 1 : 0;
    return prefixes[prefix] + ' ' + string;
};






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


