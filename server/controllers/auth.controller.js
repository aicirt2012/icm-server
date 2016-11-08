import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import config from '../../config/env';

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res) {
  User.findOne({
    username: req.body.username
  }, (err, user) => {
    if (err) {
      res.status(500).send(err);
      return;
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
  });
}

export default {
  login
};
