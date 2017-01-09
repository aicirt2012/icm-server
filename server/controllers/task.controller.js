import SociocortexConnector from '../core/task/SociocortexConnector'; //TODO: remove once SC implementation is finished
import {createTaskConnector} from '../core/task/util'
import User from '../models/user.model';
import Email from '../models/email.model';
import Task from '../models/task.model';
import TrainingData from '../models/trainingData.model';

/*
 * CREATE TASK
 * BODY: {..., sentenceId, sentences}
 */
function createTask(req, res) {
  createTaskConnector(req.query.provider, req.user).createTask(req.body).then((t) => {
    let task = new Task();
    task['taskId'] = t.id;
    task['provider'] = req.query.provider || 'trello';
    task['email'] = req.params.emailId || null;
    task.save().then((result) => {
      if (req.params.emailId) {
        TrainingData.findOne({email: result.email, sentenceId: req.body.sentenceId}).then((td) => {
          if (td) {
            td.label = true;
            td.task = result;
            td.save();
          } else {
            req.body.sentences.forEach((s) => {
              let tdSet = new TrainingData({
                text: s.sentence,
                label: s.id == req.body.sentenceId,
                email: result.email,
                sentenceId: s.id
              });
              if (s.id == req.body.sentenceId) {
                tdSet['task'] = result;
              }
              tdSet.save();
            });
          }
        });
      }
      res.status(200).send(t);
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* GET SINGLE TASK */
function getSingleTask(req, res) {
  createTaskConnector(req.query.provider, req.user).getTask(req.params.taskId).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* UPDATE TASK */
function updateTask(req, res) {
  createTaskConnector(req.query.provider, req.user).updateTask(req.params.taskId, req.body).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* DELETE TASK */
function deleteTask(req, res) {
  createTaskConnector(req.query.provider, req.user).deleteTask(req.params.taskId).then((data) => {
    Task.findOne({taskId: req.params.taskId}).then((task) => {
      TrainingData.findOne({task: task}).then((td) => {
        if (td) {
          td.task = null;
          td.label = false;
          td.save();
        }
        Task.remove({taskId: req.params.taskId}).then((value) => {
          res.status(200).send(value);
        });
      });
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* UNLINK TASK */
function unlinkTask(req, res) {
  Task.findOne({taskId: req.params.taskId}).then((task) => {
    TrainingData.findOne({task: task}).then((td) => {
      if (td) {
        td.task = null;
        td.label = false;
        td.save();
      }
      Task.remove({taskId: req.params.taskId}).then((value) => {
        res.status(200).send(value);
      });
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* SEARCH TASKS */
function searchTasks(req, res) {
  createTaskConnector(req.query.provider, req.user).search(req.query).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* GET ALL BOARDS (+ LISTS) FOR MEMBER */
function getAllBoardsForMember(req, res) {
  createTaskConnector(req.query.provider, req.user).getBoardsForMember(req.query).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* GET ALL LISTS FOR BOARD */
function getAllListsForBoard(req, res) {
  createTaskConnector(req.query.provider, req.user).getListsForBoard(req.params.boardId, req.query).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* GET ALL CARDS FOR LIST */
function getAllCardsForList(req, res) {
  createTaskConnector(req.query.provider, req.user).getCardsForList(req.params.listId, req.query).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* REGISTER NEW USER IN SOCIOCORTEX */
// TODO: needs generalization ?
function registerSociocortex(req, res) {
  const options = req.user.sociocortex || {};
  const scConnector = new SociocortexConnector(options);
  scConnector.register(req.user, req.body.scUsername, req.body.scEmail, req.body.scPassword).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* LOG IN SOCIOCORTEX */
// TODO: needs generalization ?
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
  createTask,
  searchTasks,
  deleteTask,
  unlinkTask,
  updateTask,
  getSingleTask,
  getAllListsForBoard,
  getAllBoardsForMember,
  getAllCardsForList,
  registerSociocortex,
  connectSociocortex
};
