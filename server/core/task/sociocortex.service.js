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
    return this.link(task.providerId, task.frontendUrl);
  }

  async get(sociocortexId) {
    const sociocortexTask = await this._connector.getTask(sociocortexId);
    return SociocortexAssembler.Task.fromExternalObject(sociocortexTask);
  }

  async update(sociocortexId, task) {
    let sociocortexTask = await this.get(sociocortexId);

    const updatedDynamicParams = task.getParameter("dynamicParameters");
    if (updatedDynamicParams && sociocortexTask.getParameter("dynamicParameters").value !== updatedDynamicParams) {
      const draftedSociocortexTask = SociocortexAssembler.Task.toExternalObject(task);
      sociocortexTask = await this._connector.draftTask(sociocortexId, draftedSociocortexTask);
    }
    const updatedDueDate = task.getParameter("dueDate");
    if (updatedDueDate && sociocortexTask.getParameter("dueDate").value !== updatedDueDate) {
      sociocortexTask = await this._connector.updateDueDate(sociocortexTask, updatedDueDate);
    }
    const updatedOwnerId = task.getParameter("ownerId");
    if (updatedOwnerId && sociocortexTask.getParameter("ownerId").value && sociocortexTask.getParameter("ownerId") !== updatedOwnerId) {
      sociocortexTask = await this._connector.updateOwner(sociocortexTask, updatedOwnerId)
    }
    return SociocortexAssembler.Task.fromExternalObject(sociocortexTask);
  }

  async delete(sociocortexId) {
    throw new Error("Task deletion is not supported by the Sociocortex service!");
  }

  async link(sociocortexId, frontendUrl) {
    const task = await this.get(sociocortexId);
    if (Task.getParameter(task.parameters, 'state').value === Constants.sociocortexTaskStates.enabled) {
      await this._connector.activateTask(sociocortexId, Task.getParameter(task.parameters, 'resourceType').value);
    }
    await this._connector.updateExternalId(task, frontendUrl);
    return task;
  }

  async unlink(sociocortexId, frontendUrl) {
    const task = await this.get(sociocortexId);
    await this._connector.updateExternalId(task, null);
  }

  async completeTask(sociocortexId) {
    const task = await this.get(sociocortexId);
    const completedTask = await this._connector.completeTask(sociocortexId, Task.getParameter(task.parameters, 'resourceType').value);
    return SociocortexAssembler.Task.fromExternalObject(completedTask);
  }

  async terminateTask(sociocortexId) {
    const task = await this.get(sociocortexId);
    const terminatedTask = await this._connector.terminateTask(sociocortexId, Task.getParameter(task.parameters, 'resourceType').value);
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
