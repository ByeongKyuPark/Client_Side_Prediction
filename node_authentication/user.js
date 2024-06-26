const base64url = require('base64url');

/**
 * A class representing a user
 * @property {String} id - ID generated by username
 * @property {String} username - unique username per object
 * @property {String} password - password
 * @property {String} avatar - avatar
 */
module.exports = class User {
    /** @constructor */
    constructor(username, password, avatar) {
        this.id = base64url(username);
        this.username = username;
        this.password = password;
        this.avatar = avatar;
    }
    /**
     *  returns the public info of a user object (excluding the password)
     *  @example res.json( user.public() );
     *  @returns {{id: String, username: String, avatar: String}} 
     */
    public() {
        return {
            "id": this.id,
            "username": this.username,
            "avatar": this.avatar
        };
    }

    /**
     *  returns the private & public info of a user object (including the password)
     *  @example res.json( user.private() );
     *  @returns {{id: String, password: String, username: String, avatar: String}} 
     */
    private() {
        return {
            "id": this.id,
            "password": this.password,
            "username": this.username,
            "avatar": this.avatar
        };
    }
}


/**
 * 1. encode the username, as the user ID
 * @example res.json(User.buildResult(user) , sessionId == idInput );
 * @param {String} mongodb user object
 * @param {boolean} is the session's user ID matches with that of the user ?
 * @returns {String} user data
 */
module.exports.buildResult = function (user, isOwner) {
    if (isOwner == true) { //session.id == user.id
        return {
            "id": user.id,
            "password": user.password,
            "username": user.username,
            "avatar": user.avatar
        };
    }
    return {
        "id": user.id,
        "username": user.username,
        "avatar": user.avatar
    };
}