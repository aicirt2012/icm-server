# Example JSONs for Tasks

## Trello Task

``` json
{
  _id: ObjectId("5a840239bff612ecc187634e")
  provider: "Trello",
  providerId: "456",
  user: ObjectId("5a840dd1c4cddf35ec12d0f5"),
  email: ObjectId("5a840e1e4a141a3ff18f294a"),
  threadId: "1550714040076464455",
  parameters: [
      {
          name: "Title",
          type: "string",
          constraints: "",
          value: "Example Title",
          defaultValues: None,
          isRequired: true
      },{
          name: "List ID",
          type: "string",
          constraints: "",
          value: "53665593f9df1cd939158b79",
          defaultValues: any,
          isRequired: true
      },{
          name: "Due Date",           
          type: "date",
          constraints: "", 
          value: 2018-05-09 10:23:26.437Z, 
          defaultValues: None,
          isRequired: false
      },{
          name: "Description", 
          type: "string", 
          constraints: "", 
          value: "This is a description for an example task.", 
          defaultValues: None,
          isRequired: false
      },{
          name: "Assignees", 
          type: "string[]", 
          constraints: "", 
          value: ["5460f194a01b713c304d30a4", "436c75396c2f056f574c30c8"], 
          defaultValues: [],
          isRequired: false
      }
    ]
}
```

## Sociocortex Task

``` json
{
  _id: ObjectId("5a840239bff612ecc61242a1")
  provider: "Sociocortex",
  providerId: "789",
  user: ObjectId("5a840dd1c4cddf35ec12d0f5"),
  email: ObjectId("5a840e1e4a141a3ff18f294a"),
  threadId: "1550714040076464455",
  parameters: [
      {
          name: "Title",
          type: "string",
          constraints: "",
          value: "Example Title",
          defaultValues: [],
          isRequired: true
      },{
          name: "Due Date",           
          type: "date",
          constraints: "", 
          value: 2018-05-09 10:23:26.437Z, 
          defaultValues: [],
          isRequired: false
      },{
          name: "Description",
          type: "string", 
          constraints: "", 
          value: "This is a description for an example task.", 
          defaultValues: [],
          isRequired: false
      },{
          name: "Owner", 
          type: "string", 
          constraints: "", 
          value: "5460f194a01b713c304d30a4", 
          defaultValues: [],
          isRequired: false
      }
    ]
}
```
