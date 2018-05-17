import Constants from "../../../config/constants"
import fetch from "node-fetch";

class SociocortexConnector {

  config = {
    baseURL: 'http://192.168.178.20:8084/api/v1',
    // baseURL: 'http://localhost:8084/api/v1',
    email: 'mustermann@test.sc'
  };

  constructor(email) {
    this.config.email = email;
  }

  /**
   * get task
   */
  async getTask(id) {
    const options = this.buildOptions({});
    const url = this.buildURL(`/tasks/${id}`, '');
    return (await fetch(url, options)).json();
  }

  /**
   * update task
   */
  async updateTask(id, sociocortexTask) {
    let url;
    switch (sociocortexTask.entityType) { // TODO check name and value of this field
      case Constants.sociocortexTaskTypes.dual:
        url = this.buildURL(`/dualtasks/${id}`, '');
        break;
      case Constants.sociocortexTaskTypes.human:
        url = this.buildURL(`/humantasks/${id}`, '');
        break;
      default:
        throw new Error("No such sociocortex task type: " + sociocortexTask.entityType);
    }
    const options = this.buildOptions({
      method: 'PUT',
      body: JSON.stringify(sociocortexTask),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return (await fetch(url, options)).json();
  }

  /**
   * search tasks
   */
  async searchTasks(params) {
    const url = this.buildURL('/search', params);
    const options = this.buildOptions({});
    return (await fetch(url, options)).json();
  }

  buildURL(path, params) {
    return `${this.config.baseURL}${path}` + `${this.addQueries(params)}`;
  }

  addQueries(queries) {
    let queryString = '?';
    Object.keys(queries).forEach((key) => {
      queryString += `${key}=${queries[key]}&`;
    });
    return queryString.length > 1 ? queryString.slice(0, -1) : "";
  }

  buildOptions(options) {
    options = options ? options : {};
    options.headers = options.headers ? options.headers : {};
    options.headers.simulateuser = this.config.email;
    // TODO check if content type needed for empty bodies as well (test with get tasks)
    return options;
  }

}

export default SociocortexConnector;
