module.exports = {
    database: 'mongodb://emailuser:123@localhost:27017/emailapp',
    jwt: {
        secret: '382a4b7a5745454f3b44346d27744b2d305b3b58394f4d75375e7d7670',
        expiresInSeconds: 86400
    },
    email:{
        user: 'muc.refugees@gmail.com',
        pass: '***REMOVED***',
        host: 'imap.gmail.com',
        port: 993
    }
};
