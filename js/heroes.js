/**
 * Created by jreel on 3/29/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
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
            maxHP: 20
        },
        attacker: {
            baseAttackValue: 3
        },
        sight: {
            sightRadius: 6
        },
        holdsInventory: {
            inventorySlots: 22
        }
    }
};