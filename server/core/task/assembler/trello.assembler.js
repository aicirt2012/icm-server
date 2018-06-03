import Constants from "../../../../config/constants";
import Task from "../../../models/task.model";

class TrelloAssembler {

  static Task = new class extends AbstractAssembler {
    fromExternalObject(trelloTask) {
      const task = {};
      task.provider = Constants.taskProviders.trello;
      task.providerId = trelloTask.id;
      task.parameters = [
        {name: 'name', value: trelloTask.name},
        {name: 'desc', value: trelloTask.desc},
        {name: 'due', value: trelloTask.due},
        {name: 'closed', value: trelloTask.closed},
        {name: 'idBoard', value: trelloTask.idBoard},
        {name: 'idList', value: trelloTask.idList},
        {name: 'idMembers', value: trelloTask.idMembers},
        {name: 'shortUrl', value: trelloTask.shortUrl}
      ];
      return task;
    }

    toExternalObject(task) {
      const trelloTask = {};
      trelloTask.id = task.providerId;
      trelloTask.name = Task.getParameterValue(task.parameters, 'name');
      trelloTask.desc = Task.getParameterValue(task.parameters, 'desc');
      trelloTask.due = Task.getParameterValue(task.parameters, 'due');
      trelloTask.closed = Task.getParameterValue(task.parameters, 'closed');
      trelloTask.idBoard = Task.getParameterValue(task.parameters, 'idBoard');
      trelloTask.idList = Task.getParameterValue(task.parameters, 'idList');
      trelloTask.idMembers = Task.getParameterValue(task.parameters, 'idMembers');
      trelloTask.shortUrl = Task.getParameterValue(task.parameters, 'shortUrl');
      return trelloTask;
    }
  }();

  static Board = new class extends AbstractAssembler {
    fromExternalObject(externalObject) {
      throw new Error("Not yet implemented: Method 'fromExternalObject' for Boards.");
    }

    toExternalObject(internalObject) {
      throw new Error("Not yet implemented: Method 'toExternalObject' for Boards.");
    }
  }();

  static List = new class extends AbstractAssembler {
    fromExternalObject(externalObject) {
      throw new Error("Not yet implemented: Method 'fromExternalObject' for Lists.");
    }

    toExternalObject(internalObject) {
      throw new Error("Not yet implemented: Method 'toExternalObject' for Lists.");
    }
  }();

  static Member = new class extends AbstractAssembler {
    fromExternalObject(externalObject) {
      throw new Error("Not yet implemented: Method 'fromExternalObject' for Members.");
    }

    toExternalObject(internalObject) {
      throw new Error("Not yet implemented: Method 'toExternalObject' for Members.");
    }
  }();

}

export default TrelloAssembler;
