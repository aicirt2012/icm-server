import NERConnector from "./ner.connector";
import Pattern from "../../models/pattern.model";

class NERService {

  _connector = new NERConnector();

  async extractNamedEntities(email) {
    console.log("Service: Loading patterns");
    const patternDTOs = await getPatternDTOs(email.user);
    console.log("Service: Got patterns");
    let namedEntities;
    if (email.html) {
      console.log("Service: Calling connector");
      namedEntities = await this._connector.recognizeEntitiesInHtml(email._id, email.html, email.subject, patternDTOs).annotations;
      console.log("Service: Connector call finished");
    } else {
      namedEntities = await this._connector.recognizeEntitiesInPlainText(email._id, email.text, email.subject, patternDTOs).annotations;
    }
    return namedEntities ? namedEntities.annotations : [];
  }

  recognizeEntitiesInHtml(emailId, bodySource, subjectSource, patterns) {
    return this._connector.recognizeEntitiesInHtml(emailId, bodySource, subjectSource, patterns);
  }

  recognizeEntitiesInPlainText(emailId, bodySource, subjectSource, patterns) {
    return this._connector.recognizeEntitiesInPlainText(emailId, bodySource, subjectSource, patterns);
  }

}

async function getPatternDTOs(userId) {
  // get all patterns for current user
  const patterns = await Pattern.find({user: userId});
  // transform patterns into the DTOs that the NER expects
  const patternDTOs = [];
  patterns.forEach(pattern => patternDTOs.push({
    label: pattern.pattern,
    isRegex: pattern.isRegex
  }));
  console.log("Service Method: Returning Patterns");
  return patternDTOs;
}

export default NERService;
