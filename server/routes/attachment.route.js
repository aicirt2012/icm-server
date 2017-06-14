import express from 'express';
import config from '../../config/env';
import attachmentCtrl from '../controllers/attachment.controller';

function routeProvider(passport) {
  const router = express.Router();
  // TODO hack this
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);

  router.route('/:attachmentId')
    .get(attachmentCtrl.getAttachment);

  return router;
}

export default routeProvider;
