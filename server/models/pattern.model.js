import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
const ObjectId = mongoose.Schema.Types.ObjectId;

const PatternSchema = new mongoose.Schema({
  pattern: String,
   isRegex : Boolean,
   user: { type: ObjectId, ref: 'User'}
}, {
  timestamps: true
});

PatternSchema.method({});

PatternSchema.statics.removeByUserId = (userId) => {
  return Pattern.find({user:userId}).remove().exec();
}

let Pattern = mongoose.model('Pattern', PatternSchema);
export default Pattern;
