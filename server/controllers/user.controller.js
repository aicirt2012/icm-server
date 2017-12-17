import User from '../models/user.model';
import SCContactConnector from '../core/contact/SCContactConnector';


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
  User.findById(req.user._id)
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
 * @apiParam {String} username First- and LastName of user.
 * @apiParam {String} password Password of user.
 * @apiSuccessExample Success-Response:
 * {}
 */
exports.signUp = (req, res, next) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  user.save()
    .then(user => {
      res.status(200).send(user);
    })
    .catch(err => {
      if (err && err.code !== "E11000" )
        res.status(500).send("User name or email already exist!");
      else
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
  User.findById(req.user._id)
    .then(user => {
      if (provider.name === 'Gmail') {
        user.emailProvider.gmail.user = provider.user;
        user.emailProvider.gmail.password = provider.password;
        user.emailProvider.gmail.host = provider.host;
        user.emailProvider.gmail.port = provider.port;
        user.emailProvider.gmail.smtpHost = provider.smtpHost;
        user.emailProvider.gmail.smtpPort = provider.smtpPort;
        user.emailProvider.gmail.smtpDomains = provider.smtpDomains;
        user.provider = 'Gmail';
      } else if (provider.name === 'Exchange') {
        user.emailProvider.exchange.user = provider.user;
        user.emailProvider.exchange.password = provider.password;
        user.emailProvider.exchange.host = provider.host;
        user.provider = 'Exchange';
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


/**
 * @api {delete} /user/:id Delete User
 * @apiDescription Delete User
 * @apiName DeleteUser
 * @apiGroup User
 * @apiSuccessExample Success-Response:
 * {}
 */
exports.remove = (req, res, next) => {
  User.removeById(req.user._id)
    .then(user => {
      res.status(200).send({ message: 'User deleted successfully!' });
    })
    .catch(err => {
      next(err);
    });
}

/**
 * @api {post} /users/me/provider/exchange/gmail Set Mail Provider Exchange
 * @apiDescription Set Exchange Provider
 * @apiName SetExchangeProvider
 * @apiGroup User
 * @apiSuccessExample Success-Response:
 * {}
 */
exports.setEmailProviderExchange = (req, res, next) => {   
  
 User.findById(req.user._id)
   .then(user => {
      user.emailProvider.gmail = {
        user: req.body.user,
        password: req.body.password,
        host: req.body.host,
      }
      user.provider = 'Exchange';
      return user.save();
   })
   .then(user=>{
     res.status(200).send({message: 'Successfully set Exchange configuration!'}); 
   })
   .catch(err => {
     next(err);
   });         
}


/**
 * @api {post} /users/me/provider/email/gmail Set Mail Provider GMail
 * @apiDescription Set GMail Provider
 * @apiName SetGMailProvider
 * @apiGroup User
 * @apiSuccessExample Success-Response:
 * {}
 */
exports.setEmailProviderGMail = (req, res, next) => {   
   
  User.findById(req.user._id)
    .then(user => {
      user.emailProvider.gmail = {
        user: req.body.user,
        password: req.body.password,
        host: req.body.host,
        port: req.body.port,
        smtpHost: req.body.smtpHost,
        smtpPort: req.body.smtpPort,
        smtpDomains: req.body.smtpDomains,
      }
      user.provider = 'Gmail';
      return user.save();
    })
    .then(user=>{
      res.status(200).send({message: 'Successfully set GMail configuration!'}); 
    })
    .catch(err => {
      next(err);
    });         
}


/**
 * @api {post} /users/me/provider/contacts/sociocortex Set SocioCortex Contact Provider
 * @apiDescription Set SocioCortex Contact Provider
 * @apiName ContactProviderSocioCortex
 * @apiGroup User
 * @apiSuccessExample Success-Response:
 * {}
 */
exports.setContactProviderSocioCortex = (req, res, next) => {   

  const isEnabled = req.body.isEnabled;
  const email = req.body.email;
  const password = req.body.password;
  const baseURL = req.body.baseURL;
  
  SCContactConnector.test(isEnabled, baseURL, email, password)
    .then(isWorking=>{
      if(!isWorking)
        res.status(500).send({message: 'SocioCortex contact provider settings - connection test failed!'}); 
      else
        User.findById(req.user._id)
          .then(user => {
            user.contactProvider.socioCortex = {
              isEnabled: isEnabled,
              email: email,
              password: password,
              baseURL: baseURL
            }
            return user.save();
          })
          .then(user=>{
            res.status(200).send({message: 'SocioCortex contact provider settings successfully updated!'}); 
          })
          .catch(err => {
            next(err);
          });
    });    
}

