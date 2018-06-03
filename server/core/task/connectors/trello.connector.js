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
    let params = {'members': 'true', 'board': 'true', 'list': 'true', 'stickers': 'true'};
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
    params.modelTypes = "cards";
    params.card_fields = "id,name,idList,idBoard,closed";
    params.query = query ? "is:open," + query : "is:open";
    const url = this.buildURL('/search', params);
    return (await fetch(url)).json();
  }

  /**
   * list boards and contained lists for current user
   */
  async listMyBoards() {
    params.filter = "open";
    params.fields = "id,name,closed";
    params.lists = "open";
    params.memberships = "none";
    const url = this.buildURL('/members/me/boards', params);
    return (await fetch(url)).json();
  }

  /**
   * list boards and contained lists for current user
   */
  async listMembers(boardId) {
    params.fields = "id,fullName,username,initials,avatarUrl";
    const url = this.buildURL(`boards/${boardId}/members`, params);
    return (await fetch(url)).json();
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
