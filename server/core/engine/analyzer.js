import Promise from 'bluebird';
import moment from 'moment';

class Analyzer {

  constructor(email) {
    this.email = email;
  }

  // START: Email passend into Analyzer
  // Fetch connected tasks for Email (sofern vorhanden) [{taskId:, provider:}] -> forEach fetch entire task object from trello (GET :taskId)
  // Extract suggestion out of email object -> NEW TASK({emailsubject, emailContent, emailRecipient}) (HOW CAN EMAIL FIELDS BE MAPPED TO TRELLO FIELDS) -> subject -> name, emailContent -> desc (in trello-card object)
  // END: Email + conncetedTasks + suggestion aus Analyzer -> {subject, emailContent, suggestedTasks:[{name, desc...}], linkedTasks:[{name, desc}]}

  detectPattern() {
      this.email['suggestedTasks'] = [{name:"peters favorite band", desc:"is coldplay"}];
      this.email['linkedTasks'] = [{name:"coldplay is peters favorite", desc:"band"}];
      return this.email;
  }

  createSuggestedTask() {
  }


}
export default Analyzer;
