import fs from 'fs';
import mongoose from 'mongoose';
import config from '../../config/env';
const ObjectId = mongoose.Schema.Types.ObjectId;

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  contentType: String,
  contentId: String,
  contentDispositionInline: Boolean,
  user: { type: ObjectId, ref: 'User'}
});

const AttachmentModel = mongoose.model('Attachment', AttachmentSchema);


class Attachment {

  static create(filename, contentId, contentType, contentDispositionInline, readStream) {
    return new Promise((resolve, reject) => {
      new AttachmentModel({
        filename: filename,
        contentId: contentId,
        contentType: contentType,
        contentDispositionInline: contentDispositionInline
      }).save((err, attachment) => {
        const writeStream = fs.createWriteStream(config.attachmentsPath + attachment._id);
        readStream.pipe(writeStream);
        writeStream.on('close', function () {
          resolve(attachment);
        });
        writeStream.on('error', function (err) {
          throw new Error('Could not write attachment stream');
          reject(err);
        });
      });
    });
  }

  static removeById(attachmentId) {
    return new Promise((resolve, reject) => {
      AttachmentModel.remove({_id: attachmentId}, (err) => {
        if (err) {
          throw new Error('Could not remove attachment');
          reject(err);
        } else {
          fs.unlinkSync(config.attachmentsPath + attachmentId);
          resolve();
        }
      });
    });
  }
    
  static removeByUserId(userId) {
    return new Promise((resolve, reject) => {
      AttachmentModel.find({user: userId})
        .then(attachments => {
          return Promise.map(attachments, attachment=>{
            return Attachment.removeById(attachment._id);
          });
        });
    });
  }

  static findById(attachmentId, rs = true) {
    return new Promise((resolve, reject) => {
      // TODO find only one result
      AttachmentModel.find({_id: attachmentId}).lean().exec((err, attachment) => {
        if (err) {
          reject(err);
        } else {
          if (rs) {
            console.log('inside findById');
            attachment[0].rs = fs.createReadStream(config.attachmentsPath + attachmentId);
            resolve(attachment[0]);
          }
        }
      });
    });
  }

  static getModel() {
    return AttachmentModel;
  }
}

export default Attachment;
