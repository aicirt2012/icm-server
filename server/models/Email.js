var mongoose = require('mongoose');

var emailSchema = new mongoose.Schema ({
    from: {
        address: String,
        name: String
    },
    html: String,
    text: String,
    date: Date
});

emailSchema.methods.toClient = function(){
    var obj = this.toObject();
    obj.id = obj._id;
    delete obj._id;
    return obj;
};

var Email = mongoose.model('email', emailSchema);

module.exports = Email;
