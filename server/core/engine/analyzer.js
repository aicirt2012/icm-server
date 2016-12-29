import Promise from 'bluebird';
import moment from 'moment';
import {
  createTaskConnector
} from '../task/util';
import Fuse from 'fuse.js';
import Task from '../../models/task.model';

class Analyzer {
  /*
   * Construct Analyzer with single email, user and taskProvider
   */
  constructor(email, user) {
    this.email = email;
    this.user = user;
    this.linkedTasks = [];
    this.suggestedTasks = [];
    this.taskPatterns = ['smell','pay']; // default taskPatterns: better to do 'smell pay' instead?
  }

  // END: Email + conncetedTasks + suggestion aus Analyzer -> {subject, emailContent, suggestedTasks:[{name, desc...}], linkedTasks:[{name, desc}]}
  getEmailTasks() {
    return new Promise((resolve, reject) => {
      this.fetchLinkedTasks().then((linkedTasks) => {
        this.addSuggestedTasks();
        this.email.linkedTasks = this.linkedTasks;
        this.email.suggestedTasks = this.suggestedTasks;
        resolve(this.email);
      }).catch((err) => {
        reject();
      })
    });
  }

  // Fetch connected tasks for Email (sofern vorhanden) [{taskId:, provider:}] ->
  // forEach fetch entire task object from trello (GET :taskId)
  fetchLinkedTasks() {
    return new Promise((resolve, reject) => {
      let promises = [];
      Task.find({
        email: this.email
      }).then((tasks, error) => {
        tasks.forEach((t) => {
          let connector = createTaskConnector(t.provider, this.user);
          promises.push(connector.getTask(t.taskId));
        });
        Promise.all(promises).then((results) => {
          this.linkedTasks = results;
          resolve(results);
        });
      }).catch((err) => {
        reject();
      });
    });
  }

  // Extract suggestion out of email object ->
  // NEW TASK({emailsubject, emailContent, emailRecipient})
  // (HOW CAN EMAIL FIELDS BE MAPPED TO TRELLO FIELDS) ->
  // subject -> name, emailContent -> desc (in trello-card object)
  addSuggestedTasks() {
    let extractedTasks = this.getTasksFromEmailBodyWithPatterns(this.taskPatterns);
    extractedTasks.forEach(task => {
      const taskSuggestion = {
        name: this.email.subject,
        desc: task,
        date: this.email.date
          //, idMembers: ??? emailRecipients <-> trello user ID ???
      }
      this.suggestedTasks.push(taskSuggestion);
    });
  }

  getTasksFromEmailBodyWithPatterns(taskPatterns) {
    let extractedTasks = [];
    // Divide and extract all sentences from email body using NLP?
    // maybe using NaturalNode
    const sentences = [{
      sentence: "Dear Daniel,"
    }, {
      sentence: "Do not forget to smell Constis code today."
    }, {
      sentence: "Paul has to buy some coronas for new years eve."
    }, {
      sentence: "Peter has to pay for Coldplays tickets."
    }, {
      sentence: "Happy new year!"
    }, {
      sentence: "Regards,"
    }, {
      sentence: "Felix"
    }];

    // apply fuse.js extraction
    const options = {
      threshold: 0.6,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        "sentence"
      ]
    };

    const fuse = new Fuse(sentences, options);
    taskPatterns.forEach((p) => {
      extractedTasks = extractedTasks.concat(fuse.search(p));
    });
    return extractedTasks;
  }

  // Maybe it is better to show suggestions in GUI first, and only add them when the user
  // accepts those
  // createSuggestedTask() {
  // }

}
export default Analyzer;
