/**
 * Created by jreel on 3/29/2015.
 * Based on the "Building a Roguelike in Javascript" tutorial by Dominic
 * http://www.codingcookies.com/2013/04/01/building-a-roguelike-in-javascript-part-1/
 *
 * Using the rot.js library developed by Ondrej Zara
 * http://ondras.github.io/rot.js/hp/
 */

Game.sendMessage = function(msgType, recipient, message, subs) {

    var color;
    if (msgType === 'danger') {
        color = "%c{#f00}";
    } else if (msgType === 'warning') {
        color = "%c{#ff0}";
    } else if (msgType === 'info') {
        color = "%c{#6cf}";
    } else {
        color = "";
    }

    if (recipient.isMessageRecipient) {
        if (subs) {
            var submsg = Array.prototype.slice.call(arguments, 2);
            message = String.format.apply(this, submsg);
        }
        recipient.receiveMessage(color + message);
    }
};

Game.sendMessageNearby = function(area, centerX, centerY, radius, message, subs) {
    if (subs) {
        var submsg = Array.prototype.slice.call(arguments, 4);
        message = String.format.apply(this, submsg);
    }
    // get the nearby entities
    var entities = area.getEntitiesWithinRadius(centerX, centerY, radius);
    // Iterate through nearby entities sending the message
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].isMessageRecipient) {
            entities[i].receiveMessage(message);
        }
    }
};



