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
// TODO check if box = null;
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


BoxSchema.statics.deleteBoxById = (boxId)=>{
  return new Promise((resolve, reject)=>{
    Box.remove({_id: boxId})
      .then(()=>{
        return Email.remove({box: boxId});
      }) 
      .then(()=>{
        resolve()
      })
      .catch(err=>{
        reject(err);
      });
  });
}

BoxSchema.statics.getChildBoxesById = (boxId)=>{
  return new Promise((resolve, reject)=>{
    Box.find({parent: {$ne:null}},{_id:1,parent:1})
      .then(boxes=>{
        const map = new Map();
        boxes.forEach(box=>{
          if(map.has(box.parent+''))
            map.get(box.parent+'').push(box._id+'');
          else
            map.set(box.parent+'', [box._id+'']);          
        });        
        resolve(calcChilds(boxId, map));
      })
      .catch(err=>{
        reject(err);
      })
  })  

  function calcChilds(boxId, map){    
    let childIds = [];
    if(map.has(boxId))
      map.get(boxId).forEach(childId=>{
        childIds.push(childId);
        calcChilds(childId, map).forEach(cchildId=>{
          childIds.push(childId);
        });
      });   
    return childIds;
  }
}

BoxSchema.statics.getChildBoxesById2 = (boxId)=>{
  return new Promise((resolve, reject)=>{
    Box.find({parent:ObjectId(boxId)})
      .then(boxes=>{
        const childBoxIds = [];
        console.log('boxxxxxxxxxxxxxxxxxxes');
        Promise.each(boxes, box=>{
          childBoxIds.push(box._id);
          return Box.getChildBoxesById(box._id)
            .then(Ids=>{
              childBoxIds.concat(ids);
            });
        })
        .then(()=>{
          resolve(childBoxIds);
        });
      })
      .catch(err=>{
        reject(err);
      })
  })  
}
// move all emails to box trash and then delete box and then return promise




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
BoxSchema.statics.getBoxesByUserId = (userId) => {
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
