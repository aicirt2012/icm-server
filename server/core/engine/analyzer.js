import Promise from 'bluebird';
import moment from 'moment';
import {
  createTaskConnector
} from '../task/util';
import natural from 'natural';
import Fuse from 'fuse.js';
import Task from '../../models/task.model';
import Pattern from '../../models/pattern.model';

class Analyzer {
  /*
   * Construct Analyzer with single email, user and taskProvider
   */
  constructor(email, user) {
    this.email = email;
    this.user = user;
    this.linkedTasks = [];
    this.suggestedTasks = [];
    Pattern.find().then((patterns, err) => {
      if (err) {
        console.log(err);
        return;
      }
      this.taskPatterns = patterns;
    });
  }

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

  fetchLinkedTasks() {
    return new Promise((resolve, reject) => {
      let promises = [];
      Task.find({
        email: this.email
      }).then((tasks) => {
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

  addSuggestedTasks() {
    let extractedTasks = this.getTasksFromEmailBodyWithPatterns(this.taskPatterns);
    extractedTasks.forEach(task => {
      const taskSuggestion = {
        name: this.email.subject,
        desc: task,
        date: this.email.date
          //, idMembers: ??? emailRecipients <-> trello user ID ???
      };
      this.suggestedTasks.push(taskSuggestion);
    });
  }

  getTasksFromEmailBodyWithPatterns(taskPatterns) {
    let sentences = [];
    let extractedTasks = [];
    const tokenizer = new natural.SentenceTokenizer();
    const tokenizedSentences = this.email.text.length > 30 ? tokenizer.tokenize(this.email.text) : [this.email.text]; //TODO: test which length is too short
    tokenizedSentences.forEach((s, i) => {
      const fusejsSentence = {
        id: i,
        sentence: s
      };
      sentences.push(fusejsSentence);
    });
    this.email.sentences = sentences;

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
      extractedTasks = extractedTasks.concat(fuse.search(p.pattern));
    });

    return new Set(extractedTasks);
  }

}
export default Analyzer;
