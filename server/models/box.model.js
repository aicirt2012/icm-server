import mongoose from 'mongoose';
import Promise from 'bluebird';
import Email from './email.model';

mongoose.Promise = Promise;

const BoxSchema = new mongoose.Schema({
  boxId: Number,
  name: String,
  shortName: String,
  level: Number,
  //parent: mongoose.Schema.Types.Mixed,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box'
  },
  unseen: Number,
  new: Number,
  total: Number,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
}, {
  timestamps: true
});


BoxSchema.statics.update2 = function (box, user) {
  return new Promise((resolve, reject) => {
    box.user = user._id;
    // find parent first
    Box.findOne({
      name: box.parent,
      user: box.user
    }, (err, parentBox) => {
      box.parent = parentBox;

      Box.findOneAndUpdate({
        name: box.name,
        user: box.user
      }, box, {
        new: false,
        upsert: true,
        setDefaultsOnInsert: true
      }, (err, boxOld) => {
        if (err) {
          reject(err);
        } else {
          Box.findOne({
            name: box.name,
            user: box.user
          }).then(boxUpdated => {
            resolve(boxOld, boxUpdated);
          });
        }
      });
    });
  });
}


BoxSchema.statics.sortByLevel = function (boxes, user) {
  const levels = [...new Set(boxes.map(box => box.level))];
  let boxesByLevel = [];

  levels.forEach((level) => {
    const boxesInLevel = boxes.filter(a => {return a.level == level});
    boxesByLevel = boxesByLevel.concat(boxesInLevel);
  });

  return boxesByLevel;
}


BoxSchema.statics.getBoxesByUser = (userId) => {
  return new Promise((resolve, reject)=>{
    /*<boxId, box>*/
    const boxMap = new Map();     
    Box.find({user: userId, parent:null}).populate('parent')      
      .then(boxes => {
      console.log(boxes);
        resolve(boxes);
      })
      .catch(err=>{
        reject(err);
      })
  });

  
  function calcUnseenMessages(userId){
    return Email.aggregate([
        {$match: {flags: "\\Unseen", user: userId}}, //TODO check if unssen is the right flag
        {$group: { _id: '$box', unseen: { $sum: 1 }}}
      ]);
  }

}



let Box = mongoose.model('Box', BoxSchema)

export default Box;
