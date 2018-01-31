import TrelloConnector from './TrelloConnector';
import SociocortexConnector from './SociocortexConnector';
import Constants from '../../models/constants';


/* TASK HELPER */
export function createTaskConnector(provider, user) {
  switch (provider) {
    case Constants.taskProviders.trello:
      return new TrelloConnector(user.trello);
      break;
    case Constants.taskProviders.socioCortex:
      return new SociocortexConnector(user.sociocortex);
      break;
    default:
      return new TrelloConnector(user.trello);
  }
}
