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
 *     "highestmodseq": "15820",
 *     "lastSync": "2017-08-28T21:16:02.235Z",
 *     "google": {
 *         "googleId": "110833890801655058669",
 *         "googleAccessToken": "ya29.Gl2fBDqbAHTl16Ni3ViJEqTMQDNQ6dQH2wnpa7BuhqH0QmeDqgpKyLm6cgLTkpwahjZeHcEMIwj4xySCVR82NK_yA6gZoPhIkpSO5jooQ_NjWpaCCmyY9eRppl0Jk-0"
 *     },
 *     "provider": {
 *         "name": "Gmail",
 *         "user": "felix.in.tum@gmail.com",
 *         "password": "hYW7qHj9sfBkvyzVt2jW",
 *         "host": "imap.gmail.com",
 *         "port": 993,
 *         "smtpHost": "smtp.gmail.com",
 *         "smtpPort": 465,
 *         "smtpDomains": [
 *             "gmail.com",
 *             "googlemail.com"
 *         ]
 *     }
 * }
 */
exports.get = (req, res, next) => {
  if(req.user._id != req.params.id)
    next(new Error('Can only get user of current JWT!'));
  else
    User.findOne({_id: req.params.id}).exec()
      .then(user => {
        res.status(200).send(user);
      })
      .catch(err=>{
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
  if(req.user._id != req.params.id)
    next(new Error('Can only update user of current JWT!'));
  else
    User.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}).exec()
      .then(user => {
        res.status(200).send(user);
      }).catch(err=>{
        next(err); 
      });
}


exports.remove = (req, res, next) => {
  //TODO remove all emails and all related stuff
  User.findByIdAndRemove(req.params.id)
    .then((user, err) => {
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send(err);
      }
    })
}
