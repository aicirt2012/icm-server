import mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;

const TaskSchema = new mongoose.Schema({
  taskId: String, // deprecated provider id, TODO fade-out this field
  provider: String,
  providerId: String,
  user: {type: ObjectId, ref: 'User'}, //TODO check if field population necessary and implement
  email: {type: ObjectId, ref: 'Email'}, //TODO check if field population necessary and implement
  thrid: String, // deprecated thread id, TODO fade-out this field
  threadId: String,
  parameters: [{
    name: String,
    type: String,
    constraints: String,
    value: Object,
    defaultValues: [Object],
    isRequired: Boolean
  }],
}, {
  timestamps: true
});

TaskSchema.method({});

TaskSchema.statics.removeByUserId = (userId) => {
  return Task.find({user: userId}).remove().exec();
};

let Task = mongoose.model('Task', TaskSchema);
export default Task;
