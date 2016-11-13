import {
  login,
  callback,
  search,
  create
} from '../helpers/task/TrelloConnector';

function getTrelloLogin(req, res) {
  return login(req, res);
}

function getTrelloCallback(req, res) {
  return callback(req, res);
}

function getTrelloSearch(req, res) {
  const params = ['query'];
  return search(req, res, params);
}

function postTrelloCreate(req, res) {
  const params = ['due', 'idList'];
  return create(req, res, params);
}

export default {
  getTrelloLogin,
  getTrelloCallback,
  getTrelloSearch,
  postTrelloCreate
};
