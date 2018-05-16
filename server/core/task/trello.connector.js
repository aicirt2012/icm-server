import fetch from "node-fetch";

class TrelloConnector {

  config = {
    baseURL: 'https://api.trello.com/1',
    appName: 'Email Client with Contextual Task Support',
    key: '734feed8b99a158d3a9cd9af87e096f3',
    secret: '498ac521e9ecb0f32467f7dffae04054efc6f13318ad20538cd75195e8d4eb54',
    accessToken: '6d22bcbdb0dcfc8126e8e692624b8fd1198c73fcdc7f115171b6694ee27f4f8f',
    accessTokenSecret: 'bb3d26c8435dc5fd90cfbbdeef0330d9',
    oauthVersion: '1.0',
    oauthSHA: 'HMAC-SHA1'
  };

  constructor(trelloAccessToken, trelloAccessTokenSecret) {
    this.accessToken = trelloAccessToken;
    this.accessTokenSecret = trelloAccessTokenSecret;
  }

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
          'Content-Type': 'application/json'
        }
      }).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /**
   * get task
   */
  getTask(id) {
    let params = {'members': 'true', 'board': 'true', 'list': 'true', 'stickers': 'true'};
    const url = this.buildURL(`/cards/${id}`, params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()
      ).then((task) => {
        resolve(task);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /**
   * update task
   * @params {string} - name (optional).
   */
  updateTask(id, body) {
    const url = this.buildURL(`/cards/${id}`, '');
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /**
   * delete tasks
   */
  deleteTask(id) {
    const url = this.buildURL(`/cards/${id}`, '');
    return new Promise((resolve, reject) => {
      fetch(url, {method: 'DELETE'}).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /**
   * search tasks
   * @params {string} - query (required).
   */
  searchTasks(params) {
    const url = this.buildURL('/search', params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });
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
