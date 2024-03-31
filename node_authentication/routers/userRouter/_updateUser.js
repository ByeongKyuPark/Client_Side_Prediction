/**
 * "userRouter" calls this method to update a user (more of a private member function in c++)
 * @example userRouter.get('/', (req, res) => _getUserById(...));
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {RedisClient} redisClient 
 * @param {MongoDB collection} usersCollection 
 */
module.exports = async function (req, res, redisClient, usersCollection) {
    //1. session check
    const sessionInput = req.body["session"];
    if (sessionInput === undefined) {//invalid session input
        res.sendStatus(401);
        return;
    }
    //2. id check
    const idInput = req.params["id"];
    if (idInput === undefined) {//invalid id input
        res.sendStatus(400);
        return;
    }

    //3. retrieve session by sessionID
    let userIdBySessionInput = await redisClient
        .get(`sessions:${sessionInput}`)
        .catch((err) => {
            res.sendStatus(500);
        });
    if (userIdBySessionInput === null) {
        res.sendStatus(401);
        return;
    }

    //4. Update User
    if (userIdBySessionInput === idInput) {
        let query = { id: idInput };
        let setCommand = {
            $set: {
                username: req.body["username"],
                password: req.body["password"],
                avatar: req.body["avatar"]
            }
        };
        let setOptions = { upsert: true, returnDocument: 'after' };
        let userResult = await usersCollection.findOneAndUpdate(query, setCommand, setOptions);

        res.send(userResult.value);
    }
    else {//The user id to whom the session belongs does not correspond to the input id.
        //1) retrieve session by userID -  get look up
        let sessionIdByUserId = await redisClient
            .get(`sessionsIdsByUserId:${idInput}`)
            .catch((err) => {
                res.sendStatus(500);
            });
        //2) retrieve session by userID -  get session
        let userIdByUserIdInput = await redisClient
            .get(`sessions:${sessionIdByUserId}`)
            .catch((err) => {
                res.sendStatus(500);
            });
        if (userIdByUserIdInput == idInput ||
            userIdBySessionInput == idInput) {
            res.sendStatus(403);
        }
        else {
            res.sendStatus(404);
        }
    }
}