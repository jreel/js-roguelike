/**
 * Created by jreel on 3/29/2015.
 */

Game.sendMessage = function(recipient, message, subs) {
    if (recipient.isMessageRecipient) {
        if (subs) {
            var submsg = Array.prototype.slice.call(arguments, 1);
            message = String.format.apply(this, submsg);
        }
        recipient.receiveMessage(message);
    }
};

Game.sendMessageNearby = function (level, centerX, centerY, message, subs) {
    if (subs) {
        var submsg = Array.prototype.slice.call(arguments, 3);
        message = String.format.apply(this, submsg);
    }
    // get the nearby entities
    var entities = level.getEntitiesWithinRadius(centerX, centerY, 5);
    // Iterate through nearby entities sending the message
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].isMessageRecipient) {
            entities[i].receiveMessage(message);
        }
    }
};
