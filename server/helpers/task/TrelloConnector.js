import {
  OAuth
} from 'oauth';
import url from 'url';
import config from '../../../config/env';
import TaskConnector from './TaskConnector';
import fetch from 'node-fetch';

class TrelloConnector extends TaskConnector  {
  constructor(options) {
    super(options);
    this.accessToken = this.options.trelloAccessToken;
    this.accessTokenSecret = this.options.trelloAccessTokenSecret;
  }

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
      fetch(`${config.trello.baseURL}${path}?key=${config.trello.key}&token=${this.accessToken}&${this.addQueries(params)}`).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });;
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
