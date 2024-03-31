module.exports = {
  apps : [{
  name: 'Authentication',
  script: 'authentication.js',
  instances: 1,
  autorestart: true,
  max_memory_restart: '1G',
  watch: false,
  env: {
        LISTEN_PORT: '3100',
        MONGO_CONNECTION_STRING: 'mongodb://localhost:27017',
        MONGO_DATABASE_NAME: 'authentication',
        MONGO_COLLECTION_NAME: 'users',
        REDIS_ADDRESS: '127.0.0.1',
        REDIS_PORT: '6379',
        REDIS_EXPIRATION_DURATION: '10',
        GAME_PORT: '4200',
        SHARED_SECRET: 'BK_SHARED_SCRET',
  }
}],


  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
