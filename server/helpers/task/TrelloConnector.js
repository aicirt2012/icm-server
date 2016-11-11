import {
  OAuth
} from 'oauth';
import url from 'url';
import config from '../../../config/env';

/* BASIC API ENDPOINTS */
const requestURL = `${config.trello.baseURL}OAuthGetRequestToken`;
const accessURL = `${config.trello.baseURL}OAuthGetAccessToken`;
const authorizeURL = `${config.trello.baseURL}OAuthAuthorizeToken`;
const loginCallback = `${config.domain}:${config.port}/api/task/callback`;

const oauth = new OAuth(requestURL, accessURL, config.trello.key, config.trello.secret,
  config.trello.oauthVersion, loginCallback, config.trello.oauthSHA);

// TODO: for production find a better way to store oauthSecrets
let oauthSecrets = {};

const login = function login(req, res) {
  return oauth.getOAuthRequestToken((error, token, tokenSecret, results) => {
    oauthSecrets[token] = tokenSecret;
    res.writeHead(302, {
      Location: `${authorizeURL}?scope=read,write&oauth_token=${token}&name=${config.trello.appName}`
    });
    return res.end();
  }, this);
};

const callback = function callback(req, res) {
  const query = url.parse(req.url, true).query;
  const token = query.oauth_token;
  const tokenSecret = oauthSecrets[token];
  const verifier = query.oauth_verifier;
  return oauth.getOAuthAccessToken(token, tokenSecret, verifier,
    (error, accessToken, accessTokenSecret, results) => {
      // TODO: store accessToken and accessTokenSecret somewhere
      console.log(accessToken);
      console.log(accessTokenSecret);
      return res.end();
    });
};

const search = function search(req, res) {
  return oauth.getProtectedResource(
    `${config.trello.baseURL}/search?query="consulta"`,
    // TODO: recover accessToken from storage
    "GET", config.trello.accessToken, config.trello.accessTokenSecret,
    (error, data, response) => {
      return res.end(data)
    }
  )
}

export default {
  login,
  callback,
  search
};
