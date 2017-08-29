import User from '../models/user.model';

exports.get = (req, res, next) => {
  User.findOne({_id: req.params.id}).exec()
    .then(user => {
      res.status(200).send(user);
    })
    .catch(err=>{
      next(err);
    })
}

exports.create = (req, res, next) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
    email: req.body.email
  });
  user.save()
    .then(user => {
      res.status(200).send(user);
    }).catch(err => {
      next(err);
    });
}

exports.update = (req, res, next) => {
  User.findOneAndUpdate({_id: req.params.id}, req.body, {new: true}).exec()
    .then(user => {
      res.status(200).send(user);
    }).catch(err=>{
      next(err); 
    });
}

exports.list = (req, res, next) => {
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

exports.remove = (req, res, next) => {
  //TODO remove all emails and all related stuff
  User.findByIdAndRemove(req.params.id)
    .then((user, err) => {
      if (user) {
        res.status(200).send(user);
      } else {
        res.status(404).send(err);
      }
    })
}
