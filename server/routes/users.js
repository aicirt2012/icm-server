var express = require('express');
var router = express.Router();
var SimpleImap = require('./SimpleImapFelix');//require('simple-imap');
var config = require('../../config');

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
  });

  simpleImap.start();

  res.send('respond with a resource');
});

module.exports = router;
