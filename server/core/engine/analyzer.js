import Promise from 'bluebird';
import moment from 'moment';

class Analyzer {

  constructor(email) {
    this.email = email;
  }

  // START: Email in Analyzer
  // Fetch connected tasks for Email (sofern vorhanden)
  // Extract suggestion
  // 1. taskObj = {subject: email.subject, date: email.date, content: email.text}
  // END: Email + conncetedTasks + suggestion aus Analyzer

  detectPattern() {

  }

  createSuggestedTask(email) {
  }


}
export default Analyzer;
