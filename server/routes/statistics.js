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
                    var vmap = map.get(f.address);
                    if (!vmap) {
                        vmap = new Map();
                        map.set(f.address, vmap);
                    }
                    email.to.forEach(function (t) {
                        if(!vmap.get(t.address))
                            vmap.set(t.address, 1);
                        else
                            vmap.set(t.address, vmap.get(t.address)+1);
                    });
                });
            });

            var json = [];
            map.forEach(function(values, k){
                values.forEach(function(count, to){
                    json.push({from: k, to: to, count: count});
                });
            });

            console.log(json)
            res.json(json);
        }

    });


});

module.exports = router;
