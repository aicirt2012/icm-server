import fs from 'fs';
import mongoose from 'mongoose';
import config from '../../config/env';

let AttachmentSchema = new mongoose.Schema({
  filename: String,
  contentType: String
});

AttachmentSchema.methods.saveMetadataAndFile = function(readStream){
  return new Promise((resolve, reject)=>{
    this.save((err, attachment)=>{
      let aId = attachment._id;
      var writeStream = fs.createWriteStream(config.attachmentsPath+aId, { flags : 'w'});
      readStream.pipe(writeStream);
      writeStream.on('close', function () {
        resolve();
      });
      writeStream.on('error', function(err){
        throw new Error('Could not write attachment stream');
        reject(err);
      });
    });
  });
}



export default mongoose.model('Attachment', AttachmentSchema);
