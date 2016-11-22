import config from '../../../config/env';
import TaskConnector from './TaskConnector';
import fetch from 'node-fetch';

class TrelloConnector extends TaskConnector {
  constructor(options) {
    super(options);
    this.accessToken = this.options.trelloAccessToken;
    this.accessTokenSecret = this.options.trelloAccessTokenSecret;
  }

  /**
   * create task
   * @params {string} - idList (required).
   * @params {string} - name (desirable).
   */
  createTask(params) {
    const url = this.buildURL('/cards', params);
    return new Promise((resolve, reject) => {
      fetch(url, {method: 'POST', body: ''})
        .then((res) => res.json())
        .then((json) => {
          resolve(json);
        })
        .catch((err) => {
          reject(err);
        })
    });
  }

  /**
   * update task 
   * @params {string} - name (optional).
   */
  updateTask(id, params) {
    const url = this.buildURL(`/cards/${id}`, params);
    return new Promise((resolve, reject) => {
      fetch(url, {method: 'PUT', body: ''})
        .then((res) => res.json())
        .then((json) => {
          resolve(json);
        })
        .catch((err) => {
          reject(err);
        })
    });
  }

  /**
   * delete tasks
   */
  deleteTask(id) {
    const url = this.buildURL(`/cards/${id}`, '');
    return new Promise((resolve, reject) => {
      fetch(url, {method: 'DELETE', body: ''})
        .then((res) => res.json())
        .then((json) => {
          resolve(json);
        })
        .catch((err) => {
          reject(err);
        })
    });
  }

  /**
   * search tasks
   * @params {string} - query (required).
   */
  search(params) {
    const url = this.buildURL('/search', params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json())
        .then((json) => {
          resolve(json);
        })
        .catch((err) => {
          reject(err);
        })
    });
  }

  /* Trello Connector utils */
  buildURL(path, params) {
    return `${config.trello.baseURL}${path}?`
      + `key=${config.trello.key}&`
      + `token=${this.accessToken}&`
      + `${this.addQueries(params)}`;
  }

  addQueries(queries) {
    let queryString = '';
    Object.keys(queries).forEach((key) => {
      queryString += `${key}=${queries[key]}&`;
    })
    return queryString.slice(0, -1);
  }
}

export default TrelloConnector;
