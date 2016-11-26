import config from '../../../config/env';
import TaskConnector from './TaskConnector';
import fetch from 'node-fetch';

class SociocortexConnector extends TaskConnector  {

  constructor(options) {
    super(options);
    this.baseURL = 'https://server.sociocortex.com/api/v1/';
  }

  persistCredentials(user, scEmail, scPassword) {
    user.sociocortex = {
      email: scEmail,
      password: scPassword
    }
    return new Promise((resolve, reject) => {
      user.save().then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      });
    });
  }

  register(user, scUsername, scEmail, scPassword) {
    return new Promise((resolve, reject) => {
      this.generateRequest('users', null, 'POST', {
        name: scUsername,
        email: scEmail,
        password: scPassword
      }).then((res) => {
        console.log('RESULT', res);
        this.persistCredentials(user, scEmail, scPassword).then((user) => {
          resolve(user);
        });
      }).catch((err) => {
        console.log(error);
        reject(err);
      });
    });
  }

  getTasksForUser() {
    return new Promise((resolve, reject) => {
      this.generateRequest('users/me', null, 'GET', {}).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    });
  }

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
    return new Promise((resolve, reject) => {
      _generateRequest('searchResults', {
        text: params.text,
        resourceType: 'tasks'
      }, 'GET', {}).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  addQueries(queries) {
    let queryString = '';
    Object.keys(queries).forEach((key) => {
      queryString += `${key}=${queries[key]}&`;
    })
    return queryString.slice(0, -1);
  }

  generateRequest(endpoint, params, method, body) {
    let headers = {
      'content-type': 'application/json'
    };
    if (this.options.email && this.options.password) {
      const credentials = `${this.options.email}:${this.options.password}`;
      headers['Authorization'] = `Basic ${new Buffer(credentials).toString('base64')}`;
    }
    let url = `${this.baseURL}${endpoint}`;
    const options = {
      method: method,
      body: JSON.stringify(body),
      headers: headers
    };
    return fetch(url, options).then((res) => res.json());
  }

}

export default SociocortexConnector;
