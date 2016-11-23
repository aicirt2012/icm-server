import mongoose from 'mongoose';

const EmailSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messageId: String,
  uid: Number,
  box: String,
  thrid: Number,
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
    date: {
      type: Date
    }
  }]
}, {
  timestamps: true
});

EmailSchema.method({
  toClient: () => {
    let obj = this.toObject();
    obj.id = obj._id;
    obj.date = obj.date.toISOString();
    delete obj._id;
    return obj;
  }
});

export default mongoose.model('Email', EmailSchema);
