const User = require('../../user.js');
/**
 * "userRouter" calls this method to create a user (more of a private member function in c++)
 * @example userRouter.post('/', (req, res) => { _createUser(...);});
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 * @param {MongoDB collection} usersCollection 
 */
module.exports = async function (req, res, usersCollection) {

    let query = { username: req.body["username"] };
    let user = await usersCollection.findOne(query);
    if (user) {//exist
        res.sendStatus(409);
        return;
    }

    const newUser = new User(req.body["username"], req.body["password"], req.body["avatar"]);
    let userResult = await usersCollection.insertOne(newUser.private());
    if (userResult.acknowledged == false) {
        res.sendStatus(400);
        return;
    }
    res.json(newUser.private());
}
