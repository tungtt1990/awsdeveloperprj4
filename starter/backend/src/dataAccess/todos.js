import AWS from 'aws-sdk';
import AWSXRay from 'aws-xray-sdk';
import { createLogger } from '../utils/logger.mjs';

const logger = createLogger('data access');
const XAWS = AWSXRay.captureAWS(AWS);
const dynamodb = new XAWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;
const todosIndex = process.env.INDEX_NAME;

export class TodosAccess {

  async getTodos(userId) {
    logger.info('Get Todos');
    const result = await dynamodb
        .query({
            TableName: todosTable,
            IndexName: todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
        .promise();

    return await result.Items;
  }

  async createTodo(newTodo) {
    logger.info('Create Todo');

    const result = await dynamodb.put({
        TableName: todosTable,
        Item: {
          todoId: newTodo.todoId,
          userId: newTodo.userId,
          createdAt: new Date().toISOString(),
          done: false,
          attachmentUrl: newTodo.attachmentUrl,
          name: newTodo.name,
          dueDate: newTodo.dueDate
        }
    }).promise();

    logger.info(`Create toto item: ${result}`);

    return newTodo;
  }

  async updateTodo(userId, todoId, todoUpdateRequest) {
    logger.info('Update Todo');

    await dynamodb.update({
      TableName: todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name',
        '#dueDate': 'dueDate',
        '#done': 'done'
      },
      ExpressionAttributeValues: {
        ':name': todoUpdateRequest.name,
        ':dueDate': todoUpdateRequest.dueDate,
        ':done': todoUpdateRequest.done
      },
      ReturnValues: 'UPDATED_ITEM'
    }).promise();

    return todoUpdateRequest;
  }

  async deleteTodo(todoId, userId) {
    logger.info('Delete Todo');
    const result = await dynamodb
    .delete({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      }
    })
    .promise();

    logger.info('Todo item deleted', result);
    return result;
  }

  async updateAttachmentUrl(userId, todoId, attachmentUrl) {
    logger.info(
      `Updating attachment URL for todo with id: ${todoId} in ${this.todosTable}`
    )

    await dynamodb
    .update({
      TableName: todosTable,
      Key: {
        todoId,
        userId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': attachmentUrl
      }
    })
    .promise();
  }
}
