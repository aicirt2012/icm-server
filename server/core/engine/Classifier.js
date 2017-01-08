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

  classify(text) {
    return this.classifier.docs.length > 0 && this.classifier.classify(text);
  }

  getClassifications(text) {
    return this.classifier.getClassifications(text);
  }
}

export default Classifier;
