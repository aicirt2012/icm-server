class AbstractAssembler {

  fromExternalObject(externalObject) {
    throw new Error("Not yet implemented: Method 'fromExternalObject' has to be overridden by inheriting classes..");
  }

  toExternalObject(internalObject) {
    throw new Error("Not yet implemented: Method 'toExternalObject' has to be overridden by inheriting classes..");
  }

}

export default AbstractAssembler;
