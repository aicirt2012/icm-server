import mongoose from 'mongoose';
import Promise from 'bluebird';
import Email from './email.model';
const ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = Promise;

const BoxSchema = new mongoose.Schema({
  boxId: Number,
  name: String,
  shortName: String,
  parent: {type: ObjectId, ref: 'Box'},
  user: {type: ObjectId, ref: 'User'},
}, {
  timestamps: true
});


/**
 * TODO add unseen count with additional query
 * Updates or creates a box and 
 * returns the old and updated box
 * @param box
 * @return Promise ([oldBox, updatedBox])
 */
BoxSchema.statics.updateAndGetOldAndUpdated = (box, user) => {
  return new Promise((resolve, reject) => {
    const res = [];
    box.user = user._id;
    Box.findOne({name: box.parent, user: box.user})
      .then(parentBox => {
        box.parent = parentBox;
        return Box.findOneAndUpdate({
          name: box.name,
          user: box.user
        }, box, {
          new: false,
          upsert: true,
          setDefaultsOnInsert: true
        });
      })
      .then(boxOld => {
        res.push(boxOld);
        return Box.findOne({name: box.name, user: box.user});
      })
      .then(boxUpdated => {
        res.push(boxUpdated);
        resolve(res);
      })
      .catch(err=>{
        reject(err);
      });
  });
}


BoxSchema.statics.sortByLevel = (boxes, user) => {
  /*
  //TODO implement map approach
  const map = new Map();
  boxes.forEach(box=>{
    if(map.has(box.level))
      map.get(box.level).push(box);
    else  
      map.set(box.level, [box]);
  })
  // get keys -> sort keys -> iterate ove key values and concat
  */
   
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
    let box = null;
    Box.findOne({_id: boxId}, {_id:1, name:1, shortName: 1, parent:1, user:1})
      .lean()
      .then(baseBox=>{
        box = baseBox;
        return Email.count({box:boxId, flags: {$ne: "\\Seen"}});
      })
      .then(unseen=>{
        box.unseen = unseen;
        resolve(box);
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
