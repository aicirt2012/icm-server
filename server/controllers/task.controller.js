import Trello from 'node-trello';

const config = require('../../config/env');

function getTrelloBoard(req, res) {
  const t = new Trello("af8fa94147612e14ccfdc51ce2fafa7a", "5cf956d6f6ce03a7e425985c67f16f68ba4fe91cdfea0fb4a567fc6cb5b95b8f");

  let cardList = [];

  //TODO: make this work with promises!
  t.get("/1/members/me/boards", {}, (err, boards) => {
    if (err) throw err;
    boards.forEach((board) => {
      t.get("/1/boards/" + board.id + "/cards", {}, (err, cards) => {
        cards.forEach((card) => {
          cardList.push({
            boardId: card.idBoard,
            listId: card.idList,
            cardId: card.id,
            name: card.name
          });
        });
        res.send(cardList);
        return;
      });
    });
  });
}

export default {
  getTrelloBoard
};
