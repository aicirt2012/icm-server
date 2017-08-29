import Attachment from '../models/attachment.model'

/**
 * @api {get} /attachment/:id Get Attachment
 * @apiDescription Pipes Attachment
 * @apiName AttachmentPipe
 * @apiGroup Attachment
 * @apiParam {String} id Attachment unique ID.
 * @apiSuccessExample Success-Response:
 * {}
 */
exports.getAttachment = (req, res) => {
  Attachment.findById(req.params.attachmentId, true)
    .then((data) => {
      res.writeHead(200, {'Content-Type': data.contentType});
      data.rs.pipe(res);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
}

/**
 * @api {get} /attachment/:id/download Download Attachment
 * @apiDescription Download Attachment
 * @apiName AttachmentDownload
 * @apiGroup Attachment
 * @apiParam {String} id Attachment unique ID.
 * @apiSuccessExample Success-Response:
 * {}
 */
exports.downloadAttachment = (req, res) => {
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