/**
 * Created by jreel on 3/29/2015.
 */


Game.sendMessage = function(recipient, message) {
    if (recipient.isMessageRecipient) {
        recipient.receiveMessage(message);
    }
};

Game.sendMessageNearby = function (level, centerX, centerY, message) {
    // get the nearby entities
    var entities = level.getEntitiesWithinRadius(centerX, centerY, 5);
    // Iterate through nearby entities sending the message
    for (var i = 0; i < entities.length; i++) {
        if (entities[i].isMessageRecipient) {
            entities[i].receiveMessage(message);
        }
    }
};
