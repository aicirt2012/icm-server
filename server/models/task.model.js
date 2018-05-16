import mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;

const TaskSchema = new mongoose.Schema({
  provider: String,
  providerId: String,
  user: {type: ObjectId, ref: 'User'}, //TODO check if field population necessary and implement
  threadId: String,
  email: {type: ObjectId, ref: 'Email'}, //TODO check if field population necessary and implement

  // --- deprecated fields, will be removed in future
  taskId: String, // deprecated provider id, TODO fade-out this field
  thrid: String, // deprecated thread id, TODO fade-out this field

  // --- fields that are used but commented out on purpose so they don't get persisted to DB (mongoDB strict mode)
  // parameters: [{
  //   name: String,
  //   type: String,
  //   constraints: String,
  //   value: Object,
  //   defaultValues: [Object],
  //   isRequired: Boolean
  // }],
}, {
  timestamps: true
});

TaskSchema.method({});

TaskSchema.statics.removeByUserId = (userId) => {
  return Task.find({user: userId}).remove().exec();
};

TaskSchema.statics.fromProvider = (providerTask, email, user) => {
  const task = new Task();
  task.provider = providerTask.provider;
  task.providerId = providerTask.providerId;
  task.parameters = providerTask.parameters;
  task.user = user._id;
  task.email = email._id;
  task.threadId = email ? email.thrid : null;
  return task;
};

let Task = mongoose.model('Task', TaskSchema);
export default Task;
