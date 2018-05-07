import Promise from "bluebird";
import fetch from "node-fetch";
import 'babel-polyfill';

class TaskService {

  sociocortex = {
    baseURL: 'http://192.168.178.20:8084/api/v1',
    // baseURL: 'http://localhost:8084/api/v1',
    appName: 'Email Client with Contextual Task Support',
    user: 'mustermann@test.sc'
  };

  async getCases() {
    const url = this.buildURL('/cases/me', '');
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'simulateuser': this.sociocortex.user
        }
      }).then((res) => res.json())
        .then((json) => {
          // reduce to minimal entity
          return json.map((caseEntity) => {
            return {
              id: caseEntity.id,
              name: caseEntity.description,
              state: caseEntity.state
            }
          })
        })
        .then((json) => {
          resolve(json);
        }).catch((err) => {
        reject(err);
      })
    });
  }

  /*getAvailableTasks(caseId) {
    const url = this.buildURL('/', '');
  }*/

  /**
   * create task
   * @params {string} - idList (required).
   * @params {string} - name (desirable).
   */
  createTask(body) {
    const url = this.buildURL('/cards', '');
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'simulateuser': this.sociocortex.user
        }
      }).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /* REST utils, TODO move to own util module */
  buildURL(path, params) {
    return `${this.sociocortex.baseURL}${path}` + `${this.addQueries(params)}`;
  }

  addQueries(queries) {
    if (!queries || queries.isEmpty())
      return '';
    let queryString = '?';
    Object.keys(queries).forEach((key) => {
      queryString += `${key}=${queries[key]}&`;
    });
    return queryString.slice(0, -1);
  }

}

export default TaskService;
