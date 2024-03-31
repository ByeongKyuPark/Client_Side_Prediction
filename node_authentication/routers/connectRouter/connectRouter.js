const express = require('express');
const crypto = require('crypto');
/**
 * Route serving connect form (/api/v1/connect)
 * @param {RedisClient} redisClient 
 * @param {MongoDB collection} usersCollection 
 */
module.exports = (redisClient, usersCollection) => {

    const port = parseInt(process.env.GAME_PORT) || 4200;
    const secret = process.env.SHARED_SECRET || "CS261S21";

    let router = express.Router();

    /**
     *  The Connect API will furnish the replication client with the necessary information 
     * to locate the replication server and establish a secure connection.
     */
    router.post('/', async (req, res) => {
        //0.checks
        if (req.body.game_type === undefined) {
            res.sendStatus(400);
            return;
        }

        const sessionInput = req.body.session;
        if (sessionInput === undefined) {//invalid session input
            res.sendStatus(401);
            return;
        }

        //1. retrieve session by sessionID
        let userIdBySessionInput = await redisClient
            .get(`sessions:${sessionInput}`)
            .catch((err) => {
                res.sendStatus(500);
            });
        if (userIdBySessionInput === null) {
            res.sendStatus(401);
            return;
        }
        //2. Get User
        let query = { id: userIdBySessionInput };
        let user = await usersCollection.findOne(query);
        if (user === null) {
            res.sendStatus(404);
            return;
        }
        //3. create a token : username + avatar + game_type + secret
        let plaintextToken = user.username + user.avatar + req.body.game_type + secret;

        const token = crypto.createHash('sha256').update(plaintextToken).digest('base64');

        res.json({
            "username": user.username,
            "avatar": user.avatar,
            "game_port": port,
            "token": token
        });
    })

    return router;
}
