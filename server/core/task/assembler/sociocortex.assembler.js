import Constants from "../../../../config/constants";
import Task from "../../../models/task.model";

class SociocortexAssembler {

  static Task = new class extends AbstractAssembler {
    fromExternalObject(sociocortexTask) {
      const task = {};
      task.provider = Constants.taskProviders.sociocortex;
      task.providerId = sociocortexTask.id;
      task.parameters = [
        {name: 'name', value: sociocortexTask.name},
        {name: 'description', value: sociocortexTask.description},
        {name: 'due', value: sociocortexTask.dueDate},
        {name: 'case', value: sociocortexTask.case},
        {name: 'ownerId', value: sociocortexTask.owner ? sociocortexTask.owner.id : ""},
        {name: 'ownerEmail', value: sociocortexTask.owner ? sociocortexTask.owner.email : ""},
        {name: 'state', value: sociocortexTask.state},
      ];
      // TODO parse and append the actual, dynamic parameters from sociocortex
      return task;
    }

    toExternalObject(task) {
      const sociocortexTask = {};
      sociocortexTask.id = task.providerId;
      sociocortexTask.name = Task.getParameterValue(task.parameters, 'name');
      sociocortexTask.description = Task.getParameterValue(task.parameters, 'description');
      sociocortexTask.dueDate = Task.getParameterValue(task.parameters, 'due');
      sociocortexTask.case = Task.getParameterValue(task.parameters, 'case');
      sociocortexTask.owner = {
        id: Task.getParameterValue(task.parameters, 'ownerId'),
        email: Task.getParameterValue(task.parameters, 'ownerEmail')
      };
      sociocortexTask.state = Task.getParameterValue(task.parameters, 'state');
      // TODO parse and re-append the actual, dynamic parameters
      return sociocortexTask;
    }
  }();

  static Workspace = new class extends AbstractAssembler {
    fromExternalObject(externalObject) {
      throw new Error("Not yet implemented: Method 'fromExternalObject' for Workspaces.");
    }

    toExternalObject(internalObject) {
      throw new Error("Not yet implemented: Method 'toExternalObject' for Workspaces.");
    }
  }();

  static Case = new class extends AbstractAssembler {
    fromExternalObject(externalObject) {
      throw new Error("Not yet implemented: Method 'fromExternalObject' for Cases.");
    }

    toExternalObject(internalObject) {
      throw new Error("Not yet implemented: Method 'toExternalObject' for Cases.");
    }
  }();

  static User = new class extends AbstractAssembler {
    fromExternalObject(externalObject) {
      throw new Error("Not yet implemented: Method 'fromExternalObject' for Users.");
    }

    toExternalObject(internalObject) {
      throw new Error("Not yet implemented: Method 'toExternalObject' for Users.");
    }
  }();

}

export default SociocortexAssembler;
