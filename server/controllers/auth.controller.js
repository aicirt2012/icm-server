import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import config from '../../config/env';

/**
 * Returns jwt token if valid username and password is provided
 */
exports.login = (req, res) => {
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
        const token = exports.createToken(req.user);
        res.cookie('email-oauth', token); // TODO: @Paul change this to header
        res.status(200).json({
          token
        });
      }
    })
  });
}

exports.createToken = (user) => {
  return jwt.sign({
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
}

exports.oauthCallback = (req, res) => {
  const token = exports.createToken(req.user);
  res.cookie('email-oauth', token); // TODO: @Paul change this to header
  res.redirect(config.frontend + '?jwt=' + token);
}