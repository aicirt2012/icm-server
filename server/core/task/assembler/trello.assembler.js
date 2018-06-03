class TrelloAssembler {

  static Task = new class extends AbstractAssembler {
    fromExternalObject(externalObject) {
      throw new Error("Not yet implemented: Method 'fromExternalObject' for Tasks.");
    }

    toExternalObject(internalObject) {
      throw new Error("Not yet implemented: Method 'toExternalObject' for Tasks.");
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
