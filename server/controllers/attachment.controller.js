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
exports.getAttachment = (req, res, next) => {
  Attachment.findById(req.params.attachmentId, true)
    .then(attachment => {
      res.writeHead(200, {'Content-Type': attachment.contentType});
      attachment.rs.pipe(res);
    })
    .catch((err) => {
      next(err);
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
exports.downloadAttachment = (req, res, next) => {
  Attachment.findById(req.params.attachmentId, true)
    .then(attachment => {
      res.writeHead(200, {
        "Content-Type": attachment.contentType,
        "Content-Disposition": "attachment; filename=" + attachment.filename
      });
      attachment.rs.pipe(res);
    })
    .catch(err => {
      next(err);
    });
}