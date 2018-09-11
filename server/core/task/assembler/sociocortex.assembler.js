import Constants from "../../../../config/constants";
import Task from "../../../models/task.model";
import AbstractAssembler from "./abstract.assembler"

class SociocortexAssembler {

  static Task = new class extends AbstractAssembler {
    fromExternalObject(sociocortexTask) {
      const task = {};
      task.provider = Constants.taskProviders.sociocortex;
      task.providerId = sociocortexTask.id;
      task.name = sociocortexTask.description;
      task.due = sociocortexTask.dueDate;
      task.isOpen = sociocortexTask.stateHumanPart ?
        sociocortexTask.stateHumanPart === Constants.sociocortexTaskStates.active :
        sociocortexTask.state === Constants.sociocortexTaskStates.active;
      task.assignees = sociocortexTask.owner ? [SociocortexAssembler.User.fromExternalObject(sociocortexTask.owner)] : [];
      task.parameters = [
        {name: 'description', value: sociocortexTask.name},
        {name: 'case', value: sociocortexTask.case},
        {name: 'state', value: sociocortexTask.stateHumanPart ? sociocortexTask.stateHumanPart : sociocortexTask.state},
        {name: 'resourceType', value: sociocortexTask.resourceType},
        {name: 'contentParams', value: this.TaskParameters.fromExternalObject(sociocortexTask)}
      ];
      return task;
    }

    toExternalObject(task) {
      const sociocortexTask = {};
      sociocortexTask.id = task.providerId;
      sociocortexTask.name = task.name;
      sociocortexTask.description = Task.getParameterValue(task.parameters, 'description');
      sociocortexTask.dueDate = task.due;
      sociocortexTask.case = Task.getParameterValue(task.parameters, 'case');
      sociocortexTask.owner = task.assignees.length > 0 ? task.assignees[0] : undefined;
      sociocortexTask.state = Task.getParameterValue(task.parameters, 'state');
      sociocortexTask.taskParams = this.TaskParameters.toExternalObject(task);
      sociocortexTask.resourceType = Task.getParameterValue(task.parameters, 'resourceType');
      return sociocortexTask;
    }

    TaskParameters = new class extends AbstractAssembler {
      // noinspection JSUnusedGlobalSymbols
      fromExternalObject(task) {
        if (!task.taskParams)
          return [];
        const dynamicParams = [];
        task.taskParams.forEach(parameter => {
          const parsedParam = {
            id: parameter.id,
            name: parameter.description,
            description: parameter.additionalDescription,
            values: parameter.values,
            defaultValues: parameter.defaultValues,
            required: parameter.isMandatory,
            readOnly: parameter.isReadOnly,
            multiplicity: parameter.multiplicity,
            type: parameter.attributeType,
            constraints: parameter.attributeTypeConstraints,
            uiReference: parameter.uiReference
          };
          dynamicParams.push(parsedParam);
        });
        return dynamicParams;
      }

      // noinspection JSUnusedGlobalSymbols
      toExternalObject(task) {
        if (!Task.getParameterValue(task.parameters, 'contentParams'))
          return [];
        const taskParameters = [];
        Task.getParameterValue(task.parameters, 'contentParams').forEach(parameter => {
          const providerParameter = {
            id: parameter.id,
            description: parameter.name,
            values: parameter.values
          };
          taskParameters.push(providerParameter);
        });
        return taskParameters;
      }
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
    fromExternalObject(scCase) {
      return {
        id: scCase.id,
        client: scCase.client,
        workspace: scCase.workspace,
        description: scCase.description,
        name: scCase.name,
        state: scCase.state,
        owner: scCase.owner,
        friendlyName: scCase.description + " - " + scCase.client.name + " (" + scCase.client.age + ")"
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
        fullName: sociocortexUser.name,
        initials: this.getInitials(sociocortexUser.name)
      }
    }

    getInitials(name) {
      if (name.indexOf(' ') > -1) {
        let nameParts = name.split(' ');
        return nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
      } else if (name.length > 2)
        return name.substring(0, 2);
      else
        return name;
    }

    toExternalObject(user) {
      return {
        id: user.id,
        email: user.email,
        name: user.fullName,
        resourceType: "users"
      }
    }
  }();

}

export default SociocortexAssembler;
