import mongoose from 'mongoose';
import Promise from 'bluebird';
import Email from './email.model';

mongoose.Promise = Promise;

const BoxSchema = new mongoose.Schema({
  boxId: Number,
  name: String,
  shortName: String,
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Box'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
}, {
  timestamps: true
});



BoxSchema.statics.updateAndGetOldAndUpdated = function (box, user) {
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
    const boxesInLevel = boxes.filter(a => {
      return a.level == level
    });
    boxesByLevel = boxesByLevel.concat(boxesInLevel);
  });

  return boxesByLevel;
}


BoxSchema.statics.findWithUnseenCountById = (boxId)=>{
  return new Promise((resolve, reject)=>{
    let b = null;
    Box.findOne({_id: boxId}, {_id:1, name:1, shortName: 1, parent:1, user:1})
      .lean()
      .then(box=>{
        b = box;
        return Email.count({box:boxId, flags: {$ne: "\\Seen"}});
      })
      .then(unseen=>{
        b.unseen = unseen;
        resolve(b);
      })
      .catch(err=>{
        reject(err);
      })
  });  
}

/** 
 * Lists all boxes of a user
 * with the number of unseen emails
 * @param userId 
 */
BoxSchema.statics.getBoxesByUser = (userId) => {
  return new Promise((resolve, reject) => {
    /*<boxId, box>*/
    const boxMap = new Map();
    Box.find({user: userId}, {_id:1, name:1, shortName: 1, parent:1}) //TODO remove name projection after refactoring
      .lean() 
      .then(boxes => {
        boxes.forEach(box => {
          box.unseen = 0;
          boxMap.set(box._id+'', box);
        });
        return Email.aggregate([
          {$match: {flags: {$ne: "\\Seen"}, user: userId}},
          {$group: {_id: '$box', unseen: {$sum: 1}}}
        ]);
      })
      .then(unseenBoxes => {
        /* merge unseen count with boxes*/
        unseenBoxes.forEach(box => {
          if(boxMap.has(box._id+''))
            boxMap.get(box._id+'').unseen = box.unseen;
        });
        resolve(Array.from(boxMap.values()));
      })
      .catch(err => {
        reject(err);
      })
  });
}


let Box = mongoose.model('Box', BoxSchema)
export default Box;
