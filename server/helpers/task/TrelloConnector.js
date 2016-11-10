import {
  OAuth
} from 'oauth';
import url from 'url';
import config from '../../config/env';

/* BASIC API ENDPOINTS */
const requestURL = `${config.trello.baseURL}OAuthGetRequestToken`;
const accessURL = `${config.trello.baseURL}OAuthGetAccessToken`;
const authorizeURL = `${config.trello.baseURL}OAuthAuthorizeToken`;

const serverLocation = `${config.baseURL}:${config.port}`;

const oauth = new OAuth(requestURL, accessURL, config.trello.key, config.trello.secret,
  config.trello.oauthVersion, serverLocation, config.trello.oauthSHA);

let oauthSecrets = {};

const login = function login(req, res) {
  return oauth.getOAuthRequestToken((error, token, tokenSecret, results) => {
    oauthSecrets[token] = tokenSecret;
    res.writeHead(302, {
      Location: `${authorizeURL}?oauth_token=${token}&name=${config.trello.appName}`
    });
    return res.end();
  }, this);
}

export default {
  login
};
