import mongoose from 'mongoose';
import gridfs from 'mongoose-gridfs';

/** need to ba a function otherwise mongoose is not available for gridfs */
function Attachment() {
  return gridfs({
    collection: 'attachments',
    model: 'Attachment'
  }).model;
}

/**
 * @param fileName of attachment
 * @param contentType to deliver via http e.g. 'text/plain', ...
 * @param rs readStream e.g. fs.createReadStream('D:/test.txt')
 * @returns Promise that returns meta data of the created attachment
 */
function createAttachment(fileName, contentType, rs){
  return new Promise((resolve, reject)=>{
    Attachment().write({
        filename: fileName,
        contentType: contentType
      },
      rs,
      (err, attachment)=> {
        if(err){
          reject()
        }else{
          resolve(attachment)
        }
      }
    );
  });

}

function deleteAttachment(id){
  //TODO implement this
}

function findAttachment(id){
  return new Promise((resolve, reject)=>{
    Attachment().readById(id, function(err, content){
      if(err)
        reject(err);
      else
        resolve(content);
    });
  });
}


export default {
  create: createAttachment,
  find: findAttachment,
  delete: deleteAttachment
}
