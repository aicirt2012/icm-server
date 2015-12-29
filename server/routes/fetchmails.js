var express = require('express');
var router = express.Router();
var SimpleImap = require('../util/SimpleImap');
var config = require('../../config');
var Email = require('../models/Email');


router.get('/', function(req, res, next) {

    Email.remove({}, function(err) {
        console.log('All Emails are removed')
    });

    var options = {
        user: config.email.user,
        password: config.email.pass,
        host: config.email.host,
        port: config.email.port,
        tls: true,
        mailbox: 'INBOX'
    };

    var simpleImap = new SimpleImap(options);

    simpleImap.on('error', function(err) {
        console.log(err);
    });

    simpleImap.on('mail', function(mail) {
        // console.log(mail);
        var e = {
            from: mail.from,
            to: mail.to,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
            date: mail.date
        };
        console.log(JSON.stringify(e));
        Email.create(e, function (err, email) {
            if (err)
                console.log(err);
            else
                console.log('created email');
        });

    });

    simpleImap.start();
    setTimeout(function(){
        Email.find({}).exec(function(err, emails){
            if(err)
                res.send(err);
            else
                res.send(emails);
        });
    }, 2000);



});

module.exports = router;
