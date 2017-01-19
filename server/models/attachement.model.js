import mongoose from 'mongoose';
import gridfs from 'mongoose-gridfs';


const Attachment = gridfs({
  collection:'attachments',
  model:'Attachment'
}).model;

/**
 * @param fileName of attachment
 * @param contentType to deliver via http e.g. 'text/plain', ...
 * @param rs readstream e.g. fs.createReadStream('D:/test.txt')
 * @returns Promise that returns meta data of the created attachement
 */
function createAttachment(fileName, contentType, rs){
  return new Promise((resolve, reject)=>{
    Attachment.write({
        filename: fileName,
        contentType: contentType
      },
      rs,
      (err, attachement)=> {
        if(err){
          reject()
        }else{
          resolve(attachement)
        }
      }
    );
  });
}

function deleteAttachment(id){
  //TODO implement this
}

function findAttchment(id){
  //TODO implement this
}


export default {
  create: createAttachment,
  find: findAttchment,
  delete: deleteAttachment
}
