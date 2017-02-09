import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const EmailSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    messageId: String,
    uid: Number,
    box: {
        id: Number,
        name: String,
        shortName: String,
        level: Number,
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'box'
        },
        unseen: Number,
        new: Number,
        total: Number,
    },
    thrid: String,
    attrs: {
        'x-gm-thrid': String,
        'x-gm-msgid': String,
        modseq: String,
        uid: Number,
        flafs: [String],
        date: Date,
        struct: [{
            language: mongoose.Schema.Types.Mixed,
            disposition: mongoose.Schema.Types.Mixed,
            md5: mongoose.Schema.Types.Mixed,
            lines: Number,
            size: Number,
            encoding: String,
            description: mongoose.Schema.Types.Mixed,
            id: mongoose.Schema.Types.Mixed,
            params: {
                boundary: String
            },
            subtype: String,
            type: String,
            partID: String,
        }],
        'x-gm-labels': [String]
    },
    from: [{
        address: String,
        name: String
    }],
    to: [{
        address: String,
        name: String
    }],
    cc: [{
        address: String,
        name: String
    }],
    bcc: [{
        address: String,
        name: String
    }],
    subject: String,
    html: String,
    text: String,
    date: Date,
    flags: [String],
    labels: [String]
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