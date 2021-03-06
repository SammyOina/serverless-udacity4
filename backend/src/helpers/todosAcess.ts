import * as AWS from 'aws-sdk'
//import {AWSXRay} from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

//import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
const AWSXRay = require('aws-xray-sdk')

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

export class TodosAccess {
    constructor(
      private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
      private readonly todosTable = process.env.TODOS_TABLE,
      private readonly createdAtIndex = process.env.TODOS_CREATED_AT_INDEX
    ) {}
  
    async createTodo(todo: TodoItem): Promise<TodoItem> {
      await this.docClient
        .put({
          TableName: this.todosTable,
          Item: todo
        })
        .promise()
  
      logger.info(`Saved new todo item ${todo.todoId} for user ${todo.userId}`)
  
      return todo
    }
  
    async getTodos(userId: string): Promise<TodoItem[]> {
      const result = await this.docClient
        .query({
          TableName: this.todosTable,
          IndexName: this.createdAtIndex,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId
          }
        })
        .promise()
  
      logger.info(`Found ${result.Count} todo items for user ${userId}`)
  
      const items = result.Items
  
      return items as TodoItem[]
    }
  
    async updateTodo(
      userId: string,
      todoId: string,
      updatedTodo: TodoUpdate
    ) {
      await this.docClient
        .update({
          TableName: this.todosTable,
          Key: {
            userId,
            todoId
          },
          UpdateExpression:
            'set #name = :name, #dueDate = :duedate, #done = :done',
          ExpressionAttributeValues: {
            ':name': updatedTodo.name,
            ':duedate': updatedTodo.dueDate,
            ':done': updatedTodo.done
          },
          ExpressionAttributeNames: {
            '#name': 'name',
            '#dueDate': 'dueDate',
            '#done': 'done'
          }
        })
        .promise()
    }
  
    async deleteTodo(userId: string, todoId: string) {
      await this.docClient
        .delete({
          TableName: this.todosTable,
          Key: {
            userId,
            todoId
          }
        })
        .promise()
  
      logger.info(`Deleted todo item ${todoId}`)
    }
  
    
    
  }