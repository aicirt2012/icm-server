import mongoose from 'mongoose';

const BoxSchema = new mongoose.Schema({
    _id: Number,
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

BoxSchema.statics.update2 = function(box){
    return new Promise((resolve, reject) => {
      Box.findOneAndUpdate({
        _id: box.id
      }, mail, {
        new: false,
        upsert: true,
        setDefaultsOnInsert: true
      }, (err, boxOld) => {
        if (err) {
          reject(err);
        }else{
          Box.findOne({
            _id: box.id
          }).then(boxUpdated=>{        
            resolve(boxOld, boxUpdated);
          });   
        }   
      });
    });
}



export default mongoose.model('Box', BoxSchema);