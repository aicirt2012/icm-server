var express = require('express');
var router = express.Router();
var Email = require('./../models/Email');



router.get('/', function(req, res) {
    console.log('hello');

   // Email.find().distinct('to.')
    Email.find({}, function(data){
        console.log(data);
        return res.json(data);
    });


});

module.exports = router;
