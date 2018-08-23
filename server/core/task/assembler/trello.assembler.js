import Constants from "../../../../config/constants";
import Task from "../../../models/task.model";
import AbstractAssembler from "./abstract.assembler"

class TrelloAssembler {

  static Task = new class extends AbstractAssembler {
    fromExternalObject(trelloTask) {
      const task = {};
      task.provider = Constants.taskProviders.trello;
      task.providerId = trelloTask.id;
      task.name = trelloTask.name;
      task.due = trelloTask.due;
      task.isOpen = !trelloTask.closed;
      task.assignees = trelloTask.members;
      task.parameters = [
        {name: 'desc', value: trelloTask.desc},
        {name: 'idBoard', value: trelloTask.idBoard},
        {name: 'idList', value: trelloTask.idList},
        {name: 'idMembers', value: trelloTask.idMembers},
        {name: 'shortUrl', value: trelloTask.shortUrl},
        {name: 'board', value: TrelloAssembler.Board.fromExternalObject(trelloTask.board)},
        {name: 'list', value: TrelloAssembler.List.fromExternalObject(trelloTask.list)}
      ];
      return task;
    }

    toExternalObject(task) {
      const trelloTask = {};
      trelloTask.id = task.providerId;
      trelloTask.name = task.name;
      trelloTask.due = task.due;
      trelloTask.closed = !task.isOpen;
      trelloTask.members = task.assignees;
      trelloTask.desc = Task.getParameterValue(task.parameters, 'desc');
      trelloTask.idBoard = Task.getParameterValue(task.parameters, 'idBoard');
      trelloTask.idList = Task.getParameterValue(task.parameters, 'idList');
      trelloTask.idMembers = Task.getParameterValue(task.parameters, 'idMembers');
      trelloTask.shortUrl = Task.getParameterValue(task.parameters, 'shortUrl');
      return trelloTask;
    }
  }();

  static Board = new class extends AbstractAssembler {
    fromExternalObject(trelloBoard) {
      return {
        id: trelloBoard.id,
        name: trelloBoard.name,
        closed: trelloBoard.closed,
        lists: trelloBoard.lists ? trelloBoard.lists.forEach(list => TrelloAssembler.List.fromExternalObject(list)) : []
      };
    }
  }();

  static List = new class extends AbstractAssembler {
    fromExternalObject(trelloList) {
      return {
        id: trelloList.id,
        name: trelloList.name,
        closed: trelloList.closed
      }
    }
  }();

  static Member = new class extends AbstractAssembler {
    fromExternalObject(trelloMember) {
      return {
        id: trelloMember.id,
        fullName: trelloMember.fullName,
        userName: trelloMember.username,
        initials: trelloMember.initials,
        avatarUrl: trelloMember.avatarUrl
      };
    }
  }();

}

export default TrelloAssembler;
