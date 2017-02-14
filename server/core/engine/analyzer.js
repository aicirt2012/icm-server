import Promise from 'bluebird';
import moment from 'moment';
import {
  createTaskConnector
} from '../task/util';
import natural from 'natural';
import Fuse from 'fuse.js';
import pos from 'pos';
import Task from '../../models/task.model';
import Pattern from '../../models/pattern.model';
import SyntaxRules from './SyntaxRules';
import Classifier from './Classifier';

class Analyzer {
  /*
   * Construct Analyzer with single email, user and taskProvider
   */
  constructor(email, user) {
    this.email = email;
    this.user = user;
    this.linkedTasks = [];
    this.suggestedTasks = [];
    this.classifier = new Classifier(this.user);
  }

  initAnalyzer() {
    return new Promise((resolve, reject) => {
      // first collect all patterns
      Pattern.find({
        $or: [{
          isDefault: true
        }, {
          user: this.user
        }]
      }).then((patterns) => {
        this.taskPatterns = patterns;

        // then train classifier
        this.classifier.train().then(() => {
          resolve();
        });
      }).catch(reject);
    });
  }

  getEmailTasks() {
    return new Promise((resolve, reject) => {
      this.initAnalyzer().then(() => {
        this.fetchLinkedTasks().then((linkedTasks) => {
          this.addSuggestedTasks();
          this.email.linkedTasks = this.linkedTasks;
          this.email.suggestedTasks = this.suggestedTasks;
          resolve(this.email);
        })
      }).catch((err) => {
        reject();
      })
    });
  }

  fetchLinkedTasks() {
    return new Promise((resolve, reject) => {
      let promises = [];
      Task.find({
        $or: [{
          email: this.email
        }, {
          thrid: this.email.thrid
        }]
      }).then((tasks) => {
        tasks.forEach((t) => {
          let connector = createTaskConnector(t.provider, this.user);
          promises.push(connector.getTask(t.taskId));
        });
        Promise.all(promises).then((results) => {
          this.linkedTasks = results.map((r) => {
            r['taskType'] = 'linked';
            return r;
          }).filter((task) => task.closed == false);
          resolve(results);
        });
      }).catch((err) => {
        reject();
      });
    });
  }

  addSuggestedTasks() {
    let extractedTasks = this.getTasksFromEmailBody();
    extractedTasks.forEach((task) => {
      const taskSuggestion = {
        name: this.email.subject || '',
        desc: task.sentence,
        task: task,
        date: this.email.date,
        taskType: 'suggested'
        //, idMembers: ??? emailRecipients <-> trello user ID ???
      };
      this.suggestedTasks.push(taskSuggestion);
    });
  }

  getTasksFromEmailBody() {
    this.email.sentences = this.getTokenizedSentencesFromText(this.email.text);

    let filteredTasks = [];
    if (this.email.box.name != '[Gmail]/Drafts' && this.email.box.name != '[Gmail]/Sent Mail' && this.email.box.name != '[Google Mail]/Drafts' && this.email.box.name != '[Google Mail]/Sent Mail' && !this.email.html) {
      // NOTE:
      // Tasks are extracted from emails via 3 methods: 1. Syntax-Analysis, 2. (Word-)Pattern-Analysis, 3. Classifier (ML)
      let tasksBySyntax = this.extractTasksBySyntax(this.email.sentences);
      let tasksByPatterns = this.extractTasksByPatternSearch(this.email.sentences);
      let tasksByClassifier = this.extractTasksByClassifier(this.email.sentences);

      filteredTasks = [...tasksBySyntax, ...tasksByPatterns, ...tasksByClassifier].reduce((a, b) => {
        const index = a.findIndex((e) => e.id == b.id);
        if (index > -1) {
          a[index].analysis.push(b.analysis[0]);
        }
        return index > -1 ? a : a.concat(b);
      }, []);
    }
    return filteredTasks;
  }

  getTokenizedSentencesFromText(text) {
    let sentences = [];
    if (text) {
      const tokenizer = new natural.SentenceTokenizer();
      text = text + '.'; // we need to add a '.' for the fusejs tokenizer
      const tokenizedSentences = text.length > 30 ? tokenizer.tokenize(text) : [text]; //TODO: test which length is too short
      tokenizedSentences[tokenizedSentences.length - 1] = tokenizedSentences[tokenizedSentences.length - 1].slice(0, tokenizedSentences[tokenizedSentences.length - 1].length - 1); // we remove the previously added . again
      tokenizedSentences.forEach((s, i) => {
        const fusejsSentence = {
          id: i,
          sentence: s
        };
        sentences.push(fusejsSentence);
      });
    }
    return sentences;
  }

  extractTasksByPatternSearch(sentences) {
    const options = {
      shouldSort: true,
      tokenize: true,
      matchAllTokens: true,
      threshold: 0.4,
      location: 0,
      distance: 100,
      maxPatternLength: 32,
      minMatchCharLength: 1,
      keys: [
        "sentence"
      ]
    };
    const fuse = new Fuse(sentences, options);

    let extractedTasks = [];
    this.taskPatterns.forEach((p) => {
      const tasks = fuse.search(p.pattern).map((t) => {
        t.pattern = p.pattern;
        return t;
      });
      extractedTasks = extractedTasks.concat(tasks);
    });
    let tasks = [];
    new Set(extractedTasks).forEach((t) => {
      tasks.push({
        id: t.id,
        sentence: t.sentence,
        analysis: [`pattern-${t.pattern}`]
      });
    });
    return tasks;
  }

  extractTasksBySyntax(sentences) {
    let tasks = [];
    sentences.forEach((s) => {
      const words = new pos.Lexer().lex(s.sentence);
      const taggedWords = new pos.Tagger().tag(words);
      SyntaxRules.rules.forEach((r) => {
        if (r.fn(taggedWords)) {
          tasks.push({
            id: s.id,
            sentence: s.sentence,
            analysis: [`syntax-rule-'${r.name}'`],
          });
        }
      })
    });
    return tasks;
  }

  extractTasksByClassifier(sentences) {
    let tasks = [];
    sentences.forEach((s) => {
      let label = this.classifier.classify(s.sentence);
      s.classification = this.classifier.getClassifications(s.sentence);
      if (s.classification.find((c) => c.label == true).value > 0.5) {
        tasks.push({
          id: s.id,
          sentence: s.sentence,
          analysis: [`classifier`]
        });
      }
    });
    return tasks;
  }
}

export default Analyzer;
