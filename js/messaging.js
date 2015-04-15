/**
 * Created by jreel on 3/29/2015.
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

Game.sendMessageNearby = function(level, centerX, centerY, radius, message, subs) {
    if (subs) {
        var submsg = Array.prototype.slice.call(arguments, 4);
        message = String.format.apply(this, submsg);
    }
    // get the nearby entities
    var entities = level.getEntitiesWithinRadius(centerX, centerY, radius);
    // Iterate through nearby entities sending the message
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].isMessageRecipient) {
            entities[i].receiveMessage(message);
        }
    }
};


/*
Game.sendMessage = function(msgType, recipient, message, subs) {
    if (recipient.isMessageRecipient) {
        if (subs) {
            var submsg = Array.prototype.slice.call(arguments, 2);
            message = String.format.apply(this, submsg);
        }
        recipient.receiveMessage(message);
    }
};
*/


