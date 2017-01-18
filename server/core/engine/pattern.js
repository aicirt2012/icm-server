import Pattern from '../../models/pattern.model';

export default {
  patterns: [{
    pattern: '* have to',
    isDefault: true
  }, {
    pattern: 'can you',
    isDefault: true
  }, {
    pattern: '* please',
    isDefault: true
  }],
  init: function() {
    Pattern.find({
      isDefault: true
    }).remove().exec((err, data) => {
      if (err) {
        console.log(err);
        return;
      }
      this.patterns.forEach((p) => {
        new Pattern(p).save();
      });
      console.log(`Stored ${this.patterns.length} new patterns.`)
    })
  }
};
