import Task from "../models/task.model";
import TaskService from "../core/task/task.service";

exports.configure = (req, res) => {
  TaskService.get(req.params.id, req.user)
    .configure(req.body.username, req.body.password, req.body)
    .then((data) => {
      res.status(200).send(data);
    }).catch((err) => {
    res.status(400).send(err);
  });
};

exports.setup = (req, res) => {
  TaskService.get(req.params.id, req.user)
    .setup(req.body)
    .then((data) => {
      res.status(200).send(data);
    }).catch((err) => {
    res.status(400).send(err);
  });
};

exports.teardown = (req, res) => {
  TaskService.get(req.params.id, req.user)
    .teardown(req.body)
    .then((data) => {
      res.status(200).send(data);
    }).catch((err) => {
    res.status(400).send(err);
  });
};

exports.createTask = (req, res) => {
  TaskService.get(req.body.provider, req.user)
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
    TaskService.get(task.provider, req.user)
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
    TaskService.get(task.provider, req.user)
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
    TaskService.get(task.provider, req.user)
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
