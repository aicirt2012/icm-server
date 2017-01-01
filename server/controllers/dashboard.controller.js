import Email from '../models/email.model';
import mongoose from 'mongoose';
import User from '../models/user.model';
const ObjectId = mongoose.Types.ObjectId;

function getMonthlyPunchCard(userId) {
  return Email.aggregate([
    {$match: {user: ObjectId(userId)}},
    {
      $project: {
        month: {$month: "$date"},
        day: {$dayOfMonth: "$date"}
      }
    },
    {$group: {_id: {month: '$month', day: '$day'}, count: {$sum: 1}}},
    {$sort: {'_id.month': 1, '_id.day': 1}},
    {$project: {_id: 0, month: '$_id.month', day: '$_id.day', count: 1}}
  ]);
}

function getDailyPunchCard(userId) {
  return Email.aggregate([
    {$match: {user: ObjectId(userId)}},
    {
      $project: {
        day: {$dayOfWeek: "$date"},
        hour: {$hour: "$date"},
      }
    },
    {$group: {_id: {day: '$day', hour: '$hour'}, count: {$sum: 1}}},
    {$sort: {'_id.day': 1, '_id.hour': 1}},
    {$project: {_id: 0, day: '$_id.day', hour: '$_id.hour', count: 1}}
  ]);
}

function getTopSender(userId) {
  return Email.aggregate([
    {$match: {user: ObjectId(userId)}},
    {$unwind: '$from'},
    {$group: {_id: {address: '$from.address', name: '$from.name'}, count: {$sum: 1}}},
    {$sort: {count: -1}},
    {$project: {_id: 0, address: '$_id.address', name: '$_id.name', count: 1}}
  ]);
}


function getTopReceiver(userId) {
  return Email.aggregate([
    {$match: {user: ObjectId(userId)}},
    {$unwind: '$to'},
    {$group: {_id: {address: '$to.address', name: '$to.name'}, count: {$sum: 1}}},
    {$sort: {'count': -1}},
    {$project: {_id: 0, address: '$_id.address', name: '$_id.name', count: 1}}
  ]);
}

function getNetworkGraph(userId){

  class Edge{

    constructor(from, to){
      this.from = from.toLowerCase();
      this.to = to.toLowerCase();
      this.count = 1;
    }

    increaseCount(){
      this.count++;
    }

    key(){
      return this.from+'_'+this.to;
    }

    toJson(){
      return {from: this.from, to: this.to, count: this.count};
    }
  }

  /** Not implemented as set due the fact that the
   *  compare for objects is not implemented in es6 */
  const edges = new Map();

  return new Promise((resolve, reject) => {
    Email.find({user: ObjectId(userId)}, {from: 1, to: 1})
      .then((emails)=> {
        emails.forEach(function (email) {
          email.from.forEach(function (from) {
            email.to.forEach(function (to) {
              let edge = new Edge(from.address, to.address);
              if (edges.has(edge.key())) {
                edge = edges.get(edge.key());
                edge.increaseCount();
              } else {
                edges.set(edge.key(), edge);
              }
            });
          });
        });
        let arr = [];
        edges.forEach(function (e) {
          arr.push(e.toJson());
        });
        resolve(arr);
      }).catch((err)=>{
        reject(err);
      });
  });

}

function getSummary(req, res) {

  let userId = null;
  const s = {
    punchcard: {},
    network: {},
    structural: {}
  };

  //TODO may consider only the last 12 month not all data ...
  //TODO differentiate between send, received and all mails
  //TODO use id of current user?? assuming that the dashboard is embedded in WebApp??
  User.findOne()
    .then((user) => {
      userId = user._id;
      return getMonthlyPunchCard(userId);
    })
    .then((monthlySummary) => {
      s.punchcard.monthly = monthlySummary;
      return getDailyPunchCard(userId);
    })
    .then((dailySummary) => {
      s.punchcard.daily = dailySummary;
      return getTopSender(userId)
    })
    .then((topSender) => {
      s.network.topsender = topSender;
      return getTopReceiver(userId)
    })
    .then((topReceiver) => {
      s.network.topreceiver = topReceiver;
      return getNetworkGraph(userId);
    })
    .then((graph) => {
      s.network.graph = graph;
      res.status(200).send(s);
  });
}

function getPunchcard(req, res) {

  User.findOne().then((user, err) => {
    const userId = user._id;

    const s = {
      punchcard: {}
    };

    getDailyPunchCard(userId)
      .then((dailySummary) => {
        let pcards = [];
        dailySummary.forEach((c) => {
          pcards.push([c.day, c.hour, c.count]);
        })
        s.punchcard = pcards;
        res.status(200).send(s);
      });

  });
}

export default {
  getSummary,
  getPunchcard
};
