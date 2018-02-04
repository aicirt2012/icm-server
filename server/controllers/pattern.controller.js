import User from '../models/user.model';
import Pattern from '../models/pattern.model';

/* CREATE PATTERN */
exports.createPattern = (req, res, next) => {
  const pattern = new Pattern();
  pattern.pattern=req.body.pattern;
  pattern.isRegex = req.body.isRegex;
  pattern.user = req.user;
  pattern.save().then(p => {
    res.status(200).send(p);
  }).catch(err => {
    next(err);
  })
}

/* GET SINGLE PATTERN */
exports.getSinglePattern = (req, res, next) => {
  Pattern.findOne({_id: req.params.id, user: req.user})
    .then(data => {
      res.status(200).send(data);
    })
    .catch(err => {
      next(err);
    });
}

/* UPDATE PATTERN */
exports.updatePattern = (req, res, next) => {
  Pattern.findOneAndUpdate({_id: req.params.id, user: req.user}, req.body, {
    new: true,
    upsert: true,
    setDefaultsOnInsert: true
  }, (err, pattern) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send(pattern);
    }
  });
}

/* DELETE PATTERN */
exports.deletePattern = (req, res, next) => {
  Pattern.find({_id: req.params.id, user: req.user}).remove().exec((err, data) => {
    if (err) {
      next(err);
    } else {
      res.status(200).send(data);
    }
  });
}

/* GET ALL PATTERNS */
exports.getAllPatterns = (req, res, next) => {
  Pattern.find({
      user: req.user
  }).then((patterns) => {
    res.status(200).send(patterns);
  }).catch((err) => {
    next(err);
  });
}
