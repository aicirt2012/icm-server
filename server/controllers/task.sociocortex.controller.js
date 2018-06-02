import SociocortexService from "../core/task/sociocortex.service";

exports.listWorkspaces = (req, res) => {
  new SociocortexService(req.user)
    .listWorkspaces()   // TODO implement
    .then(workspaces => {
      res.status(200).send(workspaces);
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.listMembers = (req, res) => {
  new SociocortexService(req.user)
  // TODO implement
    .completeTask()
    .then(workspaces => {
      res.status(200).send(workspaces);
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.completeTask = (req, res) => {
  new SociocortexService(req.user)
  // TODO implement
    .completeTask()
    .then(workspaces => {
      res.status(200).send(workspaces);
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.terminateTask = (req, res) => {
  new SociocortexService(req.user)
  // TODO implement
    .completeTask()
    .then(workspaces => {
      res.status(200).send(workspaces);
    }).catch(err => {
    res.status(400).send(err);
  });
};
