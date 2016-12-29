import Promise from 'bluebird';
import moment from 'moment';
import {
  createTaskConnector
} from '../task/util';

class Analyzer {
  /*
   * Construct Analyzer with single email, user and taskProvider
   */
  constructor(email, user) {
    this.email = email;
    this.user = user;
    this.linkedTasks = [];
    this.suggestedTasks = [];
  }

  // Fetch connected tasks for Email (sofern vorhanden) [{taskId:, provider:}] ->
  // forEach fetch entire task object from trello (GET :taskId)
  fetchLinkedTasks() {
    let linkedTasks = [];
    let promises = [];
    this.email.tasks.forEach(t => {
      let connector = createTaskConnector(t.provider, this.user);
      promises.push(connector.getTask(t.id));
    });
    Promise.all(promises).then((results) => {
      linkedTasks = results;
      console.log(results);
    });
  }

  // Extract suggestion out of email object ->
  // NEW TASK({emailsubject, emailContent, emailRecipient})
  // (HOW CAN EMAIL FIELDS BE MAPPED TO TRELLO FIELDS) ->
  // subject -> name, emailContent -> desc (in trello-card object)
  detectPattern() {
    this.fetchLinkedTasks();
    this.email['suggestedTasks'] = [{
      name: "peters favorite band",
      desc: "is coldplay"
    }];
    this.email['linkedTasks'] = [{
      name: "coldplay is peters favorite",
      desc: "band"
    }];
    return this.email;
  }

  // END: Email + conncetedTasks + suggestion aus Analyzer -> {subject, emailContent, suggestedTasks:[{name, desc...}], linkedTasks:[{name, desc}]}


  // Maybe it is better to show suggestions in GUI first, and only add them when the user
  // accepts those
  // createSuggestedTask() {
  // }

}
export default Analyzer;
