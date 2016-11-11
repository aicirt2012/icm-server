import {
  login,
  callback,
  search
} from '../helpers/task/TrelloConnector';

function getTrelloLogin(req, res) {
  return login(req, res);
}

function getTrelloCallback(req, res) {
  return callback(req, res);
}

function getTrelloSearch(req, res) {
  return search(req, res);
}

export default {
  getTrelloLogin,
  getTrelloCallback,
  getTrelloSearch
};
