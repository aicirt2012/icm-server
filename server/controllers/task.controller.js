import url from 'url';
import TrelloConnector from '../helpers/task/TrelloConnector';
import User from '../models/user.model';

function postTrelloCreate(req, res) {
  User.findOne({
    username: req.user.username
  }, (err, user) => {
    if (err) {
      res.status(400).send(err);
      return;
    } else {
      const params = req.body;
      const trelloConnector = new TrelloConnector(user.trello);
      trelloConnector.createTask(params).then((data) => {
        res.status(200).send(data);
      }).catch((err) => {
        res.status(400).send(err);
      });
    }
  });
}

function putTrelloUpdate(req, res) {
  User.findOne({
    username: req.user.username
  }, (err, user) => {
    if (err) {
      res.status(400).send(err);
      return;
    } else {
      const id = (url.parse(req.url, true).pathname).slice(8);
      const params = req.body;
      const trelloConnector = new TrelloConnector(user.trello);
      trelloConnector.updateTask(id, params).then((data) => {
        res.status(200).send(data);
      }).catch((err) => {
        res.status(400).send(err);
      });
    }
  });
}

function deleteTrelloDelete(req, res) {
  User.findOne({
    username: req.user.username
  }, (err, user) => {
    if (err) {
      res.status(400).send(err);
      return;
    } else {
      const id = (url.parse(req.url, true).pathname).slice(8);
      const trelloConnector = new TrelloConnector(user.trello);
      trelloConnector.deleteTask(id).then((data) => {
        res.status(200).send(data);
      }).catch((err) => {
        res.status(400).send(err);
      });
    }
  });
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

export default {
  postTrelloCreate,
  putTrelloUpdate,
  deleteTrelloDelete,
  getTrelloSearch
};
