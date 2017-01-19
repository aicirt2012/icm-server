import express from 'express';
import fs from 'fs';
import Attachment from '../models/attachment.model';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
 // router.use(mw);

  router.route('/attach').get((req, res)=>{

    //Attachment.create('mymetadata', 'doer', fs.createReadStream('D:/test.txt'));
    //Attachment.removeById('58813d349eae471390027407');
    Attachment.findById('58813d7055373d1d2091955f')
      .then(a=>{
        console.log(a.getReadStream());
      });
    res.status(200).send();

  });

  return router;
}

export default routeProvider;
