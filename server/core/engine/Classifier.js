import natural from 'natural';
import TrainingData from '../../models/trainingData.model';

class Classifier {
  constructor(user) {
    this.classifier = new natural.BayesClassifier();
    this.user = user;
  }

  train() {
    return new Promise((resolve, reject) => {
      TrainingData.find({
        user: this.user
      }).then((data) => {
        data.forEach((d) => {
          this.classifier.addDocument(d.text, d.label);
        });
        this.classifier.train();
        resolve();
      }).catch((err) => {
        reject(err);
      });
    });
  }

  classify(text) {
    return this.classifier.docs.length > 0 && this.classifier.classify(text);
  }

  getClassifications(text) {
    return this.classifier.getClassifications(text);
  }
}

export default Classifier;
