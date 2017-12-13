import User from '../models/user.model';


/**
 * @api {get} /user/:id Get User
 * @apiDescription Get User Details
 * @apiName GetUser
 * @apiGroup User
 * @apiParam {String} id User unique ID.
 * @apiSuccessExample Success-Response:
 * {
 *     "_id": "5986e0ba96ff7909c86efbc0",
 *     "updatedAt": "2017-08-28T21:16:07.934Z",
 *     "createdAt": "2017-08-06T09:26:18.557Z",
 *     "password": "$2a$10$6Fy6hahanouuo33LxtGUUunSI3DqhhrR5adUWyDTt0FTeC6f1O.K2",
 *     "email": "felix.in.tum@gmail.com",
 *     "username": "Felix Michel",
 *     "__v": 0,
 *     "lastSync": "2017-08-28T21:16:02.235Z",
 *     "provider": {
 *         "name": "Gmail",
 *     }
 *     ...
 * }
 */
exports.get = (req, res, next) => {
  if (req.user._id != req.params.id)
    next(new Error('Can only get user of current JWT!'));
  else
    User.findOne({ _id: req.params.id }).exec()
      .then(user => {
        res.status(200).send(user);
      })
      .catch(err => {
        next(err);
      });
}

/**
 * @api {post} /user Post User
 * @apiDescription Create User
 * @apiName CreateUser
 * @apiGroup User
 * @apiParam {String} username First- and lastname of user.
 * @apiParam {String} email Email of user.
 * @apiParam {String} password Password of user.
 * @apiSuccessExample Success-Response:
 * {}
 */
exports.create = (req, res, next) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  });
  user.save()
    .then(user => {
      res.status(200).send(user);
    }).catch(err => {
    next(err);
  });
}

/**
 * @api {put} /user/:id Update User
 * @apiDescription Update User
 * @apiName UpdateUser
 * @apiGroup User
 * @apiSuccessExample Success-Response:
 * {}
 */
exports.update = (req, res, next) => {
  const provider = req.body.provider;
  if (req.user._id != req.params.id)
    next(new Error('Can only update user of current JWT!'));
  else {
    User.findOne({ _id: req.params.id }).exec()
      .then(user => {
        if (provider.name === 'Gmail') {
          user.emailProvider.gmail.user = provider.user;
          user.emailProvider.gmail.password = provider.password;
          user.emailProvider.gmail.host = provider.host;
          user.emailProvider.gmail.port = provider.port;
          user.emailProvider.gmail.smtpHost = provider.smtpHost;
          user.emailProvider.gmail.smtpPort = provider.smtpPort;
          user.emailProvider.gmail.smtpDomains = provider.smtpDomains;
          user.provider.name = 'Gmail';
        } else if (provider.name === 'Exchange') {
          user.emailProvider.exchange.user = provider.user;
          user.emailProvider.exchange.password = provider.password;
          user.emailProvider.exchange.host = provider.host;
          user.provider.name = 'Exchange';
        }
        return user.save();
      })
      .then(savedUser => {
        res.status(200).send(savedUser);
      })
      .catch(err => {
        next(err);
      });
  }
}


/**
 * @api {delete} /user/:id Delete User
 * @apiDescription Delete User
 * @apiName DeleteUser
 * @apiGroup User
 * @apiSuccessExample Success-Response:
 * {}
 */
exports.remove = (req, res, next) => {
  if (req.user._id != req.params.id)
    next(new Error('Can only delete user of current JWT!'));
  else
    User.removeById(req.params.id)
      .then(user => {
        res.status(200).send({ message: 'User deleted successfully!' });
      })
      .catch(err => {
        next(err);
      });
}
