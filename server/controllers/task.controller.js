import {
  login
} from '../helpers/task/TrelloConnector';

function getTrelloBoard(req, res) {
    return login(req, res);
}

export default {
  getTrelloBoard
};
