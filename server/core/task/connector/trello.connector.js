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
    const url = this.buildURL('/tokens/' + this.config.accessToken, '');
    return (await fetch(url)).json();
  }

  /**
   * create task
   * @params {string} - idList (required).
   * @params {string} - name (desirable).
   */
  async createTask(trelloTask) {
    const url = this.buildURL('/cards', '');
    const options = {
      method: 'POST',
      body: JSON.stringify(trelloTask),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return (await fetch(url, options)).json();
  }

  /**
   * get task
   */
  async getTask(id) {
    const params = {'members': 'true', 'board': 'true', 'list': 'true', 'stickers': 'true'};
    const url = this.buildURL(`/cards/${id}`, params);
    return (await fetch(url)).json();
  }

  /**
   * update task
   * @params {string} - name (optional).
   */
  async updateTask(id, trelloTask) {
    const url = this.buildURL(`/cards/${id}`, '');
    const options = {
      method: 'PUT',
      body: JSON.stringify(trelloTask),
      headers: {
        'Content-Type': 'application/json'
      }
    };
    return (await fetch(url, options)).json();
  }

  /**
   * delete tasks
   */
  async deleteTask(id) {
    const url = this.buildURL(`/cards/${id}`, '');
    return (await fetch(url, {method: 'DELETE'})).json();
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
    const url = this.buildURL('/search', params);
    return (await fetch(url)).json();
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
    const url = this.buildURL('/members/me/boards', params);
    return (await fetch(url)).json();
  }

  /**
   * list boards and contained lists for current user
   */
  async listMembers(boardId) {
    const params = {fields: "id,fullName,username,initials,avatarUrl"};
    const url = this.buildURL(`boards/${boardId}/members`, params);
    return (await fetch(url)).json();
  }

  /**
   * list tasks in the list with the given id
   */
  async getTasks(listId) {
    const params = {fields: "id,name,idList,idBoard,closed,desc,due,shortUrl"};
    const url = this.buildURL(`/lists/${listId}/cards`, params);
    return (await fetch(url)).json();
  }

  /**
   * adds the given URL to the task with the given taskID
   */
  async addAttachmentUrl(taskId, url) {
    const params = {url: url, name: "Link to ICM"};   // TODO append email to caption to enable multi user usage
    const requestUrl = this.buildURL(`/cards/${taskId}/attachments`, params);
    return (await fetch(requestUrl, {method: 'POST'})).json();
  }

  /**
   * removes the given URL from the task with the given taskID
   */
  async removeAttachmentUrl(taskId, url) {
    const attachmentUrl = this.buildURL(`/cards/${taskId}/attachments`, '');
    const attachments = (await fetch(attachmentUrl)).json();
    let attachmentId = undefined;
    // TODO parallelize
    for (const attachment of attachments) {
      if (attachment.url === url) {
        const requestUrl = this.buildURL(`/cards/${taskId}/attachments/${attachmentId}`, '');
        await fetch(requestUrl, {method: 'DELETE'}).json();
      }
    }
  }

  buildURL(path, params) {
    return `${this.config.baseURL}${path}?` + `key=${this.config.key}&` + `token=${this.config.accessToken}` + `${this.addQueries(params)}`;
  }

  addQueries(queries) {
    let queryString = '&';
    Object.keys(queries).forEach((key) => {
      queryString += `${key}=${queries[key]}&`;
    });
    return queryString.slice(0, -1);
  }

}

export default TrelloConnector;
