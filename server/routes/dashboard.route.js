import express from 'express';
import dashboardCtrl from '../controllers/dashboard.controller';


function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });

  //TODO remove comment below - only for testing purpose
  //router.use(mw);

  /** GET /api/dashboard - Protected route */
  router.route('/summary')
      .get(dashboardCtrl.getSummary);

  return router;
}

export default routeProvider;
