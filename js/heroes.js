/**
 * Created by jreel on 3/29/2015.
 */

/*
 *  PLAYER character (aka HERO) templates
 *
 */

// TODO: repository?
Game.HeroTemplates = {

    default: {
        character: '@',
        foreground: '#fff',
        background: '#000',

        // mixins
        destructible: {
            maxHP: 50
        },
        attacker: {
            baseAttackValue: 10
        },
        sight: {
            sightRadius: 6
        },
        holdsInventory: {
            inventorySlots: 22
        }
    }
};