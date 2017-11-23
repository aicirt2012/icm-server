import tokenizeHtml from 'tokenize-htmltext';

class HtmlDisassembler {

  static instance = undefined;

  static getInstance() {
    if (!HtmlDisassembler.instance) {
      HtmlDisassembler.instance = new HtmlDisassembler();
    }
    return HtmlDisassembler.instance;
  }

  disassemble(htmlSource) {
    return tokenizeHtml(htmlSource);
  }

  stripHtml(htmlSource) {
    let tokenizedEmail = this.disassemble(htmlSource);
    let sentences = [];
    for (let i = 0; i < tokenizedEmail.length; i++) {
      sentences.push(tokenizedEmail[i].value);
    }
    return sentences;
  }

  addAnnotationIndices(annotations, htmlSource) {
    let disassembledEmail = this.disassemble(htmlSource);
    for (let i = 0; i < annotations.length; i++) {
      let annotation = annotations[i];
      for (let j = 0; j < disassembledEmail.length; j++) {
        let emailTextLine = disassembledEmail[j];
        let index = emailTextLine.value.indexOf(annotation.value);
        while (index > -1) {
          index += emailTextLine.index;
          if (!annotation.occurences) {
            annotation.occurences = [];
            annotation.occurence_context = [];
            annotation.offset = annotation.value.length;
          }
          annotation.occurences.push(index);
          annotation.occurence_context.push(emailTextLine.value);   // FIXME only for development purposes, remove when service development is done
          index = emailTextLine.value.indexOf(annotation.value, index + annotation.value.length);
        }
      }
    }
    return annotations;
  }

  addAnnotationRanges(indexedAnnotations, htmlSource) {
    for (let i = 0; i < indexedAnnotations.length; i++) {
      let annotation = indexedAnnotations[i];   // the annotation object
      let annotationValue = annotation.value;   // the value of the annotation (e.g. "Google")
      let annotationOccurrenceIndices = annotation.occurences;   // the array of integer indices with all occurrences of the annotation in the source HTML - not sure if needed at all
      annotation.ranges = [];   // initialize the array where the calculated ranges should go
      if (annotationOccurrenceIndices) {
        for (let j = 0; j < annotationOccurrenceIndices.length; j++) {
          let annotationOccurrenceIndex = annotationOccurrenceIndices[j];   // a single index of an occurrence of the annotation value
          let range = this.calculateOccurrenceRange(annotationValue, annotationOccurrenceIndex, htmlSource);
          annotation.ranges.push(range);
        }
      }
    }

    return indexedAnnotations;
  }

  calculateOccurrenceRange(annotationValue, annotationOccurrenceIndex, htmlSource) {
    // initialize the variables that should hold the calculation results
    let xPathStart = "";  // string variable for the xpath of the HTML tag where the annotation starts
    let xPathEnd = "";  // string variable for the xpath of the HTML tag where the annotation ends
    let offsetStart = 0;  // integer offset of the occurrence of the first character of the annotation value inside the inner text of the HTML start element
    let offsetEnd = 0;  // integer offset of the occurrence of the last character of the annotation value inside the inner text of the HTML end element

    // TODO implement range calculation

    return {end: xPathEnd, endOffset: offsetEnd, start: xPathStart, startOffset: offsetStart};
  }

}

export default HtmlDisassembler;
