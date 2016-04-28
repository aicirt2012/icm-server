var express = require('express');
var router = express.Router();



router.get('/', function(req, res) {


   // Email.find().distinct('to.')
    Email.find({}, function(data){
        return res.json(data);
    });


});

module.exports = router;
