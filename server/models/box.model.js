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
    const boxesInLevel = boxes.filter(a => {
      return a.level == level
    });
    boxesByLevel = boxesByLevel.concat(boxesInLevel);
  });

  return boxesByLevel;
}


BoxSchema.statics.getBoxesByUser = (userId) => {
  console.log('inside getBoxesByUser');
  return new Promise((resolve, reject) => {
    /*<boxId, box>*/
    const boxMap = new Map();
    Box.find({user: userId})
      .then(boxes => {
        console.log(boxes);
        boxes.forEach(box => {
          box.unseen = 0;
          if (box._id == '58c7b6e9116d2e549a316650') {
            console.log('fasdfsdfa');
            console.log(box);
          }
          boxMap.set(box._id, box);
        });
        return calcUnseenMessages(userId);
      })
      .then(unseenBoxes => {
        console.log('unseen');
        console.log(unseenBoxes);
        /* merge unseen count with boxes*/
        unseenBoxes.forEach(box => {
          console.log('HERE the map');
          console.log(boxMap);
          console.log(boxMap.keys());
          console.log('here the box info');
          console.log(box);
          console.log(box._id);
          console.log('why undefined?');
          console.log(boxMap.get(box._id));
          boxMap.get(box._id).unseen = box.unseen;
        });
        resolve(Array.from(boxMap.values()));
      })
      .catch(err => {
        reject(err);
      })
  });

  function calcUnseenMessages(userId) {
    return Email.aggregate([
      {$match: {flags: {$ne: "\\Seen"}, user: userId}}, //TODO check if unssen is the right flag
      {$group: {_id: '$box', unseen: {$sum: 1}}}
    ]);
  }

}

let Box = mongoose.model('Box', BoxSchema)

export default Box;
