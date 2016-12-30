import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const PatternSchema = new mongoose.Schema({
  pattern: String,
  isDefault: Boolean
}, {
  timestamps: true
});

PatternSchema.method({});

export default mongoose.model('Pattern', PatternSchema);
