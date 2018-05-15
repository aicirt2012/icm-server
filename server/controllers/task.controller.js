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
  res.status(400).send("Controller method not yet implemented.");
};

exports.readTask = (req, res) => {
  res.status(400).send("Controller method not yet implemented.");
};

exports.updateTask = (req, res) => {
  res.status(400).send("Controller method not yet implemented.");
};

exports.deleteTask = (req, res) => {
  res.status(400).send("Controller method not yet implemented.");
};

exports.searchTasks = (req, res) => {
  res.status(400).send("Controller method not yet implemented.");
};

function getTaskService(providerName, user) {
  throw "Getting task service on controller level not yet implemented.";
}
