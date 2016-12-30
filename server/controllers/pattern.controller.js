import User from '../models/user.model';
import Pattern from '../models/pattern.model';

/* CREATE PATTERN */
function createPattern(req, res) {
  const pattern = new Pattern(req.body);
  pattern.isDefault = false;
  pattern.user = req.user;
  pattern.save().then((p) => {
    res.status(200).send(p);
  }).catch((err) => {
    res.status(400).send(err);
  })
}

/* GET SINGLE PATTERN */
function getSinglePattern(req, res) {
  Pattern.findOne({
    $and: [{
      _id: req.params.patternId
    }, {
      user: req.user
    }]
  }).then((data) => {
    res.status(200).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

/* UPDATE TASK */
function updatePattern(req, res) {
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
      res.status(400).send(err);
    } else {
      res.status(200).send(pattern);
    }
  });
}

/* DELETE PATTERN */
function deletePattern(req, res) {
  Pattern.find({
    $and: [{
      _id: req.params.patternId
    }, {
      user: req.user
    }]
  }).remove().exec((err, data) => {
      console.log(err);
      console.log(data);
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(data);
    }
  });
}

/* GET ALL PATTERNS */
function getAllPatterns(req, res) {
  Pattern.find({
    $or: [{
      isDefault: true
    }, {
      user: req.user
    }]
  }).then((patterns) => {
    res.status(200).send(patterns);
  }).catch((err) => {
    res.status(400).send(err);
  });
}

export default {
  createPattern,
  getSinglePattern,
  updatePattern,
  deletePattern,
  getAllPatterns
};
