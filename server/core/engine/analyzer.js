import Promise from 'bluebird';
import moment from 'moment';
import TrelloConnector from '../task/TrelloConnector';

class Analyzer {

  // START: Email passend into Analyzer
  constructor(email) {
    this.email = email;
  }

  // Fetch connected tasks for Email (sofern vorhanden) [{taskId:, provider:}] -> 
  // forEach fetch entire task object from trello (GET :taskId)
  fetchConnectedTasks() {
    let connectedTasks = [];
    this.email.tasks.forEach(t => {
      // if or switch(t.provider)... 
      let task = TrelloConnector.getTask(t.id); // t.taskId
      connectedTasks.append(task);
    })
  }

  // Extract suggestion out of email object -> 
  // NEW TASK({emailsubject, emailContent, emailRecipient}) 
  // (HOW CAN EMAIL FIELDS BE MAPPED TO TRELLO FIELDS) -> 
  // subject -> name, emailContent -> desc (in trello-card object)
  detectPattern() {
    this.email['suggestedTasks'] = [{name: "peters favorite band", desc: "is coldplay"}];
    this.email['linkedTasks'] = [{name: "coldplay is peters favorite", desc: "band"}];
    return this.email;
  }

  // END: Email + conncetedTasks + suggestion aus Analyzer -> {subject, emailContent, suggestedTasks:[{name, desc...}], linkedTasks:[{name, desc}]}


  // Maybe it is better to show suggestions in GUI first, and only add them when the user
  // accepts those
  // createSuggestedTask() {
  // }

}
export default Analyzer;
