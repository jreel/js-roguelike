/**
 * Created by jreel on 3/28/2015.
 */

/* ENTITY = living (player, creature) or scripted (doors, traps, projectiles) thing
    usually with actions and behaviors of some sort.
 */

Game.Entity = function Entity(properties) {
    properties = properties || {};

    // Call the glyph's constructor with our set of properties
    Game.Glyph.call(this, properties);

    // Instantiate any properties from the passed args
    this.name = properties['name'] || 'entity';
    this.description = properties['description'] || 'Who knows what this thing is?';
    this.x = properties['x'] || 0;
    this.y = properties['y'] || 0;
    this.level = properties['level'] || null;

    this.isLiving = properties['isLiving'] || true;
    this.canBePickedUp = properties['canBePickedUp'] || false;
    this.canBeDropped = properties['canBeDropped'] || false;

};
Game.Entity.extend(Game.Glyph);

// add mixins
augment(Game.Entity, Game.Mixins.destructible);


/* other methods */
Game.Entity.prototype.setPosition = function(x, y) {
    var oldX = this.x;
    var oldY = this.y;
    // update position
    this.x = x;
    this.y = y;
    // if the entity is on a level, notify the level that the entity has moved
    if (this.level) {
        this.level.updateEntityPosition(this, oldX, oldY);
    }
};


Game.Entity.prototype.destroy = function() {
    // clean-up routines
    // Game.currentLevel.removeEntity(this);
    this.level.removeEntity(this);
};


