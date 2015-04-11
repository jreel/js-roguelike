/**
 * Created by jreel on 4/7/2015.
 */


Game.Templates.Items = {

    mushroom: {
        name: 'mushroom',
        character: '⍾',
        foreground: '#784'
    },

    rocknroll: {
        name: 'rock',
        character: '*',
        foreground: '#678'
    },

    apple: {
        name: 'apple',
        character: 'Ó',
        foreground: '#f00'
    }

};

Game.ItemRepository = new Game.Repository('items', Game.Item, Game.Templates.Items);


/* see the reasoning for this in the similar section in monsters.js */

/*
Game.ItemRepository.define('apple', {
    name: 'apple',
    character: '%',
    foreground: 'red'
});

Game.ItemRepository.define('rock', {
    name: 'rock',
    character: '*',
    foreground: 'white'
});

*/