import SociocortexConnector from '../core/task/SociocortexConnector'; //TODO: remove once SC implementation is finished
import { createTaskConnector } from '../core/task/util'
import User from '../models/user.model';
import Email from '../models/email.model';
import Task from '../models/task.model';
import TrainingData from '../models/trainingData.model';
import TaskService from "../core/task/TaskService";

/*
 * CREATE TASK
 * BODY: {..., sentenceId, sentences}
 */
exports.createTask = (req, res) => {
  let connector = createTaskConnector(req.query.provider, req.user);
  connector.createTask(req.body).then((task) => {
    if (req.body.sourceUrl && req.body.sourceUrl.length > 0) {
      return connector.attachUrl(task.id, req.body.sourceUrl).then(resp => {
          return task;
        }
      )
    } else {
      return task;
    }
  }).then((t) => {
    let task = new Task();
    task['taskId'] = t.id;
    task['provider'] = req.query.provider || 'trello';
    task['email'] = req.params.emailId || null;
    task.save().then((result) => {
      if (req.params.emailId) {
        TrainingData.findOne({ email: result.email, sentenceId: req.body.sentenceId }).then((td) => {
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
                sentenceId: s.id,
                user: req.user
              });
              if (s.id == req.body.sentenceId) {
                tdSet['task'] = result;
              }
              tdSet.save();
            });
          }
        });
        Email.findOne({ _id: result.email }).then((e) => {
          result['thrid'] = e.thrid;
          result.save();
        });
      }
      res.status(200).send(t);
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* GET SINGLE TASK */
exports.getSingleTask = (req, res) => {
  TaskService.getTaskWithBoardMembers(req.params.taskId,req.query.provider, req.user).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* UPDATE TASK */
exports.updateTask = (req, res) => {
  createTaskConnector(req.query.provider, req.user).updateTask(req.params.taskId, req.body).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* DELETE TASK */
exports.deleteTask = (req, res) => {
  createTaskConnector(req.query.provider, req.user).deleteTask(req.params.taskId).then((data) => {
    Task.findOne({ taskId: req.params.taskId }).then((task) => {
      TrainingData.findOne({ task: task }).then((td) => {
        if (td) {
          td.task = null;
          td.label = false;
          td.save();
        }
        Task.remove({ taskId: req.params.taskId }).then((value) => {
          res.status(200).send(value);
        });
      });
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* LINK TASK TO MAIL */
exports.linkTaskToMail = (req, res) => {
  let task = new Task();
  task['email'] = req.params.emailId;
  task['provider'] = req.query.provider || 'trello';
  task['taskId'] = req.body.taskId;
  task.save().then((t) => {
    Email.findOne({ _id: t.email }).then((e) => {
      task['thrid'] = e.thrid;
      task.save();
    });
    res.status(200).send(t);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* UNLINK TASK */
exports.unlinkTask = (req, res) => {
  Task.findOne({ taskId: req.params.taskId }).then((task) => {
    TrainingData.findOne({ task: task }).then((td) => {
      if (td) {
        td.task = null;
        td.label = false;
        td.save();
      }
      Task.remove({ taskId: req.params.taskId }).then((value) => {
        res.status(200).send(value);
      });
    });
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* SEARCH TASKS */
exports.searchTasks = (req, res) => {
  createTaskConnector(req.query.provider, req.user).search(req.query).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* SEARCH MEMBERS */
exports.searchMembers = (req, res) => {
  createTaskConnector(req.query.provider, req.user).searchMembers(req.query).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}


/* GET ALL BOARDS (+ LISTS) FOR MEMBER */
exports.getAllBoardsForMember = (req, res) => {
  TaskService.getBoardsForMember(req.query.provider, req.user).then((data) => {
    if (req.query.linkedTasks) {
      let promises = [];
      data.forEach((board) => {
        promises.push(markLinkedTasksInCards(board.cards));
      })
      Promise.all(promises).then(() => {
          res.status(200).send(data);
        })
    } else {
      res.status(200).send(data);
    }
  }).catch((err) => {
    res.status(400).send(err);
  });
}

function markLinkedTasksInCards(cards) {
  return new Promise((resolve, reject) => {
    let promises = [];
    cards.forEach((c) => {
      promises.push(new Promise((resolve, reject) => {
        Task.findOne({
          taskId: c.id
        }).populate({
          path: 'email',
          select: 'box',
          // select: 'boxes'
        }).then((task) => {
          if (task && task.email) {
            c.isLinked = true;
            c.linkedBox = task.email.box.id;
            c.linkedEmail = task.email._id;
          }
          resolve();
        })
      }));
    })
    Promise.all(promises).then(resolve)
  })
}

/* GET ALL LISTS FOR BOARD */
exports.getAllListsForBoard = (req, res) => {
  createTaskConnector(req.query.provider, req.user).getListsForBoard(req.params.boardId, req.query).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* GET ALL CARDS FOR LIST */
exports.getAllCardsForList = (req, res) => {
  createTaskConnector(req.query.provider, req.user).getCardsForList(req.params.listId, req.query).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* GET CARDS FOR MEMBER */
exports.searchCardsForMembers = (req, res) => {
  if (req.body.emailAddresses.length > 0) {
    const taskConnector = createTaskConnector(req.query.provider, req.user);
    let promises = [];
    req.body.emailAddresses.forEach((e) => {
      promises.push(new Promise((resolve, reject) => {
        taskConnector.searchMembers({ query: e }, req.query).then((members) => {
          if (members.length > 0 && members[0].id) {
            taskConnector.getCardsForMember(members[0].id, req.query).then((data) => {
              resolve(data);
            })
          } else {
            resolve([]);
          }
        }).catch((err) => {
          reject(err);
        })
      }))
    });
    Promise.all(promises).then((results) => {
      let cards = [];
      results.forEach((m) => {
        cards = [...cards, ...m];
      });
      cards = cards.reduce((a, b) => {
        return a.findIndex((e) => e.id == b.id) > -1 ? a : a.concat(b)
      }, []);
      res.status(200).send(cards);
    }).catch((err) => {
        res.status(400).send(err);
      });
  } else {
    res.status(200).send([]);
  }
}

/* REGISTER NEW USER IN SOCIOCORTEX */
// TODO: needs generalization ?
exports.registerSociocortex = (req, res) => {
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
exports.connectSociocortex = (req, res) => {
  const options = req.user.sociocortex || {};
  const scConnector = new SociocortexConnector(options);
  scConnector.connect(req.user, req.body.email, req.body.password).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}
