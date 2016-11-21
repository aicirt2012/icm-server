import {
  login,
  callback,
  search,
  create
} from '../helpers/task/TrelloConnector';
import url from 'url';
import TrelloConnector from '../helpers/task/TrelloConnector';
import User from '../models/user.model';

function getTrelloLogin(req, res) {
  return login(req, res);
}

function getTrelloSearch(req, res) {
  User.findOne({
    username: req.user.username
  }, (err, user) => {
    if (err) {
      res.status(400).send(err);
      return;
    } else {
      const params = url.parse(req.url, true).query;
      const trelloConnector = new TrelloConnector(user.trello);
      trelloConnector.search(params).then((data) => {
        res.status(200).send(data);
      }).catch((err) => {
        res.status(400).send(err);
      });
    }
  });
}

function postTrelloCreate(req, res) {
  const params = ['due', 'idList'];
  return create(req, res, params);
}

export default {
  getTrelloLogin,
  getTrelloSearch,
  postTrelloCreate
};
