import tokenizeHtml from 'tokenize-htmltext';
import jsdom from 'jsdom'
import wgxpath from 'wgxpath'
import xpath from 'simple-xpath-position'

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
        if (index > -1) {
          index += emailTextLine.index;
          if (!annotation.occurences) {
            annotation.occurences = [];
            annotation.occurence_context = [];
            annotation.offset = annotation.value.length;
          }
          annotation.occurences.push(index);
          annotation.occurence_context.push(emailTextLine.value);   // FIXME only for development purposes
        }
      }
    }
    return annotations;
  }

  addAnnotationRanges(indexedAnnotations, htmlSource) {
    const dom = new jsdom.JSDOM(htmlSource);
    wgxpath.install(dom.window);
    let expression = dom.window.document.createExpression("//a");
    let result = expression.evaluate(dom.window.document, wgxpath.XPathResultType.ORDERED_NODE_ITERATOR_TYPE);

    for (let i = 0; i < indexedAnnotations.length; i++) {
      let annotation = indexedAnnotations[i];
      annotation.ranges = [];
      if (annotation.occurences) {
        for (let j = 0; j < annotation.occurences.length; j++) {
          // let range = dom.window.document.createRange();
          // range.setStart(startNode, startOffset);
          // range.setEnd(endNode, endOffset);
          // annotation.ranges.push(range);
        }
      }
    }

    return indexedAnnotations;
  }

}

export default HtmlDisassembler;
