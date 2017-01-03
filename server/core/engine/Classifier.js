import natural from 'natural';
import TrainingData from '../../models/trainingData.model';

class Classifier {
  constructor() {
    this.classifier = new natural.BayesClassifier();
    TrainingData.find().then((data) => {
      data.forEach((d) => {
        this.classifier.addDocument(d.text, d.label);
      });
      this.train();
    }).catch((err) => {
      console.log(err);
    });
  }

  train() {
    this.classifier.train();
  }

  addDocument(text, label, user, email, task) {
    const trainingData = new TrainingData({
      text: text,
      label: label,
      user: user,
      email: email,
      task: task
    });
    trainingData.save().then((d) => {
      this.classifier.addDocument(d.text, d.label);
      this.train();
    });
  }

  classify(text) {
    return this.classifier.classify(text);
  }
}

export default Classifier;
