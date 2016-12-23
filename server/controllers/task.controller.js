import url from 'url';
import TrelloConnector from '../core/task/TrelloConnector';
import SociocortexConnector from '../core/task/SociocortexConnector';
import User from '../models/user.model';
import Email from '../models/email.model';

function taskCreate(req, res) {
  const user = req.user.trello;
  const body = req.body;
  const trelloConnector = new TrelloConnector(user);
  trelloConnector.createTask(body).then((task) => {
    Email.findById(req.params.emailId, (err, email) => {
      if (err) {
        res.status(400).send(err);
      } else {
        email.tasks.push({
          id: task.id,
          date: new Date()
        });
        email.save().then((email) => {
          res.status(200).send(task);
        });
      }
    });
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
  const body = req.body;
  const trelloConnector = new TrelloConnector(user);
  trelloConnector.updateTask(id, body).then((data) => {
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

function getAllBoardsForMember(req, res) {
  const user = req.user.trello;
  const params = req.query;
  params['lists'] = 'all';
  const trelloConnector = new TrelloConnector(user);
  trelloConnector.getBoardsForMember(params).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function getAllListsForBoard(req, res) {
  const user = req.user.trello;
  const params = req.query;
  const boardId = req.params.boardId;
  const trelloConnector = new TrelloConnector(user);
  trelloConnector.getListsForBoard(boardId, params).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function getAllCardsForList(req, res) {
    const user = req.user.trello;
    const params = req.query;
    const listId = req.params.listId;
    const trelloConnector = new TrelloConnector(user);
    trelloConnector.getCardsForList(listId, params).then((data) => {
      res.status(200).send(data);
    }).catch((err) => {
      res.status(400).send(err);
    });
}

function registerSociocortex(req, res) {
  const options = req.user.sociocortex || {};
  const scConnector = new SociocortexConnector(options);
  scConnector.register(req.user, req.body.scUsername, req.body.scEmail,
    req.body.scPassword).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function connectSociocortex(req, res) {
  const options = req.user.sociocortex || {};
  const scConnector = new SociocortexConnector(options);
  scConnector.connect(req.user, req.body.email, req.body.password).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

export default {
  taskCreate,
  taskGet,
  taskUpdate,
  taskDelete,
  taskSearch,
  registerSociocortex,
  connectSociocortex,
  getAllBoardsForMember,
  getAllListsForBoard,
  getAllCardsForList
};
