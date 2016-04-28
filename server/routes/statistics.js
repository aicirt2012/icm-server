var express = require('express');
var router = express.Router();
var Email = require('./../models/Email');


router.get('/', function (req, res) {
    console.log('hello');

    // Email.find().distinct('to.')


    Email.find({}).exec(function (err, emails) {
        console.log(emails.length);
        if (err)
            res.json('error');
        else {
            var map = new Map();

            emails.forEach(function (email) {
                email.from.forEach(function (f) {
                    var set = map.get(f.address);
                    if (!set) {
                        set = new Set();
                        map.set(f.address, set);
                    }
                    email.to.forEach(function (t) {
                        set.add(t.address)
                    });
                });
            });

            var json = {};
            map.forEach(function(values, k){
                json[k] = [];
                values.forEach(function(v){
                    json[k].push(v);
                });
            });

            res.json(json);
        }

    });


});

module.exports = router;
