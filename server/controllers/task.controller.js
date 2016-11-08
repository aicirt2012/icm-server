import {
  login
} from '../helpers/Trello';

function getTrelloBoard(req, res) {
    return login(req, res);
}

export default {
  getTrelloBoard
};
