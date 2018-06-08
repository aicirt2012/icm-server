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

  async draftTask(id, sociocortexTask) {
    let url;
    if (sociocortexTask.resourceType === Constants.sociocortexTaskTypes.human) {
      url = this._buildURL(`/humantasks/${id}/draft`, '');
    } else {
      url = this._buildURL(`/dualtasks/${id}/draft`, '');
    }
    const options = this._buildOptions({
      method: 'POST',
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

  async getMyWorkspaces() {
    // TODO check if this really returns only MY workspaces or ALL; maybe rename method
    const url = this._buildURL('/workspaces', {});
    const options = this._buildOptions({});
    return (await fetch(url, options)).json();
  }

  async activateTask(id, taskType) {
    const url = this._buildURL('/' + taskType + '/' + id + '/activate', '');
    const options = this._buildOptions({method: 'POST'});
    return (await fetch(url, options)).json();
  }

  async completeTask(id, taskType) {
    const url = this._buildURL('/' + taskType + '/' + id + '/complete', '');
    const options = this._buildOptions({method: 'POST'});
    return (await fetch(url, options)).json();
  }

  async terminateTask(id, taskType) {
    const url = this._buildURL('/' + taskType + '/' + id + '/terminate', '');
    const options = this._buildOptions({method: 'POST'});
    return (await fetch(url, options)).json();
  }

  /**
   * check configured access token
   */
  async checkConnection() {
    const url = this._buildURL('/users/me', '');
    const options = this._buildOptions({});
    const response = (await fetch(url, options));
    return response.json();
  }

  /**
   * updates the externalId field of any sociocortex task
   */
  async updateExternalId(taskId, value) {
    const options = this._buildOptions({});

    // TODO make parallel
    // don't know if task is human or dual, so fire requests to both endpoints and check if we got a valid response
    let url = this._buildURL('/humantasks/' + taskId + '/externalId/' + encodeURI(value), {});
    const humantaskResponse = await fetch(url, options);
    url = this._buildURL('/dualtasks/' + taskId + '/externalId/' + encodeURI(value), {});
    const dualtaskRepsonse = await fetch(url, options);

    if (humantaskResponse.status === 200)
      return humantaskResponse.json();
    else
      return dualtaskRepsonse.json();
  }

  /**
   * updates the dueDate field of any sociocortex task
   */
  async updateDueDate(taskId, date) {
    const options = {
      method: 'POST',
      body: JSON.stringify({dueDate: date}),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // TODO make parallel
    // don't know if task is human or dual, so fire requests to both endpoints and check if we got a valid response
    let url = this._buildURL('/humantasks/' + taskId + '/duedate', {});
    const humantaskResponse = await fetch(url, options);
    url = this._buildURL('/dualtasks/' + taskId + '/duedate', {});
    const dualtaskRepsonse = await fetch(url, options);

    if (humantaskResponse.status === 200)
      return humantaskResponse.json();
    else
      return dualtaskRepsonse.json();
  }

  /**
   * updates the owner field of any sociocortex task
   */
  async updateOwner(taskId, ownerId) {
    // TODO make parallel
    const options = this._buildOptions({method: 'POST'});

    // don't know if task is human or dual, so fire requests to both endpoints and check if we got a valid response
    let url = this._buildURL('/humantasks/' + taskId + '/owner/' + ownerId, {});
    const humantaskResponse = await fetch(url, options);
    url = this._buildURL('/dualtasks/' + taskId + '/owner/' + ownerId, {});
    const dualtaskRepsonse = await fetch(url, options);

    if (humantaskResponse.status === 200)
      return humantaskResponse.json();
    else
      return dualtaskRepsonse.json();
  }

  async getCases(workspaceId) {
    const url = this._buildURL(`/workspaces/${workspaceId}/cases`, {});
    const options = this._buildOptions({});
    return (await fetch(url, options)).json();
  }

  async getTasks(caseId) {
    const url = this._buildURL(`/cases/${caseId}/humantasks/all`, {});
    const options = this._buildOptions({});
    return (await fetch(url, options)).json();
  }

  // --- UNUSED METHODS ---

  async getMyCases(workspaceId) {
    const url = this._buildURL(`/workspaces/${workspaceId}/cases/me`, {});
    const options = this._buildOptions({});
    return (await fetch(url, options)).json();
  }

  async getAllCases() {
    const url = this._buildURL('/cases', {});
    const options = this._buildOptions({});
    return (await fetch(url, options)).json();
  }

  async getAllMyCases() {
    const url = this._buildURL('/cases/me', {});
    const options = this._buildOptions({});
    return (await fetch(url, options)).json();
  }

  async getAllTasks(caseId) {
    const url = this._buildURL('/cases/' + caseId + "/humantasks/all", {});
    const options = this._buildOptions({});
    return (await fetch(url, options)).json();
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
