class TaskConnector {
    constructor(options) {
        this.options = options;
    }

    addQueries(queries) {
      let queryString = '&';
      Object.keys(queries).forEach((key) => {
        queryString += `${key}=${queries[key]}&`;
      })
      return queryString.slice(0, -1);
    }
}

export default TaskConnector;
