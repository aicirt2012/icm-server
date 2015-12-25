var express = require('express');
var router = express.Router();
var SimpleImap = require('../util/SimpleImap');
var config = require('../../config');
var Email = require('../models/Email');

/* GET users listing. */
router.get('/', function(req, res, next) {

  var options = {
    user: config.email.user,
    password: config.email.pass,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    mailbox: 'INBOX'
  };

  var simpleImap = new SimpleImap(options);

  simpleImap.on('error', function(err) {
    console.log(err);
  });

  simpleImap.on('mail', function(mail) {
        console.log(mail);
      var e = {
          from: mail.from,
          html: mail.html,
          text: mail.text
      };
      Email.create(e, function (err, email) {
          if (err)
            console.log(err);
          else
            console.log('created email');
      });

  });

  simpleImap.start();

  res.send('respond with a resource');
});

module.exports = router;
