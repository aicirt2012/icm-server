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

    Attachment.create('mymetadata', 'doer', fs.createReadStream('D:/test.txt'));
    //Attachment.removeById('58813d349eae471390027407');
    Attachment.findById('58814594fd0327214884ca7c')
      .then(a=>{
        console.log(a);
      });
    res.status(200).send();

  });

  return router;
}

export default routeProvider;
