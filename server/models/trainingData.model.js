import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
const ObjectId = mongoose.Schema.Types.ObjectId;

const TrainingDataSchema = new mongoose.Schema({
  text: String,
  label: Boolean,
  user: {type: ObjectId, ref: 'User'},
  email: {type: ObjectId, ref: 'Email'},
  sentenceId: Number,
  task: {type: ObjectId, ref: 'Task'}
}, {
  timestamps: true
});

TrainingDataSchema.statics.removeByUserId = (userId) => {
  return TrainingData.find({user:userId}).remove().exec();
}

let TrainingData = mongoose.model('TrainingData', TrainingDataSchema);
export default TrainingData;