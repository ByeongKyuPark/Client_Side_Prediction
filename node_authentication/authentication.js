const express = require("express");
const app = express();

let port = process.env.PORT;
if (port == null) {
  port = 3100;
}

const redis = require("redis");

//0. Routers
const loginRouter = require('./routers/loginRouter/loginRouter');
const userRouter = require('./routers/userRouter/userRouter');
const connectRouter = require('./routers/connectRouter/connectRouter');

//1. Get and Initialize RedisClient
const redisClient = redis.createClient(
  process.env.REDIS_PORT || 6379,
  process.env.REDIS_ADDRESS || '127.0.0.1'
);

//2. Get and Initialize a MongoClient
const MongoClient = require('mongodb').MongoClient;
const connectionString = process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017';
let mongoClient = new MongoClient(connectionString);
const db = mongoClient.db(process.env.MONGO_DB_NAME || 'authentication');
const usersCollection = db.collection(process.env.MONGO_COLLECTION_NAME || 'users');

app.use(express.json());

redisClient.on('error', err => console.log('Redis Client Error', err));
(async () => {
  await redisClient.connect();
})();

//(1).This router handles all login-related requests.
app.use('/api/v1/login', loginRouter(redisClient, usersCollection));

//(2). This router handles all user-related requests.
app.use('/api/v1/users', userRouter(redisClient, usersCollection));

//(3)/ This router handles all connect-related requests.
app.use('/api/v1/connect', connectRouter(redisClient, usersCollection));

app.listen(port, () => {
  console.log('started server at location', app.mountpath);
})
