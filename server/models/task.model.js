import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const TaskSchema = new mongoose.Schema({
  taskId: String,
  provider: String,
  email: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Email'
  }
}, {
  timestamps: true
});

TaskSchema.method({});

export default mongoose.model('Task', TaskSchema);
