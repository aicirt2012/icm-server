import config from '../../../config/env';
import TaskConnector from './TaskConnector';
import fetch from 'node-fetch';

class SociocortexConnector extends TaskConnector  {

  constructor(options) {
    super(options);
    this.baseURL = 'https://server.sociocortex.com/api/v1/';
  }

  persistCredentials(user, scEmail, scPassword, scUserId) {
    user.sociocortex = {
      email: scEmail,
      password: scPassword,
      userId: scUserId
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
        this.persistCredentials(user, scEmail, scPassword, res.id).then((user) => {
          resolve(user);
        });
      }).catch((err) => {
        console.log(error);
        reject(err);
      });
    });
  }

  connect(user, scEmail, scPassword) {
    this.options = {
      email: scEmail,
      scPassword: scPassword
    };
    this.getUserDetails().then((res) => {
      persistCredentials(user, scEmail, scPassword, res.id)
    })
  }

  getTasksForUser() {
    return new Promise((resolve, reject) => {
      this.generateRequest(`users/${this.options.userId}/tasks`, null, 'GET', {}).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  createTaskForUser(task) {
    return new Promise((resolve, reject) => {
      this.generateRequest(`users/${this.options.userId}/tasks`, null, 'POST', task).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  getUserDetails()  {
    return new Promise((resolve, reject) => {
      this.generateRequest('users/me', null, 'GET', {}).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  getTask(task) {
    return new Promise((resolve, reject) => {
      this.generateRequest(`tasks/${task.id}`, null, 'GET').then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  updateTask(task) {
    return new Promise((resolve, reject) => {
      this.generateRequest(`tasks/${task.id}`, null, 'PUT', task).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  deleteTask(task) {
    return new Promise((resolve, reject) => {
      this.generateRequest(`tasks/${task.id}`, null, 'DELETE', task).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  search(params) {
    return new Promise((resolve, reject) => {
      _generateRequest('searchResults', {
        text: params.text
      }, 'GET', {}).then((res) => {
        resolve(res);
      }).catch((err) => {
        reject(err);
      })
    });
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
