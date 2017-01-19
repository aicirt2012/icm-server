import express from 'express';
import Attachment from '../models/attachement.model';
import fs from 'fs';

function routeProvider(passport) {
  const router = express.Router();
  const mw = passport.authenticate('jwt', {
    session: false
  });
 // router.use(mw);

  router.route('/attach').get((req, res)=>{
    Attachment.create('Test.txt', 'Text/plain', fs.createReadStream('D:/test.txt'))
      .then(file=>{
        console.log(file);
        return Attachment.find(file._id);
      })
      .then(strea=>{
        console.log(strea.toString());

      });
    res.status(200).send();
  });

  return router;
}

export default routeProvider;
