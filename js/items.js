/**
 * Created by jreel on 4/7/2015.
 */


Game.Templates.Items = {

    apple: {
        name: 'apple',
        character: '%',
        foreground: 'red'
    },

    rock: {
        name: 'rock',
        character: '*',
        foreground: 'gray'
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