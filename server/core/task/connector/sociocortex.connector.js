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
    // TODO enable usage of actual user credentials as soon as development is done
    // this.config.email = email;
    // this.config.password = password;
  }

  async getTask(id) {
    const options = this._buildOptions({});
    const url = this._buildURL(`/tasks/${id}`, '');
    return this._checkResponse(await fetch(url, options));
  }

  async draftTask(id, sociocortexTask) {
    let url;
    if (sociocortexTask.resourceType === Constants.sociocortexTaskTypes.human) {
      url = this._buildURL(`/humantasks/${id}/draft`, '');
    } else {
      url = this._buildURL(`/dualtasks/${id}/humanpart/draft`, '');
    }
    const options = this._buildOptions({
      method: 'POST',
      body: JSON.stringify(sociocortexTask),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(JSON.stringify(sociocortexTask));
    return this._checkResponse(await fetch(url, options));
  }

  async searchTasks(params) {
    const url = this._buildURL('/search', params);
    const options = this._buildOptions({});
    return this._checkResponse(await fetch(url, options));
  }

  async getMyWorkspaces() {
    const url = this._buildURL('/workspaces', {});
    const options = this._buildOptions({});
    return this._checkResponse(await fetch(url, options));
  }

  async activateTask(id, taskType) {
    const url = this._buildURL('/' + taskType + '/' + id + '/activate', '');
    const options = this._buildOptions({method: 'POST'});
    return this._checkResponse(await fetch(url, options));
  }

  async completeTask(task) {
    const url = this._buildURL('/' + task.resourceType + '/' + task.id + '/humanpart/complete', '');
    const options = this._buildOptions({
      method: 'POST',
      body: JSON.stringify(task),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log(url, JSON.stringify(task));
    return this._checkResponse(await fetch(url, options));
  }

  async terminateTask(id, taskType) {
    const url = this._buildURL('/' + taskType + '/' + id + '/terminate', '');
    const options = this._buildOptions({method: 'POST'});
    return this._checkResponse(await fetch(url, options));
  }

  /**
   * check configured access token
   */
  async checkConnection() {
    const url = this._buildURL('/users/me', '');
    const options = this._buildOptions({});
    return this._checkResponse(await fetch(url, options));
  }

  /**
   * updates the externalId field of any sociocortex task
   */
  async updateExternalId(taskType, taskId, externalId) {
    const url = this._buildURL('/' + taskType + '/' + taskId + '/externalId', {});
    const options = this._buildOptions({
      method: 'POST',
      body: JSON.stringify({iExternalId: externalId}),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return this._checkResponse(await fetch(url, options));
  }

  /**
   * updates the dueDate field of any sociocortex task
   */
  async updateDueDate(taskType, taskId, date) {
    const url = this._buildURL('/' + taskType + '/' + taskId + '/duedate', {});
    const options = this._buildOptions({
      method: 'POST',
      body: JSON.stringify({dueDate: date}),
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return this._checkResponse(await fetch(url, options));
  }

  /**
   * updates the owner field of any sociocortex task
   */
  async updateOwner(taskType, taskId, ownerId) {
    const url = this._buildURL('/' + taskType + '/' + taskId + '/owner/' + ownerId, {});
    const options = this._buildOptions({method: 'POST'});
    return this._checkResponse(await fetch(url, options));
  }

  async getCases(workspaceId) {
    const url = this._buildURL(`/workspaces/${workspaceId}/cases`, {});
    const options = this._buildOptions({});
    return this._checkResponse(await fetch(url, options));
  }

  async getCase(caseId) {
    const url = this._buildURL(`/cases/${caseId}`, {});
    const options = this._buildOptions({});
    return this._checkResponse(await fetch(url, options));
  }

  async getCaseTree(caseId) {
    const url = this._buildURL(`/cases/${caseId}/tree?lean=true`, {});
    const options = this._buildOptions({});
    return this._checkResponse(await fetch(url, options));
  }

  async getPossibleOwners(taskId) {
    const url = this._buildURL(`/processes/${taskId}/owner/autocomplete`, {});
    const options = this._buildOptions({});
    return this._checkResponse(await fetch(url, options));
  }

  // --- UNUSED METHODS ---

  async getMyCases(workspaceId) {
    const url = this._buildURL(`/workspaces/${workspaceId}/cases/me`, {});
    const options = this._buildOptions({});
    return this._checkResponse(await fetch(url, options));
  }

  async getAllCases() {
    const url = this._buildURL('/cases', {});
    const options = this._buildOptions({});
    return this._checkResponse(await fetch(url, options));
  }

  async getAllMyCases() {
    const url = this._buildURL('/cases/me', {});
    const options = this._buildOptions({});
    return this._checkResponse(await fetch(url, options));
  }

  async getAllTasks(caseId) {
    const url = this._buildURL('/cases/' + caseId + "/humantasks/all", {});
    const options = this._buildOptions({});
    return this._checkResponse(await fetch(url, options));
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
    return options;
  }

  _checkResponse(response) {
    if (response.status >= 400) {
      const error = new Error("Error communicating with Sociocortex");
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }
    return response.json();
  }

}

export default SociocortexConnector;
