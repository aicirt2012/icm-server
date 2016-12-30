import Email from '../models/email.model';
import mongoose from 'mongoose';
const ObjectId = mongoose.Types.ObjectId;

function getPunchCardMongthly(userId){
  return Email.aggregate([
    {
      $match: { user: ObjectId(userId)}
    },
    {
      $project: {
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" }
      }
    },
    {
      $group: {_id: {month: '$month', day: '$day'}, count: {$sum:1}}
    },
    {
      $sort:{'_id.month':1, '_id.day':1}
    }
  ]);
}

function getPunchCardDaily(userId){
  return Email.aggregate([
    {
      $match: { user: ObjectId(userId)}
    },
    {
      $project: {
        day: { $dayOfMonth: "$date" },
        hour: { $hour: "$date" },
      }
    },
    {
      $group: {_id: {day: '$day', hour: '$hour'}, count: {$sum:1}}
    },
    {
      $sort:{'_id.day':1, '_id.hour':1}
    }
  ]);
}


function getSummary(req, res) {

  //TODO may consider only the last 12 month not all data ...
  //TODO differentiate between send, received and all mails
  //TODO use id of current user
  const userId = "5836fe8a14272b01c404257c";

  const s = {
    punchcard:{}
  };

  getPunchCardMongthly(userId)
    .then((monthlySummary)=>{
      s.punchcard.monthly = monthlySummary;
      return getPunchCardDaily(userId);
    })
    .then((dailySummary)=>{
      s.punchcard.daily = dailySummary;
      res.status(200).send(s);
    });
}


export default {
  getSummary
};
