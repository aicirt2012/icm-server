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

  async getTasks(caseId) {
    const url = this.buildURL('/cases/' + caseId + '/tree', {'lean': 'true'});
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'simulateuser': this.sociocortex.user
        }
      }).then((res) => res.json())
        .then((json) => {
          // traverse tree and filter all human tasks
          return this.recursivelyGetTasks(json);
        })
        .then((json) => {
          // reduce tree to flat list (could possibly be done the step before to improve performance, but only test service so doesn't matter)
          let flatList = json.flatten(200);    // CAUTION really high deepness level may cause stackoverflow, only use for testing
          let tasks = [];
          flatList.forEach((task) => {
            if (task)
              tasks.push(task)
          });
          return tasks;
        })
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

  async activateHumanTask(taskId) {
    return this.activateTask(taskId, 'humantasks');
  }

  async activateDualTask(taskId) {
    return this.activateTask(taskId, 'dualtasks');
  }

  async activateTask(taskId, taskServiceName) {
    const url = this.buildURL('/' + taskServiceName + '/' + taskId + '/activate', '');
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'simulateuser': this.sociocortex.user
        }
      }).then((res) => res.json())
        .then((json) => {
          resolve(json);
        }).catch((err) => {
        reject(err);
      })
    });
  }

  recursivelyGetTasks(tree) {
    if (Array.isArray(tree)) {
      let tasks = [];
      tree.forEach((item) => {
        tasks.push(this.recursivelyGetTasks(item));
      });
      return tasks;
    } else {
      if (tree.resourceType && tree.resourceType === 'humantasks' || tree.resourceType === 'dualtasks') {
        return tree;
      } else {
        if (tree.children) {
          return this.recursivelyGetTasks(tree.children);
        }
      }
    }
  }

  /* REST utils, TODO move to own util module */
  buildURL(path, params) {
    return `${this.sociocortex.baseURL}${path}` + `${this.addQueries(params)}`;
  }

  addQueries(queries) {
    if (!queries || queries.length == 0)
      return '';
    let queryString = '?';
    Object.keys(queries).forEach((key) => {
      queryString += `${key}=${queries[key]}&`;
    });
    return queryString.slice(0, -1);
  }

}

export default TaskService;
