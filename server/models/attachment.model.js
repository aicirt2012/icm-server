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
      new AttachmentModel({
        filename: filename,
        contentType: contentType
      }).save((err, attachment)=>{
        const writeStream = fs.createWriteStream(config.attachmentsPath+attachment._id);
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

  static findById(attachmentId, rs=true){
    return new Promise((resolve, reject)=>{
      AttachmentModel.find({_id: attachmentId}).lean().exec((err, attachment)=>{
        if(err)
          reject(err);
        else {
          if(rs)
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
