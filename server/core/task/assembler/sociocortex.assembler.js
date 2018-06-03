class SociocortexAssembler {

  static Task = new class extends AbstractAssembler {
    fromExternalObject(externalObject) {
      throw new Error("Not yet implemented: Method 'fromExternalObject' for Tasks.");
    }

    toExternalObject(internalObject) {
      throw new Error("Not yet implemented: Method 'toExternalObject' for Tasks.");
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
