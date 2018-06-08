import TrelloService from "../core/task/trello.service";
import Task from "../models/task.model";

exports.listBoards = (req, res) => {
  new TrelloService(req.user)
    .listBoards()
    .then(boards => {
      res.status(200).send(boards);
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.archiveTask = (req, res) => {
  Task.findOne({_id: req.params.id, user: req.user._id})
    .then(task => {
      new TrelloService(req.user)
        .update(task.providerId, req.body)
        .then(providerTask => {
          task = task.toObject();
          task.parameters = providerTask.parameters;
          res.status(200).send(task);
        }).catch(err => {
        res.status(400).send(err);
      });
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.listMembers = (req, res) => {
  new TrelloService(req.user)
    .getMembers(req.params.id)
    .then(members => {
      res.status(200).send(members);
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.getTasks = (req, res) => {
  new TrelloService(req.user)
    .getTasks(req.params.id)
    .then(members => {
      res.status(200).send(members);
    }).catch(err => {
    res.status(400).send(err);
  });
};
