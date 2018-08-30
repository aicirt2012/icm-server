import SociocortexConnector from "./connector/sociocortex.connector";
import SociocortexAssembler from "./assembler/sociocortex.assembler";
import TaskService from "./task.service";
import Constants from "../../../config/constants";
import Task from "../../models/task.model";

class SociocortexService extends TaskService {

  constructor(user) {
    super(user);
    this._connector = new SociocortexConnector(this._user.taskProviders.sociocortex.email, this._user.taskProviders.sociocortex.password);
  }

  async configure(email, password, providerSpecificData) {
    this._user.taskProviders.sociocortex.isEnabled = false;
    this._user.taskProviders.sociocortex.email = email;
    this._user.taskProviders.sociocortex.password = password;
    return await this._user.save();
  }

  async setup(providerSpecificData) {
    this._user.taskProviders.sociocortex.isEnabled = true;
    const response = await this._user.save();
    await this._connector.checkConnection();
    return response;
  }

  async teardown(providerSpecificData) {
    // TODO make parallel
    const tasks = await Task.find({provider: Constants.taskProviders.sociocortex, user: this._user._id});
    for (let task of tasks) {
      await this.unlink(task.providerId);
    }
    this._user.taskProviders.sociocortex.isEnabled = false;
    this._user.taskProviders.sociocortex.email = "";
    this._user.taskProviders.sociocortex.password = "";
    return await this._user.save();
  }

  async create(task) {
    return this.link(task);
  }

  async get(sociocortexId) {
    const sociocortexTask = await this._connector.getTask(sociocortexId);
    return SociocortexAssembler.Task.fromExternalObject(sociocortexTask);
  }

  async update(sociocortexId, task) {
    const taskType = Task.getParameterValue(task.parameters, "resourceType");
    // update content parameters
    let sociocortexTask = await this._connector.draftTask(sociocortexId, SociocortexAssembler.Task.toExternalObject(task));
    sociocortexTask = SociocortexAssembler.Task.fromExternalObject(sociocortexTask);
    // update due date
    // FIXME timezone conversion problems: new Date("2018-08-30") != new Date("2018-08-30 00:00:00.0")
    const updatedDueDate = task.due ? (new Date(task.due)).toISOString() : undefined;
    const oldDueDate = sociocortexTask.due ? (new Date(sociocortexTask.due)).toISOString() : undefined;
    if (updatedDueDate !== oldDueDate) {
      await this._connector.updateDueDate(taskType, sociocortexTask.providerId, updatedDueDate);
    }
    // update owner
    const updatedOwnerId = task.assignees && task.assignees.length > 0 ? task.assignees[0] : undefined;
    const oldOwnerId = sociocortexTask.assignees && sociocortexTask.assignees.length > 0 ? sociocortexTask.assignees[0].id : undefined;
    if (updatedOwnerId !== oldOwnerId) {
      await this._connector.updateOwner(taskType, sociocortexTask.providerId, updatedOwnerId)
    }
    return this.get(sociocortexId);
  }

  async delete(sociocortexId) {
    throw new Error("Task deletion is not supported by the Sociocortex service!");
  }

  async link(task) {
    console.log(task.parameters);
    const taskType = Task.getParameterValue(task.parameters, "resourceType");
    if (Task.getParameter(task.parameters, 'state').value === Constants.sociocortexTaskStates.enabled) {
      await this._connector.activateTask(task.providerId, taskType);
    }
    await this._connector.updateExternalId(taskType, task.providerId, task.frontendUrl);
    await this.update(task.providerId, task);
    return await this.get(task.providerId);
  }

  async unlink(sociocortexId, frontendUrl) {
    const task = await this.get(sociocortexId);
    const taskType = Task.getParameterValue(task.parameters, "resourceType");
    await this._connector.updateExternalId(taskType, task.providerId, null);
  }

  async completeTask(sociocortexId) {
    const task = await this.get(sociocortexId);
    const taskType = Task.getParameterValue(task.parameters, 'resourceType');
    const sociocortexTask = SociocortexAssembler.Task.toExternalObject(task);
    const completedTask = await this._connector.completeTask(sociocortexTask, taskType, task.providerId);
    return SociocortexAssembler.Task.fromExternalObject(completedTask);
  }

  async terminateTask(sociocortexId) {
    const task = await this.get(sociocortexId);
    const terminatedTask = await this._connector.terminateTask(sociocortexId, Task.getParameterValue(task.parameters, 'resourceType'));
    return SociocortexAssembler.Task.fromExternalObject(terminatedTask);
  }

  async list() {
    throw new Error("Not yet implemented: Method 'list' is not yet implemented for Sociocortex service.");  // TODO implement
  }

  async listWorkspaces() {
    const response = await this._connector.getMyWorkspaces();
    const workspaces = [];
    response.forEach(workspace => {
      if (workspace.id !== 'root') {
        workspaces.push(SociocortexAssembler.Workspace.fromExternalObject(workspace))
      }
    });
    return workspaces;
  }

  async getCases(workspaceId) {
    const response = await this._connector.getCases(workspaceId);
    const cases = [];
    response.forEach(sociocortexCase => {
      cases.push(SociocortexAssembler.Case.fromExternalObject(sociocortexCase))
    });
    return cases;
  }

  async getCase(caseId) {
    const response = await this._connector.getCase(caseId);
    return SociocortexAssembler.Case.fromExternalObject(response);
  }

  async getTasks(caseId) {
    const response = await this._connector.getCaseTree(caseId);
    let tasks = [];
    response.children.forEach(caseChildArray => {
      caseChildArray.forEach(caseChild => {
        tasks = tasks.concat(this._extractTasks(caseChild));
      });
    });
    return tasks;
  }

  async getPossibleOwners(taskId) {
    const response = await this._connector.getPossibleOwners(taskId);
    const users = [];
    response.forEach(sociocortexUser => {
      users.push(SociocortexAssembler.User.fromExternalObject(sociocortexUser))
    });
    return users;
  }

  _extractTasks(entity) {
    let tasks = [];
    if (entity.resourceType === 'humantasks' || entity.resourceType === 'dualtasks')
      tasks.push(SociocortexAssembler.Task.fromExternalObject(entity));
    else if (entity.resourceType === 'stages')
      entity.children.forEach(childArray => {
        childArray.forEach(child => {
          tasks = tasks.concat(this._extractTasks(child));
        })
      });
    return tasks;
  }
}

export default SociocortexService;
