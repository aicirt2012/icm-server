var express = require('express');
var router = express.Router();
var config = require('../../config');
var jwt = require('jsonwebtoken');



router.post('/', function(req, res, next) {
    if(!req.body || !req.body.email || !req.body.pw)
        return res.status(403).send();

    var email = req.body.email;
    var pw = req.body.pw;
    return res.json({
        token: jwt.sign(email, config.jwt.secret, {expiresIn: config.jwt.expiresInSeconds}),
        user: {
            id: 'xx',
            email: email
        }
    });

});

module.exports = router;
