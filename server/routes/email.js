var express = require('express');
var router = express.Router();
var config = require('../../config');
var Email = require('../models/Email');


router.get('/list', function(req, res, next) {

    Email.find({}).exec(function(err, emails){
        if(err)
            res.json('error');
        else
            res.json(emails);
    });

});

module.exports = router;
