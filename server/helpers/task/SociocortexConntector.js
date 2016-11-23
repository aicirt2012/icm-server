import config from '../../../config/env';
import TaskConnector from './TaskConnector';
import fetch from 'node-fetch';

class SociocortexConnector extends TaskConnector  {
  constructor(options) {
    super(options);
    this.accessToken = this.options.trelloAccessToken;
    this.accessTokenSecret = this.options.trelloAccessTokenSecret;
  }

  createTask() {
    //Logic for creating task
    return true;
  }

  updateTask(task) {
    //Logic for updating task
    return true;
  }

  deleteTask(task) {
    //Logic for deleting task
    return true;
  }

  search(params) {
    
  }

  addQueries(queries) {
    let queryString = '';
    Object.keys(queries).forEach((key) => {
      queryString += `${key}=${queries[key]}&`;
    })
    console.log(queryString);
    return queryString.slice(0, -1);
  }
}

export default TrelloConnector;
