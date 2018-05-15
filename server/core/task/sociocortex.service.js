import TaskService from "./task.service";

class SociocortexService extends TaskService {

  configure(username, password, providerSpecificData) {
    throw new Error("Not yet implemented!");
  }

  setup(providerSpecificData) {
    throw new Error("Not yet implemented!");
  }

  teardown(providerSpecificData) {
    throw new Error("Not yet implemented!");
  }

  create(task) {
    throw new Error("Not yet implemented!");
  }

  get(provider_id) {
    throw new Error("Not yet implemented!");
  }

  update(provider_id, task) {
    throw new Error("Not yet implemented!");
  }

  delete(provider_id) {
    throw new Error("Not yet implemented!");
  }

}

export default SociocortexService;
