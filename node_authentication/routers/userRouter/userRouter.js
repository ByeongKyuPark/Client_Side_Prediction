const express = require('express');

const _createUser = require('./_createUser.js');        //1
const _findUserByName = require('./_findUserByName.js');//2
const _updateUser = require('./_updateUser');           //3
const _getUserById = require('./_getUserById.js');      //4

/**
 * Route serving user posting, finding, updating, and getting
 * @param {RedisClient} redisClient 
 * @param {MongoDB collection} usersCollection 
 */
module.exports = (redisClient, usersCollection) => {

    let userRouter = express.Router();

    //1.create user
    userRouter.post('/', async (req, res) => {
        await _createUser(req, res, usersCollection);
    });

    //2.get user      (by id)
    userRouter.get('/:id', async (req, res) => {
        await _getUserById(req, res, redisClient, usersCollection);
    });

    //3.find user     (by name)
    userRouter.get('/', async (req, res) => {
        await _findUserByName(req, res, redisClient, usersCollection);
    });

    //4.update
    userRouter.put('/:id', async (req, res) => {
        await _updateUser(req, res, redisClient, usersCollection);
    });

    return userRouter;
} 
