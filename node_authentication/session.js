const uuid4 = require('uuid4')

/**
 * A class representing a session
 * @property {Number} id - the id of the user to whom the session belongs
 * @property {Number} session - a random session ID randomly generated
 *                              for each login by the server 
 */
module.exports = class Session {
    /** @constructor */
    constructor(userId) {
        this.id = userId;
        this.session = uuid4();
    }
}
/**
 * @returns Generate a random UUID for sessionID
 */
module.exports.generateSessionId = function () {
    return uuid4();
}