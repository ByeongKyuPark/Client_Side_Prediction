const User = require('../../user.js');
/**
 * "userRouter" calls this method to get a user with a specific ID (more of a private member function in c++)
 * @example userRouter.get('/', (req, res) => _getUserById(...));
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {RedisClient} redisClient 
 * @param {MongoDB collection} usersCollection 
*/
module.exports = async function (req, res, redisClient, usersCollection) {
    let userIdBySession = await redisClient
        .get(`sessions:${req.body["session"]}`)
        .catch((err) => {
            res.sendStatus(500);
        });
    if (!userIdBySession) {//unregistered session
        res.sendStatus(401);
        return;
    }

    let query = { id: req.params["id"] };
    let user = await usersCollection.findOne(query);
    if (user === null) {
        res.sendStatus(404);
        return;
    }

    res.json(User.buildResult(user, userIdBySession === req.params["id"]));
}