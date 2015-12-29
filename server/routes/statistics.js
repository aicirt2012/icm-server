var express = require('express');
var router = express.Router();



router.get('/', function(req, res) {
    if(!req.body || !req.body.email || !req.body.pw)
        return res.status(403).send();

   // Email.find().distinct('to.')

    return res.json({});

});

module.exports = router;
