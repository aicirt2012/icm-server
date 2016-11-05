import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import APIError from '../helpers/APIError';
import User from '../models/user.model';

const config = require('../../config/env');

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  const error = new APIError('Authentication error', httpStatus.UNAUTHORIZED);

  User.findOne({
    username: req.body.username
  }, (err, user) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    if (!user) {
      return next(error);
    }
    if (user.password === req.body.password) {
      const token = jwt.sign({
        username: user.username
      }, config.jwt.secret, {
        expiresIn: config.jwt.expiresInSeconds
      });
      res.status(200).json({
        token,
        user: {
          username: user.username
        }
      });
      return;
    }

    return next(error);
  });
}

export default {
  login
};
