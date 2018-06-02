import TrelloService from "../core/task/trello.service";

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
  // TODO implement (simple PUT with closed=true)
  new TrelloService(req.user)
    .listBoards()
    .then(boards => {
      res.status(200).send(boards);
    }).catch(err => {
    res.status(400).send(err);
  });
};

exports.listMembers = (req, res) => {
  // TODO implement
  new TrelloService(req.user)
    .listBoards()
    .then(boards => {
      res.status(200).send(boards);
    }).catch(err => {
    res.status(400).send(err);
  });
};
