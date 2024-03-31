const User = require('../../user.js');
/**
 * "userRouter" calls this method to find a user with a certain name (more of a private member function in c++)
 * @example userRouter.get('/', (req, res) => _findUserByName(...));
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

    if (!userIdBySession) {//null
        res.sendStatus(401);
        return;
    }

    const inputUsername = req.query["username"];
    if (inputUsername === undefined) {//invalid username input
        res.sendStatus(400);
        return;
    }

    let query = { username: inputUsername };
    let user = await usersCollection.findOne(query);
    if (!user) {//unregistered
        res.sendStatus(404);
        return;
    }
    res.json(User.buildResult(user, userIdBySession === user.id));
}