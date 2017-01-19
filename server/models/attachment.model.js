import fs from 'fs';
import mongoose from 'mongoose';
import config from '../../config/env';

const AttachmentSchema = new mongoose.Schema({
  filename: String,
  contentType: String
});

const AttachmentModel = mongoose.model('Attachment', AttachmentSchema);


class Attachment {

  static create(filename, contentType, readStream){
    return new Promise((resolve, reject)=>{
      let a = new AttachmentModel({
        filename: filename,
        contentType: contentType
      });
      a.save((err, attachment)=>{
        let aId = attachment._id;
        var writeStream = fs.createWriteStream(config.attachmentsPath+aId);
        readStream.pipe(writeStream);
        writeStream.on('close', function () {
          resolve(attachment);
        });
        writeStream.on('error', function(err){
          throw new Error('Could not write attachment stream');
          reject(err);
        });
      });
    });
  }

  static removeById(attachmentId){
    return new Promise((resolve, reject)=>{
      AttachmentModel.remove({_id: attachmentId}, (err)=>{
        if(err) {
          throw new Error('Could not remove attachment');
          reject(err);
        }else{
          fs.unlinkSync(config.attachmentsPath+attachmentId);
          resolve();
        }
      });
    });
  }

  static findById(attachmentId){
    return new Promise((resolve, reject)=>{
      AttachmentModel.findById(attachmentId, (err, attachment)=>{
        if(err)
          reject(err);
        else {
          attachment.rs = fs.createReadStream(config.attachmentsPath+attachmentId);
          resolve(attachment);
        }
      });
    });
  }

  static getModel(){
    return AttachmentModel;
  }
}

export default Attachment
