import Constants from "../../config/constants";
import TrelloService from "../core/task/trello.service";
import SociocortexService from "../core/task/sociocortex.service";
import Email from "../models/email.model";
import Task from "../models/task.model";
import TaskService from "../core/task/task.service";

exports.configure = (req, res) => {
  getTaskService(req.params.id, req.user)
    .configure(req.body.email, req.body.password, req.body.additionalData)
    .then(data => {
      res.status(200).send(data);
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.setup = (req, res) => {
  getTaskService(req.params.id, req.user)
    .setup(req.body)
    .then(data => {
      res.status(200).send(data);
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.teardown = (req, res) => {
  getTaskService(req.params.id, req.user)
    .teardown(req.body)
    .then(data => {
      res.status(200).send(data);
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.createNewTask = (req, res) => {
  Email.findOne({_id: req.body.email, user: req.user._id})
    .then(email => {
      getTaskService(req.body.provider, req.user)
        .create(req.body)
        .then(providerTask => {
          Task.fromProvider(providerTask, email, req.user).save()
            .then(task => {
              res.status(200).send(TaskService.mergeTaskObjects(task, providerTask));
            }).catch(err => {
            res.status(400).send(err);
          });
        }).catch(err => {
        res.status(400).send(err);
      });
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.createLinkedTask = (req, res) => {
  Email.findOne({_id: req.body.email, user: req.user._id})
    .then(email => {
      getTaskService(req.body.provider, req.user)
        .link(req.body.providerId, req.body.frontendUrl)
        .then(providerTask => {
          Task.fromProvider(providerTask, email, req.user).save()
            .then(task => {
              res.status(200).send(TaskService.mergeTaskObjects(task, providerTask));
            }).catch(err => {
            res.status(400).send(err);
          })
        })
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.readTask = (req, res) => {
  Task.findOne({_id: req.params.id, user: req.user._id})
    .then(task => {
      getTaskService(task.provider, req.user)
        .get(task.providerId)
        .then(providerTask => {
          res.status(200).send(TaskService.mergeTaskObjects(task, providerTask));
        }).catch(err => {
        res.status(400).send(err);
      });
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.updateTask = (req, res) => {
  // load task from DB to ensure correct current provider is used
  Task.findOne({_id: req.params.id, user: req.user._id})
    .then(task => {
      getTaskService(task.provider, req.user)
        .update(task.providerId, req.body)
        .then(providerTask => {
          res.status(200).send(TaskService.mergeTaskObjects(task, providerTask));
        }).catch(err => {
        res.status(400).send(err);
      });
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.deleteTask = (req, res) => {
  Task.findOne({_id: req.params.id, user: req.user._id})
    .then(task => {
      getTaskService(task.provider, req.user)
        .delete(task.providerId)
        .then(() => {
          Task.deleteOne({_id: req.params.id})
            .then(data => {
              res.status(200).send(data);
            });
        }).catch(err => {
        res.status(400).send(err);
      });
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.unlinkTask = (req, res) => {
  Task.findOne({_id: req.params.id, user: req.user._id})
    .then(task => {
      getTaskService(req.body.provider, req.user)
        .unlink(task.providerId, req.body.frontendUrl)
        .then(() => {
          Task.deleteOne({_id: req.params.id})
            .then(data => {
              res.status(200).send(data);
            });
        }).catch(err => {
        res.status(400).send(err);
      });
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.listTasks = (req, res) => {
  Task.find({user: req.user._id})
    .then(tasks => {
      // TODO make parallel
      tasks.forEach(task => {
        getTaskService(task.provider, req.user)
          .get(task.providerId)
          .then(providerTask => {
            task = TaskService.mergeTaskObjects(task, providerTask);
          });
      });
      res.status(200).send(tasks);
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.searchTasks = (req, res) => {
  // FIXME do not just pass request body to mongo, potential security risk, current implementation only for development
  req.body.user = req.user._id;
  Task.find(req.body).then(tasks => {
    res.status(200).send(tasks);
  }).catch(err => {
    res.status(400).send(err);
  });
};

exports.listExternalTasks = (req, res) => {
  getTaskService(req.params.id, req.user)
    .list()
    .then(tasks => {
      res.status(200).send(tasks);
    }).catch(err => {
    res.status(400).send(err);
  });
};

function getTaskService(providerName, user) {
  switch (providerName) {
    case Constants.taskProviders.trello:
      return new TrelloService(user);
    case Constants.taskProviders.sociocortex:
      return new SociocortexService(user);
    default:
      throw new Error("No such task service: '" + providerName + "'.");
  }
}
