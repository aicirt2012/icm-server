import Attachment from '../models/attachment.model'

function getAttachment(req, res) {
  Attachment.findById(req.params.attachmentId, true)
    .then((data) => {
      res.writeHead(200, {'Content-Type': data.contentType});
      data.rs.pipe(res);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

function downloadAttachment(req, res) {
  Attachment.findById(req.params.attachmentId, true)
    .then((data) => {
      res.writeHead(200, {
        "Content-Type": data.contentType,
        "Content-Disposition": "attachment; filename=" + data.filename
      });
      data.rs.pipe(res);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

export default {
  getAttachment,
  downloadAttachment
};
