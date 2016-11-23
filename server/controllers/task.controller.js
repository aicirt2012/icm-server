import url from 'url';
import TrelloConnector from '../helpers/task/TrelloConnector';
import User from '../models/user.model';

function taskGetAll(req, res) {
  User.findOne({
    _id: req.user._id
  }, (err, user) => {
    if (err) {
      res.status(400).send(err);
      return;
    } else {
      const params = url.parse(req.url, true).query;
      const trelloConnector = new TrelloConnector(user.trello);
      trelloConnector.taskGetAll(params).then((data) => {
        res.status(200).send(data);
      }).catch((err) => {
        res.status(400).send(err);
      });
    }
  });
}

function taskCreate(req, res) {
  User.findOne({
    _id: req.user._id
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

function taskGet(req, res) {
  User.findOne({
    _id: req.user._id
  }, (err, user) => {
    if (err) {
      res.status(400).send(err);
      return;
    } else {
      const id = req.params.idTask;
      console.log(id);
      const trelloConnector = new TrelloConnector(user.trello);
      trelloConnector.getTask(id).then((data) => {
        res.status(200).send(data);
      }).catch((err) => {
        res.status(400).send(err);
      });
    }
  });
}

function taskUpdate(req, res) {
  User.findOne({
    _id: req.user._id
  }, (err, user) => {
    if (err) {
      res.status(400).send(err);
      return;
    } else {
      const id = req.params.idTask;
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

function taskDelete(req, res) {
  User.findOne({
    _id: req.user._id
  }, (err, user) => {
    if (err) {
      res.status(400).send(err);
      return;
    } else {
      const id = req.params.idTask;
      const trelloConnector = new TrelloConnector(user.trello);
      trelloConnector.deleteTask(id).then((data) => {
        res.status(200).send(data);
      }).catch((err) => {
        res.status(400).send(err);
      });
    }
  });
}

function taskSearch(req, res) {
  User.findOne({
    _id: req.user._id
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
  taskGetAll,
  taskCreate,
  taskGet,
  taskUpdate,
  taskDelete,
  taskSearch
};
