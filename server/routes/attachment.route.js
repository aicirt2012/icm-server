import express from 'express';
import config from '../../config/env';
import attachmentCtrl from '../controllers/attachment.controller';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
  router.use(mw);

  router.route('/:attachmentId')
    .get(attachmentCtrl.getAttachment);

  router.route('/:attachmentId/download')
    .get(attachmentCtrl.downloadAttachment);

  return router;
}

export default routeProvider;
