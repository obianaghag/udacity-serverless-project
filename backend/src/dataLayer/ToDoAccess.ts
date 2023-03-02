import AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import S3 from 'aws-sdk/clients/s3';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';


export class ToDoAccess {
  private readonly docClient: DocumentClient;
  private readonly s3Client: S3;
  private readonly todoTable: string;
  private readonly s3BucketName: string;

  constructor() {
    this.docClient = new AWS.DynamoDB.DocumentClient();
    this.s3Client = new AWS.S3({ signatureVersion: 'v4' });
    this.todoTable = process.env.TODOS_TABLE || '';
    this.s3BucketName = process.env.S3_BUCKET_NAME || '';
  }

  async getAllToDoItems(userId: string): Promise<TodoItem[]> {
    console.log('Getting all todos for user:', userId);

    const params = {
      TableName: this.todoTable,
      KeyConditionExpression: '#userId = :userId',
      ExpressionAttributeNames: {
        '#userId': 'userId',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    const result = await this.docClient.query(params).promise();
    console.log('Result:', result);

    const items = result.Items;

    return items as TodoItem[];
  }

  async createTodoitem(todoItem: TodoItem): Promise<TodoItem> {
    console.log('Creating new todo item:', todoItem);

    const params = {
      TableName: this.todoTable,
      Item: todoItem,
    };

    const result = await this.docClient.put(params).promise();
    console.log('Result:', result);

    return todoItem as TodoItem;
  }

  async updateTodoitem(todoUpdate: TodoUpdate, todoId: string, userId: string): Promise<TodoUpdate> {
    console.log('Updating todo item:', todoId, 'for user:', userId);

    const updateExpression = 'set #name = :name, #dueDate = :dueDate, #isDone = :isDone';
    const expressionAttributeNames = {
      '#name': 'name',
      '#dueDate': 'dueDate',
      '#isDone': 'isDone',
    };
    const expressionAttributeValues = {
      ':name': todoUpdate.name,
      ':dueDate': todoUpdate.dueDate,
      ':isDone': todoUpdate.done,
    };
    const params = {
      TableName: this.todoTable,
      Key: {
        userId: userId,
        todoId: todoId,
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    const result = await this.docClient.update(params).promise();
    console.log('Result:', result);

    const attributes = result.Attributes;

    return attributes as TodoUpdate;
  }

  async deleteToDoitem(todoId: string, userId: string): Promise<string> {
    console.log('Deleting todo item:', todoId, 'for user:', userId);

    const params = {
      TableName: this.todoTable,
      Key: {
        userId: userId,
        todoId: todoId,
      },
    };

    const result = await this.docClient.delete(params).promise();
    console.log('Result:', result);

    return '' as string;
  }

  async GetUploadUrl(todoId: string): Promise<string> {
    console.log('Generating upload URL for todo:', todoId);

    const url = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: todoId,
      Expires: 1000,
    });

    console.log(url);

    return url as string;
  } 
}

