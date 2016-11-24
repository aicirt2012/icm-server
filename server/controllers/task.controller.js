import url from 'url';
import TrelloConnector from '../helpers/task/TrelloConnector';
import User from '../models/user.model';

function taskGetAll(req, res) {
  const user = req.user.trello;
  const params = req.query;
  const trelloConnector = new TrelloConnector(user);
  trelloConnector.taskGetAll(params).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function taskCreate(req, res) {
  const user = req.user.trello;
  const params = req.body;
  const trelloConnector = new TrelloConnector(user);
  trelloConnector.createTask(params).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function taskGet(req, res) {
  const user = req.user.trello;
  const id = req.params.idTask;
  const trelloConnector = new TrelloConnector(user);
  trelloConnector.getTask(id).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function taskUpdate(req, res) {
  const user = req.user.trello;
  const id = req.params.idTask;
  const params = req.body;
  const trelloConnector = new TrelloConnector(user);
  trelloConnector.updateTask(id, params).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function taskDelete(req, res) {
  const user = req.user.trello;
  const id = req.params.idTask;
  const trelloConnector = new TrelloConnector(user);
  trelloConnector.deleteTask(id).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function taskSearch(req, res) {
  const user = req.user.trello;
  const params = req.query;
  const trelloConnector = new TrelloConnector(user);
  trelloConnector.search(params).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
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
