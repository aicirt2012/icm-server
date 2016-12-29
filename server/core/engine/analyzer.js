import Promise from 'bluebird';
import moment from 'moment';
import {
  createTaskConnector
} from '../task/util';
import Fuse from 'fuse.js'

class Analyzer {
  /*
   * Construct Analyzer with single email, user and taskProvider
   */
  constructor(email, user) {
    this.email = email;
    this.user = user;
    this.linkedTasks = [];
    this.suggestedTasks = [];
    this.taskPatterns = ['smell pay']; // default taskPatterns
  }

  // END: Email + conncetedTasks + suggestion aus Analyzer -> {subject, emailContent, suggestedTasks:[{name, desc...}], linkedTasks:[{name, desc}]}
  getEmailTasks() {
    this.fetchLinkedTasks();
    this.addSuggestedTasks();
    return this.email;
  }

  // Fetch connected tasks for Email (sofern vorhanden) [{taskId:, provider:}] ->
  // forEach fetch entire task object from trello (GET :taskId)
  fetchLinkedTasks() {
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
  addSuggestedTasks() {
    let extractedTasks = getTasksFromEmailBodyWithPatterns(this.taskPatterns);
    extractedTasks.forEach(task => {
      let taskSuggestion = {
        name: this.email.subject,
        desc: task
        //, idMembers: ??? emailRecipients <-> trello user ID ???
      }
      suggestedTasks.push(taskSuggestion);
    });
  }

  getTasksFromEmailBodyWithPatterns(taskPatterns) {
    let extractedTasks;
    // Divide and extract all sentences from email body using NLP?
    // maybe using NaturalNode
    let sentences = [
      {
        sentence: "Dear Daniel,"
      },
      {
        sentence: "Do not forget to smell Constis code today."
      },
      {
        sentence: "Paul has to buy some coronas for new years eve."
      },
      {
        sentence: "Peter has to pay for Coldplays tickets."
      },
      {
        sentence: "Happy new year!"
      },
      {
        sentence: "Regards,"
      },
      {
        sentence: "Felix"
      }
    ];

    // apply fuse.js extraction
    let options = {
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        "sentence"
      ]
    };

    let fuse = new Fuse(sentences, options);
    extractedTasks = fuse.search(taskPatterns);

    return extractedTasks;
  }

  // Maybe it is better to show suggestions in GUI first, and only add them when the user
  // accepts those
  // createSuggestedTask() {
  // }

}
export default Analyzer;
