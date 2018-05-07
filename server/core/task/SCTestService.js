import Promise from "bluebird";
import fetch from "node-fetch";

class TaskService {

  sociocortex = {
    baseURL: 'http://localhost:8084/api/v1',
    appName: 'Email Client with Contextual Task Support',
    user: 'mustermann@test.sc'
  };

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
