export default {
  env: 'development',
  MONGOOSE_DEBUG: true,
  jwt: {
    secret: '382a4b7a5745454f3b44346d27744b2d305b3b58394f4d75375e7d7670',
    expiresInSeconds: 86400
  },
  email: {
    /*user: 'felix.in.tum',
    pass: 'hYW7qHj9sfBkvyzVt2jW',*/
    user: 'sebisng2@gmail.com',
    pass: 's3b1sng2',
    host: 'imap.gmail.com',
    port: 993
  },
  trello: {
    baseURL: 'https://trello.com/1/',
    appName: 'Email Client with Contextual Task Support',
    key: '734feed8b99a158d3a9cd9af87e096f3',
    secret: '498ac521e9ecb0f32467f7dffae04054efc6f13318ad20538cd75195e8d4eb54',
    oauthVersion: '1.0',
    oauthSHA: 'HMAC-SHA1'
  },
  gmail: {
    allMessages: '[Gmail]/All Mail',
    inbox: 'INBOX',
    send: '[Gmail]/Sent Mail',
    draft: '[Gmail]/Drafts',
    deleted: '[Gmail]/Trash'
  },
  smtp: {
      host: 'smtp.gmail.com',
      port: 465,
      auth: {
        user: 'sebisng2@gmail.com',
        pass: 's3b1sng2'
      }
  },
  db: 'mongodb://localhost:27017/emailapp',
  port: 4000,
  domain: 'http://localhost'
};
