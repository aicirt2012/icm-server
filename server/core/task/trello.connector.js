import fetch from "node-fetch";

class TrelloConnector {

  config = {
    baseURL: 'https://api.trello.com/1',
    appName: 'Email Client with Contextual Task Support',
    key: '734feed8b99a158d3a9cd9af87e096f3',
    secret: '498ac521e9ecb0f32467f7dffae04054efc6f13318ad20538cd75195e8d4eb54',
    accessToken: '6d22bcbdb0dcfc8126e8e692624b8fd1198c73fcdc7f115171b6694ee27f4f8f',
    oauthVersion: '1.0',
    oauthSHA: 'HMAC-SHA1'
  };

  constructor(trelloAccessToken) {
    this.accessToken = trelloAccessToken;
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
    return await fetch(url, options).json();
  }

  /**
   * get task
   */
  async getTask(id) {
    let params = {'members': 'true', 'board': 'true', 'list': 'true', 'stickers': 'true'};
    const url = this.buildURL(`/cards/${id}`, params);
    return await fetch(url).json();
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
    return await fetch(url, options).json();
  }

  /**
   * delete tasks
   */
  async deleteTask(id) {
    const url = this.buildURL(`/cards/${id}`, '');
    return await fetch(url, {method: 'DELETE'}).json();
  }

  /**
   * search tasks
   * @params {string} - query (required).
   */
  async searchTasks(params) {
    const url = this.buildURL('/search', params);
    return await fetch(url).json();
  }


  buildURL(path, params) {
    return `${this.config.baseURL}${path}?` + `key=${this.config.key}&` + `token=${this.accessToken}` + `${this.addQueries(params)}`;
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
