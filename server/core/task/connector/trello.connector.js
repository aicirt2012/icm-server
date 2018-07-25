import fetch from "node-fetch";

class TrelloConnector {

  config = {
    baseURL: 'https://api.trello.com/1',
    key: '734feed8b99a158d3a9cd9af87e096f3',
    accessToken: '',
  };

  constructor(trelloAccessToken) {
    this.config.accessToken = trelloAccessToken;
  }

  /**
   * check configured access token
   */
  async checkAccessToken() {
    const url = this._buildURL('/tokens/' + this.config.accessToken, '');
    const response = await fetch(url);
    return this._checkResponse(response);
  }

  /**
   * create task
   * @params {string} - idList (required).
   * @params {string} - name (desirable).
   */
  async createTask(trelloTask) {
    const url = this._buildURL('/cards', '');
    const options = {
      method: 'POST',
      body: JSON.stringify(trelloTask),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return this._checkResponse(await fetch(url, options));
  }

  /**
   * get task
   */
  async getTask(id) {
    const params = {'members': 'true', 'board': 'true', 'list': 'true', 'stickers': 'true'};
    const url = this._buildURL(`/cards/${id}`, params);
    const response = await fetch(url);
    return this._checkResponse(response);
  }

  /**
   * update task
   * @params {string} - name (optional).
   */
  async updateTask(id, trelloTask) {
    const url = this._buildURL(`/cards/${id}`, '');
    const options = {
      method: 'PUT',
      body: JSON.stringify(trelloTask),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return this._checkResponse(await fetch(url, options));
  }

  /**
   * delete tasks
   */
  async deleteTask(id) {
    const url = this._buildURL(`/cards/${id}`, '');
    return this._checkResponse(await fetch(url, {method: 'DELETE'}));
  }

  /**
   * search tasks
   * @params {string} - query (optional).
   */
  async searchTasks(query) {
    const params = {
      modelTypes: "cards",
      card_fields: "id,name,idList,idBoard,closed,desc,due,shortUrl",
      query: query ? "is:open," + query : "is:open"
    };
    const url = this._buildURL('/search', params);
    return this._checkResponse(await fetch(url));
  }

  /**
   * list boards and contained lists for current user
   */
  async listMyBoards() {
    const params = {
      filter: "open",
      fields: "id,name,closed",
      lists: "open",
      memberships: "none"
    };
    const url = this._buildURL('/members/me/boards', params);
    return this._checkResponse(await fetch(url));
  }

  /**
   * list boards and contained lists for current user
   */
  async listMembers(boardId) {
    const params = {fields: "id,fullName,username,initials,avatarUrl"};
    const url = this._buildURL(`boards/${boardId}/members`, params);
    return this._checkResponse(await fetch(url));
  }

  /**
   * list tasks in the list with the given id
   */
  async getTasks(listId) {
    const params = {fields: "id,name,idList,idBoard,closed,desc,due,shortUrl", filter: "all"};
    const url = this._buildURL(`/lists/${listId}/cards`, params);
    return this._checkResponse(await fetch(url));
  }

  /**
   * adds the given URL to the task with the given taskID
   * returns the created attachment entity
   */
  async addAttachmentUrl(taskId, url) {
    const params = {url: url, name: "Link to ICM"};   // TODO append email to caption to enable multi user usage
    const requestUrl = this._buildURL(`/cards/${taskId}/attachments`, params);
    return this._checkResponse(await fetch(requestUrl, {method: 'POST'}));
  }

  /**
   * removes the given URL from the task with the given taskID
   */
  async removeAttachmentUrl(taskId, url) {
    const attachmentUrl = this._buildURL(`/cards/${taskId}/attachments`, '');
    const response = await fetch(attachmentUrl);
    if (response.status === 404)
      return; // task not found, so no attachements to remove
    const attachments = await response.json();
    let attachmentId = undefined;
    // TODO parallelize
    for (const attachment of attachments) {
      if (attachment.url === url) {
        const requestUrl = this._buildURL(`/cards/${taskId}/attachments/${attachmentId}`, '');
        await this._checkResponse(fetch(requestUrl, {method: 'DELETE'}));
      }
    }
  }

  // --- HELPER FUNCTIONS ---

  _buildURL(path, params) {
    return `${this.config.baseURL}${path}?` + `key=${this.config.key}&` + `token=${this.config.accessToken}` + `${this._addQueries(params)}`;
  }

  _addQueries(queries) {
    let queryString = '&';
    Object.keys(queries).forEach((key) => {
      queryString += `${key}=${queries[key]}&`;
    });
    return queryString.slice(0, -1);
  }

  _checkResponse(response) {
    if (response.status >= 400) {
      const error = new Error("Error communicating with Trello");
      error.response = response;
      throw error;
    }
    return response.json();
  }

}

export default TrelloConnector;
