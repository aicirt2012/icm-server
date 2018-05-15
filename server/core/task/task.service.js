class TaskService {

  constructor(user) {
    this._user = user;
  }

  configure(username, password, providerSpecificData) {
    throw new Error("Not yet implemented: Method 'configure' has to be overridden by inheriting classes.");
  }

  setup(providerSpecificData) {
    throw new Error("Not yet implemented: Method 'setup' has to be overridden by inheriting classes.");
  }

  teardown(providerSpecificData) {
    throw new Error("Not yet implemented: Method 'teardown' has to be overridden by inheriting classes.");
  }

  create(task) {
    throw new Error("Not yet implemented: Method 'create' has to be overridden by inheriting classes.");
  }

  get(provider_id) {
    throw new Error("Not yet implemented: Method 'get' has to be overridden by inheriting classes.");
  }

  update(provider_id, task) {
    throw new Error("Not yet implemented: Method 'update' has to be overridden by inheriting classes.");
  }

  delete(provider_id) {
    throw new Error("Not yet implemented: Method 'delete' has to be overridden by inheriting classes.");
  }

}

export default TaskService;
