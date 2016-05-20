var mongoose = require('mongoose');

var emailSchema = new mongoose.Schema ({
    messageId: String,
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
    date: Date
});

emailSchema.methods.toClient = function(){
    var obj = this.toObject();
    obj.id = obj._id;
    obj.date = obj.date.toISOString();
    delete obj._id;
    return obj;
};

var Email = mongoose.model('email', emailSchema);


module.exports = Email;
