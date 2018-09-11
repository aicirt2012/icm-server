import SociocortexService from "../core/task/sociocortex.service";
import Task from "../models/task.model";
import constants from "../../config/constants";

exports.listWorkspaces = (req, res) => {
  new SociocortexService(req.user)
    .listWorkspaces()
    .then(workspaces => res.status(200).send(workspaces))
    .catch(err => res.status(400).send(err));
};

exports.getCases = (req, res) => {
  new SociocortexService(req.user)
    .getCases(req.params.id)
    .then(cases => res.status(200).send(cases))
    .catch(err => res.status(400).send(err));
};

exports.getCase = (req, res) => {
  new SociocortexService(req.user)
    .getCase(req.params.id)
    .then(scCase => res.status(200).send(scCase))
    .catch(err => res.status(400).send(err));
};

exports.getTasks = (req, res) => {
  new SociocortexService(req.user)
    .getTasks(req.params.id)
    .then(tasks => {
      Task.find({provider: constants.taskProviders.sociocortex, user: req.user._id})
        .then(linkedTasks => {
          if (!linkedTasks)
            linkedTasks = [];
          const filteredTasks = tasks
            .filter(task => !linkedTasks.some(linkedTask => task.providerId === linkedTask.providerId));
          res.status(200).send(filteredTasks);
        }).catch(err => res.status(400).send(err));
    })
    .catch(err => res.status(400).send(err));
};

exports.getPossibleOwners = (req, res) => {
  new SociocortexService(req.user)
    .getPossibleOwners(req.params.id)
    .then(members => res.status(200).send(members))
    .catch(err => res.status(400).send(err));
};

exports.completeTask = (req, res) => {
  Task.findOne({_id: req.params.id, user: req.user._id})
    .then(task => {
      new SociocortexService(req.user)
        .completeTask(task.providerId)
        .then(task => res.status(200).send(task))
        .catch(err => res.status(400).send(err));
    }).catch(err => res.status(400).send(err));
};

exports.terminateTask = (req, res) => {
  Task.findOne({_id: req.params.id, user: req.user._id})
    .then(task => {
      new SociocortexService(req.user)
        .terminateTask(task.providerId)
        .then(task => res.status(200).send(task))
        .catch(err => res.status(400).send(err));
    }).catch(err => res.status(400).send(err));
};
