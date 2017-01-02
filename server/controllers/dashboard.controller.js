import Email from '../models/email.model';
import mongoose from 'mongoose';
import User from '../models/user.model';
import striptags from 'striptags';
const ObjectId = mongoose.Types.ObjectId;

function getMonthlyPunchCard(userId) {
  return Email.aggregate([
    {$match: {user: ObjectId(userId)}},
    {$group: {_id: {month: {$month: "$date"}, day: {$dayOfMonth: "$date"}}, count: {$sum: 1}}},
    {$sort: {'_id.month': 1, '_id.day': 1}},
    {$project: {_id: 0, month: '$_id.month', day: '$_id.day', count: 1}}
  ]);
}

function getDailyPunchCard(userId) {
  return Email.aggregate([
    {$match: {user: ObjectId(userId)}},
    {$group: {_id: {day: {$dayOfWeek: "$date"}, hour: {$hour: "$date"}}, count: {$sum: 1}}},
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
        emails.forEach((email)=> {
          email.from.forEach((from)=> {
            email.to.forEach((to)=> {
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
        const arr = [];
        edges.forEach((e)=> {
          arr.push(e.toJson());
        });
        resolve(arr);
      }).catch((err)=>{
        reject(err);
      });
  });
}

function getActions(userId){
  return {
    all: undefined,
    needreply: undefined,
    noreply : undefined,
  }
}

function getLabels(userId){
  return Email.aggregate([
    {$match: {user: userId}},
    {$unwind: '$labels'},
    {$group: {_id: {label: '$labels'}, count: {$sum: 1}}},
    {$sort: {count: -1}},
    {$project: {_id: 0, label: '$_id.label', count: 1}}
  ]);
}

function getConversations(userId){
  return Email.aggregate([
    {$match: {user: ObjectId("5836fe8a14272b01c404257c")}},
    {$group: {_id: {thrid: '$thrid'}, nrmsg: {$sum: 1}}},
    {$group: {_id: {nrmsg: '$nrmsg'}, nrthr: {$sum: 1}}},
    {$project: {_id: 0, nrmsg: '$_id.nrmsg', nrthr: 1}},
    {$sort: {nrmsg: -1}}
  ]);
}

//TODO remove
function testNer(){
  Email.find({}).then((emails)=>{
    emails.forEach((email)=>{
      if(email.text != undefined){
        email.plainText = email.text;
      }else if(email.html != undefined){
        email.plainText = striptags(email.html);
      }
      console.log(email.flags);
      console.log(email.labels);
      console.log('#############');

    });
    console.log(emails.length);
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
      return getActions(userId);
    })
    .then((actions)=>{
      s.structural.actions = actions;
      return getConversations(userId)
    })
    .then((conversations)=>{
      s.structural.converstations = conversations;
      return getLabels(userId)
    })
    .then((labels)=>{
      s.structural.labels = labels;
      res.status(200).send(s);
    })
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
