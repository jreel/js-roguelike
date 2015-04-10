/**
 * Created by jreel on 3/29/2015.
 */

// also see monsters.js
Game.Creature = function(template) {
    template = template || {};
    // Call the Entity constructor with our properties
    Game.Entity.call(this, template);

    this.name = template['name'] || "creature";
    this.description = template['description'] || "This is an alien-like creature.";

    // Set defaults for inherited Entity properties

    this.isLiving = template['isLiving'] || true;
    this.canBePickedUp = template['canBePickedUp'] || false;
    this.canBeDropped = template['canBeDropped'] || false;

    // Instantiate any of our own properties from the passed args
    this.isHostile = template['isHostile'] || true;   // since most creatures will be
    this.maxHP = template['maxHP'] || 10;
    this.hp = template['hp'] || this.maxHP;
    this.defense = template['defense'] || 0;
    this.baseAttackValue = template['baseAttackValue'] || 1;
    this.sightRadius = template['sightRadius'] || 5;

    if (template['behaviors'] && template['behaviors'] !== {}) {
        this.behaviors = template['behaviors'];
    }

};
// Make creatures inherit all functionality of entities
Game.Creature.extend(Game.Entity);

// add mixins
augment(Game.Creature, Game.Mixins.movable);
augment(Game.Creature, Game.Mixins.destructible);
augment(Game.Creature, Game.Mixins.attacker);
augment(Game.Creature, Game.Mixins.actor);
