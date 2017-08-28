import Email from '../models/email.model';
import mongoose from 'mongoose';
import User from '../models/user.model';
import striptags from 'striptags';
const ObjectId = mongoose.Types.ObjectId;

function getMonthlyPunchCardWithYear(userId) {
  return Email.aggregate([
    {$match: {user: ObjectId(userId)}},
    {$group: {_id: {year: {$year: "$date"}, month: {$month: "$date"}, day: {$dayOfMonth: "$date"}}, count: {$sum: 1}}},
    {$sort: {'_id.year':1, '_id.month': 1, '_id.day': 1}},
    {$project: {_id: 0, year: '$_id.year', month: '$_id.month', day: '$_id.day', count: 1}}
  ]);
}

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

function getTopFrom(userId) {
  return Email.aggregate([
    {$match: {user: ObjectId(userId)}},
    {$unwind: '$from'},
    {$group: {_id: { $toLower:'$from.address'}, count: {$sum: 1}}},
    {$sort: {count: -1}},
    {$project: {_id: 0, address: '$_id', count: 1}},
    {$limit : 15}
  ]);
}


function getTopTo(userId) {
  return Email.aggregate([
    {$match: {user: ObjectId(userId)}},
    {$unwind: '$to'},
    {$group: {_id: { $toLower:'$to.address'}, count: {$sum: 1}}},
    {$sort: {'count': -1}},
    {$project: {_id: 0, address: '$_id', count: 1}},
    {$limit : 15}
  ]);
}

function getTopCC(userId) {
  return Email.aggregate([
    {$match: {user: ObjectId(userId)}},
    {$unwind: '$cc'},
    {$group: {_id: { $toLower:'$cc.address'}, count: {$sum: 1}}},
    {$sort: {'count': -1}},
    {$project: {_id: 0, address: '$_id', count: 1}},
    {$limit : 15}
  ]);
}

function getTopBCC(userId) {
  return Email.aggregate([
    {$match: {user: ObjectId(userId)}},
    {$unwind: '$bcc'},
    {$group: {_id: { $toLower:'$bcc.address'}, count: {$sum: 1}}},
    {$sort: {'count': -1}},
    {$project: {_id: 0, address: '$_id', count: 1}},
    {$limit : 15}
  ]);
}

function getNetworkGraph(userId){

  class Edge{

    constructor(from, to){
      if(from)
        this.from = from.toLowerCase();
      if(to)
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

  class Node{

    constructor(email, name){
      if(email)
        this.email = email.toLowerCase();
      this.name = name;
    }

    key(){
      return this.email;
    }

    toJson(){
      return {email: this.email, name: this.name};
    }
  }

  /** Not implemented as set due the fact that the
   *  compare for objects is not implemented in es6 */
  const edges = new Map();
  const nodes = new Map();

  return new Promise((resolve, reject) => {
    Email.find({user: ObjectId(userId)}, {from: 1, to: 1}).lean()
      .then((emails)=> {
        emails.forEach((email)=> {
          if(email.from != null)
            email.from.forEach((from)=> {
              if(email.to != null)
                email.to.forEach((to)=> {
                  let edge = new Edge(from.address, to.address);
                  if (edges.has(edge.key())) {
                    edge = edges.get(edge.key());
                    edge.increaseCount();
                  } else {
                    edges.set(edge.key(), edge);
                  }
                  let node = new Node(from.address, from.name);
                  if(!nodes.has(node.key()))
                    nodes.set(node.key(), node);
                  node = new Node(to.address, to.name);
                  if(!nodes.has(node.key()))
                    nodes.set(node.key(), node);
                });
            });
        });
        const g = {
          edges: [],
          nodes: []
        };
        edges.forEach((e)=> {
          g.edges.push(e.toJson());
        });
        nodes.forEach((n)=> {
          g.nodes.push(n.toJson());
        });
        resolve(g);
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
    {$match: {user: userId}},
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

exports.getTimeline = (req, res) => {
  let userId = req.user._id;
  const s = {};
  console.log(userId);
  getMonthlyPunchCard(userId)
    .then((m) => {
      s.monthly = m;
      return getDailyPunchCard(userId);
    })
    .then((d) => {
      s.daily = d;
      res.status(200).send(s);
    });
}

exports.getNetwork = (req, res) => {
  let userId = req.user._id;
  const s = {};
  getTopFrom(userId)
    .then(from => {
      s.topfrom = from;
      return getTopTo(userId);
    })
    .then(to => {
      s.topto = to;
      return getTopCC(userId);
    })
    .then(cc => {
      s.topcc = cc;
      return getTopBCC(userId);
    })
    .then(bcc =>{
      s.topbcc = bcc;
      return getNetworkGraph(userId);
    })
    .then((g) => {
      s.graph = g;
      res.status(200).send(s);
    });
}

exports.getStructure = (req, res) => {
  let userId = req.user._id;
  const s = {};
  getConversations(userId)
    .then((c)=>{
      s.converstations = c;
      return getLabels(userId);
    })
    .then((l)=>{
      s.labels = l;
      res.status(200).send(s);
    });
}

exports.getSummary = (req, res) => {

  let userId = null;
  const s = {
    punchcard: {},
    network: {},
    structural: {}
  };

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
      return getTopFrom(userId)
    })
    .then((topSender) => {
      s.network.topsender = topSender;
      return getTopTo(userId)
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