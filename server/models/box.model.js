import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';

const BoxSchema = new mongoose.Schema({
    box: {
        id: Number,
        name: String,
        shortName: String,
        level: Number,
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Box'
        },
        unseen: Number,
        new: Number,
        total: Number,
    },
});
BoxSchema.method({});

export default mongoose.model('Box', BoxSchema);