import config from '../../../config/env';
import TaskConnector from './TaskConnector';
import fetch from 'node-fetch';

class TrelloConnector extends TaskConnector {

  trello = {
    baseURL: 'https://api.trello.com/1',
    appName: 'Email Client with Contextual Task Support',
    key: '734feed8b99a158d3a9cd9af87e096f3',
    secret: '498ac521e9ecb0f32467f7dffae04054efc6f13318ad20538cd75195e8d4eb54',
    accessToken: '6d22bcbdb0dcfc8126e8e692624b8fd1198c73fcdc7f115171b6694ee27f4f8f',
    accessTokenSecret: 'bb3d26c8435dc5fd90cfbbdeef0330d9',
    oauthVersion: '1.0',
    oauthSHA: 'HMAC-SHA1'
  }

  constructor(options) {
    super(options);
    this.accessToken = this.options.trelloAccessToken;
    this.accessTokenSecret = this.options.trelloAccessTokenSecret;
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
  search(params) {
    const url = this.buildURL('/search', params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /**
   * search members
   * @params {string} - query (required).
   */
  searchMembers(params) {
    const url = this.buildURL('/search/members', params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /**
   * get boards
   * @params {string} - query (required).
   */
  getBoardsForMember(params) {
    params['lists'] = 'open';
    params['filter'] = 'open';
    params['fields'] = 'id,name';


    const url = this.buildURL(`/members/${this.options.trelloId}/boards`, params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()).then((boards) => {
        resolve(boards);
      });
    }).catch((err) => {
      reject(err);
    });
  }

  getOpenBoardsForMember(params) {
    params['fields'] = 'id';
    params['filter'] = 'open';
    const url = this.buildURL(`/members/${this.options.trelloId}/boards`, params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()).then((boards) => {
        let promises = [];
        boards.forEach((b) => {
          promises.push(this.getBoard(b.id, params));
        });
        Promise.all(promises).then((res) => {
          resolve(res);
        });
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /**
   * get board
   * @params {string} - query (required).
   */
  getBoard(boardId, params) {
    params['cards'] = 'visible';
    params['card_stickers'] = 'true';
    params['members'] = 'all';
    params['tags'] = 'true';
    const url = this.buildURL(`/boards/${boardId}`, params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /**
   * get lists from board
   * @params {string} - query (required).
   */
  getListsForBoard(boardId, params) {
    const url = this.buildURL(`/boards/${boardId}/lists`, params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /**
   * get cards from list
   * @params {string} - query (required).
   */
  getCardsForList(listId, params) {
    params['members'] = 'true';
    params['stickers'] = 'true';
    const url = this.buildURL(`/lists/${listId}/cards`, params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /**
   * get cards
   * @params {string} - query (required).
   */
  getCardsForMember(memberId, params) {
    params['members'] = 'true';
    params['stickers'] = 'true';
    const url = this.buildURL(`/members/${memberId}/cards`, params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()).then((cards) => {
        let promises = [];
        cards.forEach((b) => {
          promises.push(b);
        });
        Promise.all(promises).then((res) => {
          resolve(res);
        });
      }).catch((err) => {
        reject(err);
      })
    });
  }

  getMembersForBoard(boardId) {
    let params = {'fields': 'id,avatarHash,initials,fullName,username'};
    const url = this.buildURL(`/boards/${boardId}/members`, params);
    return new Promise((resolve, reject) => {
      fetch(url).then((res) => res.json()).then((json) => {
        resolve(json);
      }).catch((err) => {
        reject(err);
      })
    });
  }

  /* Trello Connector utils */
  buildURL(path, params) {
    return `${this.trello.baseURL}${path}?` + `key=${this.trello.key}&` + `token=${this.accessToken}` + `${this.addQueries(params)}`;
  }

}

export default TrelloConnector;
