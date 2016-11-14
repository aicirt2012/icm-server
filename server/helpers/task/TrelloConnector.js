import {
  OAuth
} from 'oauth';
import url from 'url';
import config from '../../../config/env';
import TaskConnector from './TaskConnector';


class TrelloConnector extends TaskConnector  {
  constructor(options) {
    super(options);
    this.requestURL = `${config.trello.baseURL}/OAuthGetRequestToken`;
    this.accessURL = `${config.trello.baseURL}/OAuthGetAccessToken`;
    this.authorizeURL = `${config.trello.baseURL}/OAuthAuthorizeToken`;
    this.loginCallback = `${config.domain}:${config.port}/api/task/callback`;
    this.oauthSecrets = {};
    this.accessToken = config.trello.accessToken;
    this.accessTokenSecret = config.trello.accessTokenSecret;
    this.oauth = new OAuth(this.requestURL, this.accessURL, config.trello.key, config.trello.secret,
      config.trello.oauthVersion, this.loginCallback, config.trello.oauthSHA);
  }

  callback(query) {
    const token = query.oauth_token;
    const tokenSecret = this.oauthSecrets[token];
    const verifier = query.oauth_verifier;
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthAccessToken(token, tokenSecret, verifier,
        (error, accessToken, accessTokenSecret, results) => {
          // TODO: store accessToken and accessTokenSecret somewhere
          console.log(accessToken);
          console.log(accessTokenSecret);
          error ? reject(error) : resolve(results);
        });
    });
  }

  //
  // const login = function login(req, res) {
  //   return oauth.getOAuthRequestToken((error, token, tokenSecret, results) => {
  //     oauthSecrets[token] = tokenSecret;
  //     res.writeHead(302, {
  //       Location: `${authorizeURL}?scope=read,write&oauth_token=${token}&name=${config.trello.appName}`
  //     });
  //     return res.end();
  //   }, this);
  // };
  //

  //
  // const create = function create(req, res, params) {
  //   const path = (url.parse(req.url, true).pathname).slice(7); // without /create
  //   const queries = ;
  //   return oauth.getProtectedResource(
  //     `${config.trello.baseURL}${path}?${addQueries(params, queries)}`,
  //     "POST", accessToken, accessTokenSecret,
  //     (error, data, response) => {
  //       return res.end(data)
  //     }
  //   )
  // }
  //
  createTask() {
    //Logic for creating task
    return true;
  }

  updateTask(task) {
    //Logic for updating task
    return true;
  }

  deleteTask(task) {
    //Logic for deleting task
    return true;
  }

  search(params) {
    const path = '/search';
    return new Promise((resolve, reject) => {
      console.log(params);
      console.log(this.oauth);
      this.oauth.getProtectedResource(
        `${config.trello.baseURL}${path}?${this.addQueries(params)}`,
        "GET", this.accessToken, this.accessTokenSecret,
        (error, data, response) => {
          error ? reject(error) : resolve(data);
        }
      );
    });
  }

  addQueries(queries) {
    let queryString = '';
    Object.keys(queries).forEach((key) => {
      queryString += `${key}=${queries[key]}&`;
    })
    console.log(queryString);
    return queryString.slice(0, -1);
  }
}

export default TrelloConnector;
