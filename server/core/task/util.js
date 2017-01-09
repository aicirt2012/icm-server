import TrelloConnector from './TrelloConnector';
import SociocortexConnector from './SociocortexConnector';

/* TASK HELPER */
export function createTaskConnector(provider, user) {
  switch (provider) {
    case 'trello':
      return new TrelloConnector(user.trello);
      break;
    case 'sociocortex':
      return new SociocortexConnector(user.sociocortex);
      break;
    default:
      return new TrelloConnector(user.trello);
  }
}
