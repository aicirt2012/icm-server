import express from 'express';
import importCtrl from '../controllers/import.controller';


function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });

  //TODO remove comment below - only for testing purpose
  //router.use(mw);

  router.route('/enron')
    .post(importCtrl.importEnronData);

  router.route('/enronall')
    .post(importCtrl.importEnronDataAll);

  return router;
}
export default routeProvider;
