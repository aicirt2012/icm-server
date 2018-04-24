import mongoose from 'mongoose';
import util from 'util';
import config from './config/env';
import app from './config/express';
import Socket from './server/routes/socket';

const debug = require('debug')('EmailAppServer:index');

// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign

// plugin bluebird promise in mongoose
mongoose.Promise = Promise;

// connect to mongo db
mongoose.connect(config.mongoConnectionURL, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.mongoConnectionURL}`);
});

// print mongoose logs in dev env
if (config.mongooseDebug) {
  mongoose.set('debug', (collectionName, method, query, doc) => {
    debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent) {
  // listen on port config.apiPort
  app.listen(config.apiPort, () => {
    debug(`server started on port ${config.apiPort} (${config.env})`);
  });
}


process.on('uncaughtException', (err) => {
  console.log(err);
})

export default app;
