import mongoose from 'mongoose';
import Promise from 'bluebird';

mongoose.Promise = Promise;

const BoxSchema = new mongoose.Schema({
    boxId: Number,
    name: String,
    shortName: String,
    level: Number,
    parent: mongoose.Schema.Types.Mixed,
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



BoxSchema.method({});

BoxSchema.statics.update2 = function (box, user) {
  return new Promise((resolve, reject) => {
    console.log('--> update2');
    console.log(box);
    box.user = user;
    console.log(box);
    Box.findOneAndUpdate({
      boxId: box.id,
    }, box, {
      new: false,
      upsert: true,
      setDefaultsOnInsert: true
    }, (err, boxOld) => {
      if (err) {
        reject(err);
      } else {
        Box.findOne({
          boxId: box.id
        }).then(boxUpdated => {
          resolve(boxOld, boxUpdated);
        });
      }
    });
  });
}

let Box = mongoose.model('Box', BoxSchema)

export default Box;
