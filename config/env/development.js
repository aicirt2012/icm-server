export default {
  env: 'development',
  jwt: {
    secret: '382a4b7a5745454f3b44346d27744b2d305b3b58394f4d75375e7d7670',
    expiresInSeconds: 86400
  },
  trello: {
    baseURL: 'https://api.trello.com/1',
    appName: 'Email Client with Contextual Task Support',
    key: '734feed8b99a158d3a9cd9af87e096f3',
    secret: '498ac521e9ecb0f32467f7dffae04054efc6f13318ad20538cd75195e8d4eb54',
    accessToken: '6d22bcbdb0dcfc8126e8e692624b8fd1198c73fcdc7f115171b6694ee27f4f8f',
    accessTokenSecret: 'bb3d26c8435dc5fd90cfbbdeef0330d9',
    oauthVersion: '1.0',
    oauthSHA: 'HMAC-SHA1'
  },
  oauth: {
    google: {
      clientID: '465909145526-24o6vi7usjb15h7d0k82u1crhlvcaed0.apps.googleusercontent.com',
      clientSecret: 'ov0JPJIiAy8g4A7rYgUdc27S',
      callbackURL: 'http://localhost:4000/api/auth/google/callback'
    },
    trello: {
      appName: 'Email Client with Contextual Task Support',
      consumerKey: '734feed8b99a158d3a9cd9af87e096f3',
      consumerSecret: '498ac521e9ecb0f32467f7dffae04054efc6f13318ad20538cd75195e8d4eb54',
      callbackURL: 'http://localhost:4000/api/auth/trello/callback'
    }
  },  
  mongoConnectionURL: 'mongodb://localhost:27017/icmapp',
  mongooseDebug: true,
  attachmentsPath: './Attachments/',
  apiPort: 4000,
  socketPort: 4001,
  domain: 'http://localhost',
  frontend: 'http://localhost:3000'
};
