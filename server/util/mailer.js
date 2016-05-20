var express = require('express');
var nodemailer = require('nodemailer');
var config = require('../../config');
var app = express();

module.exports = {
    send: send,
    sendToUser: sendToUser
};

function sendToUser(emailAddress, name, subject, body, cb) {
    var greeting = '<h3>Hallo ' + name + '!</h3>';
    var ending = '<p>Viele Grüße, <br>Ihr VolunterApp Team</p>';
    send({
        to: emailAddress,
        subject: subject,
        html: greeting + body + ending
    }, cb);
}

function send(mail, cb) {
    if (app.get('env') === 'development') {
        console.log('\nSEND EMAIL: ');
        console.log('TO: ' + mail.to);
        console.log('SUBJECT: ' + mail.subject);
        console.log('CONTENT-TEXT: ' + mail.text);
        console.log('CONTENT-HTML: ' + mail.html + '\n');
    } else {
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            debug: true,
            auth: {
                user: config.email.user,
                pass: config.email.pass
            }
        });

        var mail = {
            from: config.name + ' <' + config.email.user + '@gmail.com>',
            to: mail.to,
            subject: mail.subject,
            text: mail.text,
            html: mail.html
        };

        transporter.sendMail(mail, cb);
    }
};

