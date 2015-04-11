/**
 * Created by jreel on 3/27/2015.
 * Thanks to the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

// TODO: do we need a repository system for this as well?
Game.Glyph = function(properties) {
    // Instantiate properties to default if they weren't passed in
    properties = properties || {};
    this.character = properties['character'] || ' ';
    this.foreground = properties['foreground'] || '#fff';
    this.background = properties['background'] || '#000';
};

Game.Glyph.prototype.getGlyph = function() {
    return "%c{" + this.foreground + "}%b{" + this.background + "}" + this.character + "%c{}%b{}";
};


