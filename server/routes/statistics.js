var express = require('express');
var router = express.Router();
var Email = require('./../models/Email');



router.get('/', function(req, res) {
    console.log('hello');

   // Email.find().distinct('to.')


    Email.find({}).limit(20).exec(function(err, emails){
        console.log(emails.length);
        if(err)
            res.json('error');
        else
            res.json(emails);
    });


});

module.exports = router;
