import User from '../models/user.model';

function get(req, res) {
  User.findOne({
      _id: req.params.id
    })
    .then((user, err) => {
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send(err);
      }
    })
}

function create(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  });
  user.save()
    .then((user) => {
      res.status(200).send(user);
    }).catch((err) => {
      res.status(404).send(err);
    });
}

function update(req, res) {
  User.findOneAndUpdate({
    _id: req.params.id
  }, req.body, {
    new: true
  }, (err, user) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(user);
    }
  });
}

function list(req, res, next) {
  const options = {
    page: req.query.page ? parseInt(req.query.page) : 1,
    limit: req.query.limit ? parseInt(req.query.limit) : 10,
    sort: {
      createdAt: -1
    }
  };
  const query = {};
  User.paginate(query, options).then((users, err) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(users);
    }
  });
}

function remove(req, res, next) {
  User.findByIdAndRemove(req.params.id)
    .then((user, err) => {
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send(err);
      }
    })
}

export default {
  get,
  create,
  update,
  list,
  remove
};
