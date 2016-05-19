var express = require('express');
var router = express.Router();
var config = require('../../config');
var Email = require('../models/Email');


router.get('/list', function(req, res, next) {

    //.select({html: 0, text: 0}) with select the toclient doesnt work anymore
    Email.find({}).exec(function(err, emails){
        if(err)
            res.json('error');
        else{
            emails.forEach(function(email, key, emails) {
                emails[key] =  email.toClient();
            });
            res.json(emails);
        }
    });

});

router.get('/:id', function(req, res) {
    var id = req.params.id;
    Email.findById(id, function(err, email){
        if(err)
            res.json('error');
        else{
            var j = email.toClient();
            var natural = require('natural'),
                tokenizer = new natural.WordTokenizer();
            if(!j.html)
                j.html = j.text;
           // console.log(tokenizer.tokenize(j.html));

            res.json(j);
        }
    });

});
module.exports = router;
