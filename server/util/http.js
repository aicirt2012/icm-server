var express = require('express');
var config = require('../../config');
var request = require('request');


var headers = {
    'Authorization': 'Basic ' + new Buffer(config.sc.user + ':' + config.sc.pass).toString('base64'),
    'Content-Type': 'application/json'
};


module.exports = {

    get: function(path, cb){
        console.log('GET: '+ config.sc.url + path);
        request.get({
            url: config.sc.url + path,
            headers: headers
        }, cb);
    },
    post: function(path, data, cb){
        console.log('POST: '+ config.sc.url + path + " "+JSON.stringify(data));
        request.post({
            url: config.sc.url + path,
            headers: headers,
            json: data
        }, cb);
    },
    put: function(path, data, cb){
        console.log('PUT: '+ config.sc.url + path + " "+JSON.stringify(data));
        request.put({
            url: config.sc.url + path,
            headers: headers,
            json: data
        }, cb);
    },
    del: function(path, data, cb){
        console.log('DEL: '+ config.sc.url + path + " "+JSON.stringify(data));
        request.del({
            url: config.sc.url + path,
            headers: headers,
            json: data
        }, cb);
    }
};

