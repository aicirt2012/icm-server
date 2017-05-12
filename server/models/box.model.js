import mongoose from 'mongoose';
import Promise from 'bluebird';
import Email from './email.model';
import config from '../../config/env';
const ObjectId = mongoose.Schema.Types.ObjectId;
mongoose.Promise = Promise;

const BoxSchema = new mongoose.Schema({
  boxId: Number,
  ewsId: {type: String, index: true},
  ewsSyncState: String,
  name: {type: String, index: true},
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
    Box.findWithUnseen({name: box.name, user: box.user})
      .then(boxOld => {
        res.push(boxOld);
        return Box.findOne({name: box.parent, user: box.user});
      })
      .then(parentBox => {
        box.parent = parentBox ? parentBox._id : null;
        return Box.findOneAndUpdate({
          name: box.name,
          user: box.user
        }, box, {
          new: false,
          upsert: true,
          setDefaultsOnInsert: true
        });
      })
      .then(() => {
        return Box.findWithUnseen({name: box.name, user: box.user});
      })
      .then(boxUpdated => {
        res.push(boxUpdated);
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * Renames a box and returns the renamed box
 * @param boxId
 * @newName of Box
 * @return renamed box object with unseen count
 */
BoxSchema.statics.rename = (boxId, newName) => {
  return new Promise((resolve, reject) => {
    Box.findOne({_id: boxId})
      .then(box => {
        box.name = newName;
        box.shortName = box.name.substr(box.name.lastIndexOf('/') + 1, box.name.length);
        return box.save();
      })
      .then(box => {
        return Box.findWithUnseenCountById(box._id);
      })
      .then(box => {
        resolve(box);
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * Casecade deletes all boxes with child boxes that
 * have no later update than a certain date
 * @param userId
 * @param updateDate boxes with an updateAt
 * date less than updateDate are deleted
 */
BoxSchema.statics.deleteUpdatedAtOlderThan = (userId, updateDate) => {
  return new Promise((resolve, reject) => {
    let blist = [];
    Box.find({user: userId, updatedAt: {$lt: updateDate}})
      .then(boxes => {
        blist = boxes;
        return Promise.each(boxes, box => {
          return Box.cascadeDeleteBoxById(box._id, userId, true);
        })
      })
      .then(() => {
        resolve(blist);
      })
      .catch(err => {
        reject(err);
      })
  });
}

/**
 * Cascade deletes a box including the child
 * boxes with all related emails by boxId
 * @param boxId box to deleted
 * @param userId
 * @param delEmail if true then delete it otherwise move to trash
 * @return deleted boxIds
 */
BoxSchema.statics.cascadeDeleteBoxById = (boxId, userId, delEmails) => {
  return new Promise((resolve, reject) => {
    Box.getChildBoxesById(boxId)
      .then(boxIds => {
        boxIds.push(boxId);//TODO (minor) delete childs first therefore permute array
        Promise.each(boxIds, boxId => {
          return Box.deleteBoxById(boxId, userId, delEmails);
        })
          .then(() => {
            resolve(boxIds);
          });
      })
      .catch(err => {
        reject(err);
      })
  });
}

/**
 * Deletes a box with all related emails by boxId
 * @param userId
 * @param boxId box to deleted
 * @param delEmail if true then delete it otherwise move to trash
 */
BoxSchema.statics.deleteBoxById = (boxId, userId, delEmails) => {
  return new Promise((resolve, reject) => {
    Box.remove({_id: boxId})
      .then(() => {
        if (delEmails) {
          return Email.remove({box: boxId});
        } else {
          Box.findOne({name: config.gmail.deleted, user: userId})
            .then((trashBox) => {
              return Email.update({box: boxId}, {$set: {box: trashBox}});
            });
        }
      })
      .then(() => {
        resolve()
      })
      .catch(err => {
        reject(err);
      });
  });
}

/**
 * Calulates direct and indirect calcChilds
 * @param boxId that represents the root
 * @return [boxIds] ordered by deep search
 */
BoxSchema.statics.getChildBoxesById = (boxId) => {
  return new Promise((resolve, reject) => {
    Box.find({parent: {$ne: null}}, {_id: 1, parent: 1})
      .then(boxes => {
        const map = new Map();
        boxes.forEach(box => {
          if (map.has(box.parent + ''))
            map.get(box.parent + '').push(box._id + '');
          else
            map.set(box.parent + '', [box._id + '']);
        });
        resolve(calcChilds(boxId, map));
      })
      .catch(err => {
        reject(err);
      });
  });

  function calcChilds(boxId, map) {
    let childIds = [];
    if (map.has(boxId))
      map.get(boxId).forEach(childId => {
        childIds.push(childId);
        calcChilds(childId, map).forEach(cchildId => {
          childIds.push(childId);
        });
      });
    return childIds;
  }
}

BoxSchema.statics.findWithUnseenCountById = (boxId) => {
  return Box.findWithUnseen({_id: boxId});
}

BoxSchema.statics.findWithUnseen = (query) => {
  return new Promise((resolve, reject) => {
    let box = null;
    Box.findOne(query, {_id: 1, name: 1, shortName: 1, parent: 1, user: 1})
      .lean()
      .then(baseBox => {
        box = baseBox;
        return Email.count({box: baseBox, flags: {$ne: "\\Seen"}});
      })
      .then(unseen => {
        if (box)
          box.unseen = unseen;
        resolve(box);
      })
      .catch(err => {
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
    Box.find({user: userId}, {_id: 1, shortName: 1, parent: 1}) //TODO remove name projection after refactoring
      .lean()
      .then(boxes => {
        boxes.forEach(box => {
          box.unseen = 0;
          boxMap.set(box._id + '', box);
        });
        return Email.aggregate([
          {$match: {flags: {$ne: "\\Seen"}, user: userId}},
          {$group: {_id: '$box', unseen: {$sum: 1}}}
        ]);
      })
      .then(unseenBoxes => {
        /* merge unseen count with boxes*/
        unseenBoxes.forEach(box => {
          if (boxMap.has(box._id + ''))
            boxMap.get(box._id + '').unseen = box.unseen;
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
