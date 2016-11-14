import {
  login,
  callback,
  search,
  create
} from '../helpers/task/TrelloConnector';
import url from 'url';
import TrelloConnector from '../helpers/task/TrelloConnector';

function getTrelloLogin(req, res) {
  return login(req, res);
}

function getTrelloCallback(req, res) {
  const query = url.parse(req.url, true).query;
  const trelloConnector = new TrelloConnector();
  trelloConnector.callback(query).then((results) => {
    res.status(200).send(results);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function getTrelloSearch(req, res) {
  const params = url.parse(req.url, true).query;
  const trelloConnector = new TrelloConnector();
  trelloConnector.search(params).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
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
