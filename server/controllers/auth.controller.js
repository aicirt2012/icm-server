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
    if (!user) {
      res.status(401).send('Invalid Credentials');
      return;
    }
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch || err) {
        res.status(401).send('Wrong password');
      } else {
        const token = jwt.sign({
          user: {
            _id: user._id,
            username: user.username,
            email: user.email,
            google: user.google ? true : false,
            exchange: user.exchange ? true : false
          }
        }, config.jwt.secret, {
          expiresIn: config.jwt.expiresInSeconds
        });
        res.cookie('email-oauth', token); // TODO: change this to header
        res.status(200).json({
          token
        });
      }
    })
  });
}

function oauthCallback(req, res) {
  const token = jwt.sign({
    user: {
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  }, config.jwt.secret, {
    expiresIn: config.jwt.expiresInSeconds
  });
  res.cookie('email-oauth', token); // TODO: change this to header
  res.redirect(config.frontend);
}

export default {
  login,
  oauthCallback
};
