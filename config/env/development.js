export default {
  env: 'development',
  MONGOOSE_DEBUG: true,
  jwt: {
    secret: '382a4b7a5745454f3b44346d27744b2d305b3b58394f4d75375e7d7670',
    expiresInSeconds: 86400
  },
  email: {
    user: 'felix.in.tum',
    pass: 'hYW7qHj9sfBkvyzVt2jW',
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
    allMessages: '[Gmail]/Alle Nachrichten',
    inbox: 'INBOX',
    send: '[Gmail]/Gesendet',
    draft: '[Gmail]/Entwürfe',
    deleted: '[Gmail]/Papierkorb'
  },
  google: {
    clientID: process.env.GOOGLE_ID || 'APP_ID',
    clientSecret: process.env.GOOGLE_SECRET || 'APP_SECRET',
    callbackURL: 'http://127.0.0.1:3000/auth/google/callback'
  },
  db: 'mongodb://localhost:27017/emailapp',
  port: 4000,
  domain: 'http://localhost'
};
