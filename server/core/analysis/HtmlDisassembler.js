class HtmlDisassembler {

  /**
   * @deprecated will be kept as backup for intermediate presentation, can be removed afterwards
   */
  static mockedAddAnnotationRanges(responseId) {
    let response;
    switch (responseId) {
      case 1:   // simple example
        response = [
          {
            "value": "Annotation",
            "ranges": [
              {
                "end": "/p[1]",
                "endOffset": 55,
                "start": "/p[1]",
                "startOffset": 45
              },
              {
                "end": "/div[1]/span[1]",
                "endOffset": 96,
                "start": "/div[1]/span[1]",
                "startOffset": 86
              },
              {
                "end": "/div[1]/span[1]",
                "endOffset": 462,
                "start": "/div[1]/span[1]",
                "startOffset": 452
              },
              {
                "end": "/a[1]",
                "endOffset": 10,
                "start": "/a[1]",
                "startOffset": 0
              }
            ]
          }
        ];
        break;
      case 2:   // complex example
        response = [
          {
            "value": "Annotation",
            "ranges": [
              {
                "end": "/div[1]/div[1]/div[1]/div[1]/p[2]",
                "endOffset": 70,
                "start": "/div[1]/div[1]/div[1]/div[1]/p[2]",
                "startOffset": 60
              },
              {
                "end": "/div[1]/div[1]/div[1]/div[1]/div[1]/span[1]",
                "endOffset": 112,
                "start": "/div[1]/div[1]/div[1]/div[1]/div[1]/span[1]",
                "startOffset": 102
              },
              {
                "end": "/div[1]/div[1]/div[1]/div[1]/div[1]/span[1]",
                "endOffset": 510,
                "start": "/div[1]/div[1]/div[1]/div[1]/div[1]/span[1]",
                "startOffset": 500
              },
              {
                "end": "/div[1]/div[1]/div[1]/div[1]/a[1]",
                "endOffset": 10,
                "start": "/div[1]/div[1]/div[1]/div[1]/a[1]",
                "startOffset": 0
              },
              {
                "end": "/div[1]/div[1]/div[1]/div[2]/span[1]/i[1]",
                "endOffset": 6,
                "start": "/div[1]/div[1]/div[1]/div[2]/span[1]",
                "startOffset": 17
              }
            ]
          }
        ];
        break;
      default:
        response = {error: "Unknown response id!"};
        break;
    }
    return response;
  }
}

export default HtmlDisassembler;
