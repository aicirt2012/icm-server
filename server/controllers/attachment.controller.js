import Attachment from '../models/attachment.model'

function getAttachment(req, res) {
  console.log('getAttachment....');
  Attachment.findById(req.params.attachmentId, true)
    .then((data) => {
      console.log('get attachment');
      console.log(data);

      res.writeHead(200, {'Content-Type': data.contentType});
      data.rs.pipe(res);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).send(err);
    });
}

export default {
  getAttachment
};
