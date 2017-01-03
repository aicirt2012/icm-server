import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const TrainingDataSchema = new mongoose.Schema({
  text: String,
  label: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email'
  },
  sentenceId: Number,
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }
}, {
  timestamps: true
});

export default mongoose.model('TrainingData', TrainingDataSchema);
