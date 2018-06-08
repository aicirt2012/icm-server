import Constants from "../../../../config/constants";
import Task from "../../../models/task.model";
import AbstractAssembler from "./abstract.assembler"

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
    fromExternalObject(sociocortexWorkspace) {
      return {
        id: sociocortexWorkspace.id,
        name: sociocortexWorkspace.name,
      }
    }

    toExternalObject(workspace) {
      return {
        id: workspace.id,
        name: workspace.name,
        resourceType: "workspaces"
      }
    }
  }();

  static Case = new class extends AbstractAssembler {
    fromExternalObject(sociocortexCase) {
      return {
        id: sociocortexCase.id,
        client: sociocortexCase.client,
        workspace: sociocortexCase.workspace,
        description: sociocortexCase.description,
        name: sociocortexCase.name,
        state: sociocortexCase.state,
        owner: sociocortexCase.owner
      }
    }

    toExternalObject(caseObject) {
      return {
        id: caseObject.id,
        client: caseObject.client,
        workspace: caseObject.workspace,
        description: caseObject.description,
        name: caseObject.name,
        state: caseObject.state,
        owner: caseObject.owner,
        resourceType: "cases"
      }
    }
  }();

  static User = new class extends AbstractAssembler {
    fromExternalObject(sociocortexUser) {
      return {
        id: sociocortexUser.id,
        email: sociocortexUser.email,
        name: sociocortexUser.name
      }
    }

    toExternalObject(user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        resourceType: "users"
      }
    }
  }();

}

export default SociocortexAssembler;
