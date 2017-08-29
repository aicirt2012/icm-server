import User from '../models/user.model';
import Pattern from '../models/pattern.model';

/* CREATE PATTERN */
exports.createPattern = (req, res, next) => {
  const pattern = new Pattern(req.body);
  pattern.isDefault = false;
  pattern.user = req.user;
  pattern.save().then(p => {
    res.status(200).send(p);
  }).catch(err => {
    next(err);
  })
}

/* GET SINGLE PATTERN */
exports.getSinglePattern = (req, res, next) => {
  Pattern.findOne({
    $and: [{
      _id: req.params.patternId
    }, {
      user: req.user
    }]
  }).then(data => {
    res.status(200).send(data);
  }).catch(err => {
    next(err);
  });
}

/* UPDATE PATTERN */
exports.updatePattern = (req, res, next) => {
  Pattern.findOneAndUpdate({
    $and: [{
      _id: req.params.patternId
    }, {
      user: req.user
    }]
  }, req.body, {
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
  Pattern.find({
    $and: [{
      _id: req.params.patternId
    }, {
      user: req.user
    }]
  }).remove().exec((err, data) => {
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
    $or: [{
      isDefault: true
    }, {
      user: req.user
    }]
  }).then((patterns) => {
    res.status(200).send(patterns);
  }).catch((err) => {
    next(err);
  });
}