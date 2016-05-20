var express = require('express');
var router = express.Router();
var config = require('../../config');
var Trello = require("node-trello");

router.get('/board', function(req, res) {

    var t = new Trello("af8fa94147612e14ccfdc51ce2fafa7a", "5cf956d6f6ce03a7e425985c67f16f68ba4fe91cdfea0fb4a567fc6cb5b95b8f");

    var cardList = [];
    t.get("/1/members/me/boards", {}, function(err, boards) {
        if (err) throw err;
        boards.forEach(function (board) {
            t.get("/1/boards/"+board.id+"/cards", {}, function(err, cards) {
                cards.forEach(function(card){
                    cardList.push({
                        boardId: card.idBoard,
                        listId: card.idList,
                        cardId: card.id,
                        name: card.name
                    });
                });
                res.send(cardList);
            });
        });
    });

});


module.exports = router;
