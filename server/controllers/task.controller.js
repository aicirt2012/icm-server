import Constants from "../../config/constants";
import TrelloService from "../core/task/trello.service";
import SociocortexService from "../core/task/sociocortex.service";
import Task from "../models/task.model";

exports.configure = (req, res) => {
  getTaskService(req.params.id, req.user)
    .configure(req.body.username, req.body.password, req.body)
    .then((data) => {
      res.status(200).send(data);
    }).catch((err) => {
    res.status(400).send(err);
  });
};

exports.setup = (req, res) => {
  getTaskService(req.params.id, req.user)
    .setup(req.body)
    .then((data) => {
      res.status(200).send(data);
    }).catch((err) => {
    res.status(400).send(err);
  });
};

exports.teardown = (req, res) => {
  getTaskService(req.params.id, req.user)
    .teardown(req.body)
    .then((data) => {
      res.status(200).send(data);
    }).catch((err) => {
    res.status(400).send(err);
  });
};

exports.createTask = (req, res) => {
  getTaskService(req.body.provider, req.user)
    .create(req.body)
    .then((task) => {
      task.save().then((result) => {
        res.status(200).send(result);
      })
    }).catch((err) => {
    res.status(400).send(err);
  });
};

exports.readTask = (req, res) => {
  Task.findById(req.params.id).then((task) => {
    getTaskService(task.provider, req.user)
      .get(task.providerId)
      .then((data) => {
        res.status(200).send(data);
      });
  }).catch((err) => {
    res.status(400).send(err);
  });
};

exports.updateTask = (req, res) => {
  // load task from DB to ensure correct current provider is used
  Task.findById(req.params.id).then((task) => {
    getTaskService(task.provider, req.user)
      .update(task.providerId, req.body)
      .then((data) => {
        res.status(200).send(data);
      });
  }).catch((err) => {
    res.status(400).send(err);
  });
};

exports.deleteTask = (req, res) => {
  Task.findById(req.params.id).then((task) => {
    getTaskService(task.provider, req.user)
      .delete(task.providerId)
      .then(() => {
        Task.delete(req.params.id)
          .then((data) => {
            res.status(200).send(data);
          });
      });
  }).catch((err) => {
    res.status(400).send(err);
  });
};

exports.searchTasks = (req, res) => {
  // FIXME do not just pass request body to mongo, potential security risk, current implementation only for development
  Task.find(req.body).then((tasks) => {
    res.status(200).send(tasks);
  }).catch((err) => {
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
