import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const EmailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messageId: String,
  uid: Number,
  box: mongoose.Schema.Types.Mixed,
  thrid: mongoose.Schema.Types.Mixed,
  attrs: mongoose.Schema.Types.Mixed,
  from: [{
    address: String,
    name: String
  }],
  to: [{
    address: String,
    name: String
  }],
  subject: String,
  html: String,
  text: String,
  date: Date,
  flags: [String],
  labels: [String],
  tasks: [{
    id: {
      type: String
    },
    provider: {
        type: String
    },
    date: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

EmailSchema.plugin(mongoosePaginate);
// TODO: add index for To and From
EmailSchema.index({
  text: 'text',
  subject: 'text'
});

EmailSchema.method({});

export default mongoose.model('Email', EmailSchema);
