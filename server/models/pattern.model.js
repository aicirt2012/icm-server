import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const PatternSchema = new mongoose.Schema({
  pattern: String,
  isDefault: Boolean,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

PatternSchema.method({});

export default mongoose.model('Pattern', PatternSchema);
