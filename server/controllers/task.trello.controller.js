import TrelloService from "../core/task/trello.service";
import Task from "../models/task.model";
import TaskService from "../core/task/task.service";

exports.listBoards = (req, res) => {
  new TrelloService(req.user)
    .listBoards()
    .then(boards => res.status(200).send(boards))
    .catch(err => res.status(400).send(err));
};

exports.archiveTask = (req, res) => {
  const trelloService = new TrelloService(req.user);
  Task.findOne({_id: req.params.id, user: req.user._id})
    .then(icmTask => trelloService.get(icmTask.providerId)
      .then(task => {
        task.isOpen = false;
        trelloService.update(icmTask.providerId, task)
          .then(providerTask => res.status(200).send(TaskService.mergeTaskObjects(icmTask, providerTask)))
          .catch(err => res.status(400).send(err));
      }).catch(err => res.status(400).send(err)))
    .catch(err => res.status(400).send(err));
};

exports.listMembers = (req, res) => {
  new TrelloService(req.user)
    .getMembers(req.params.id)
    .then(members => res.status(200).send(members))
    .catch(err => res.status(400).send(err));
};

exports.getTasks = (req, res) => {
  new TrelloService(req.user)
    .getTasks(req.params.id)
    .then(tasks => res.status(200).send(tasks))
    .catch(err => res.status(400).send(err));
};
