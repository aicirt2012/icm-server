import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
const ObjectId = mongoose.Schema.Types.ObjectId;

const TaskSchema = new mongoose.Schema({
  taskId: String,
  provider: String,
  email: {type: ObjectId, ref: 'Email'},
  user: { type: ObjectId, ref: 'User'}, //TODO populate this field
  thrid: String
}, {
  timestamps: true
});

TaskSchema.method({});

TaskSchema.statics.removeByUserId = (userId) => {
  return Task.find({user:userId}).remove().exec();
}

let Task = mongoose.model('Task', TaskSchema);
export default Task;
