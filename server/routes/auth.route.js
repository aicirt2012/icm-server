import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import authCtrl from '../controllers/auth.controller';

function routeProvider(passport) {

  const router = express.Router();

  router.route('/login')
    .post(validate(paramValidation.login), authCtrl.login);

  router.route('/google').get(
    passport.authenticate('google', {
      scope: ['email', 'profile']
    }));

  router.route('/google/callback').get(
    passport.authenticate('google', {
      failureRedirect: '/login'
    }),
    (req, res) => {
      console.log(req.user);
      res.status(200).json({
        res: 'Yeah'
      });
    });

  return router;
}
export default routeProvider;
