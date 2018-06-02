import Constants from "../../../../config/constants"
import fetch from "node-fetch";

class SociocortexConnector {

  config = {
    baseURL: 'http://192.168.178.20:8084/api/v1',
    // baseURL: 'http://localhost:8084/api/v1',
    email: 'mustermann@test.sc',
    password: ''
  };

  constructor(email, password) {
    this.config.email = email;
    this.config.password = password;
  }

  async getTask(id) {
    const options = this._buildOptions({});
    const url = this._buildURL(`/tasks/${id}`, '');
    return (await fetch(url, options)).json();
  }

  async updateTask(id, sociocortexTask) {
    let url;
    switch (sociocortexTask.resourceType) {
      case Constants.sociocortexTaskTypes.dual:
        url = this._buildURL(`/dualtasks/${id}`, '');
        break;
      case Constants.sociocortexTaskTypes.human:
        url = this._buildURL(`/humantasks/${id}`, '');
        break;
      default:
        throw new Error("No such sociocortex task type: " + sociocortexTask.resourceType);
    }
    const options = this._buildOptions({
      method: 'PUT',
      body: JSON.stringify(sociocortexTask),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return (await fetch(url, options)).json();
  }

  async searchTasks(params) {
    const url = this._buildURL('/search', params);
    const options = this._buildOptions({});
    return (await fetch(url, options)).json();
  }

  async getAllCases() {
    const url = this._buildURL('/cases', {});
    const options = this._buildOptions({});
    return (await fetch(url, options)).json();
  }

  async getMyCases() {
    const url = this._buildURL('/cases/me', {});
    const options = this._buildOptions({});
    return (await fetch(url, options)).json();
  }

  async getAllTasks(caseId) {
    const url = this._buildURL('/cases/' + caseId + "/humantasks/all", {});
    const options = this._buildOptions({});
    return (await fetch(url, options)).json();
  }

  async activateHumanTask(taskId) {
    return this.activateTask(taskId, 'humantasks');
  }

  async activateDualTask(taskId) {
    return this.activateTask(taskId, 'dualtasks');
  }

  async activateTask(id, taskType) {
    const url = this._buildURL('/' + taskType + '/' + id + '/activate', '');
    const options = this._buildOptions({method: 'POST'});
    return (await fetch(url, options)).json();
  }

  /**
   * check configured access token
   */
  async checkConnection() {
    const url = this.buildURL('/users/me', '');
    return (await fetch(url)).json();
  }

  // --- HELPER FUNCTIONS ---

  _buildURL(path, params) {
    return `${this.config.baseURL}${path}` + `${this._addQueries(params)}`;
  }

  _addQueries(queries) {
    let queryString = '?';
    Object.keys(queries).forEach((key) => {
      queryString += `${key}=${queries[key]}&`;
    });
    return queryString.length > 1 ? queryString.slice(0, -1) : "";
  }

  _buildOptions(options) {
    options = options ? options : {};
    options.headers = options.headers ? options.headers : {};
    options.headers.simulateuser = this.config.email;
    // TODO check if content type needed for empty bodies as well (test with get tasks)
    return options;
  }

}

export default SociocortexConnector;
