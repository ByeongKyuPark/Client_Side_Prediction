const express = require('express');
const Session = require('../../session.js');

/**
 * Route serving login form (/api/v1/login)
 * @param {RedisClient} redisClient 
 * @param {MongoDB collection} usersCollection 
 */
module.exports = (redisClient, usersCollection) => {
    let router = express.Router();

    /**
     * Creates a session for the user provided, if the user exists and the password matches.  
     * Only one session is active per user.
     */
    router.post('/', async (req, res) => {
        let password = req.body.password;
        let query = { username: req.body["username"] };
        let user = await usersCollection.findOne(query);

        if (!user) {//already exist
            res.sendStatus(400);
            return;
        }
        if (user.password !== password) {
            res.sendStatus(403);
            return;
        }

        //1. check lookup
        let sessionIdByUserId = await redisClient
            .get(`sessionsIdsByUserId:${user.id}`)
            .catch((err) => {
                res.sendStatus(500);
            });
        if (sessionIdByUserId !== null) {//not in lookup

            let oldSessionUserId = await redisClient
                .get(`sessions:${sessionIdByUserId}`)
                .catch((err) => {
                    res.sendStatus(500);
                });
            if (oldSessionUserId !== null
                && oldSessionUserId === user.id) { //if session exists
                await redisClient.del(`sessions:${sessionIdByUserId}`); //delete session
                await redisClient.del(`sessionsIdsByUserId:${user.id}`); //delete lookup
            }
        }

        //(1) create a new session
        const sessionId = Session.generateSessionId();
        await redisClient
            .set(`sessions:${sessionId}`, user.id)
            .catch((err) => {
                res.sendStatus(500);
            });
        const expiration = process.env.REDIS_EXPIRATION_DURATION || 10;//seconds
        redisClient.expire(`sessions:${sessionId}`, expiration);

        //(2) create lookup
        await redisClient
            .set(`sessionsIdsByUserId:${user.id}`, sessionId)
            .catch((err) => {
                res.sendStatus(500);
            });

        res.json({ 'session': sessionId });
    })

    return router;
}
