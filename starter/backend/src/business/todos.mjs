import AWS from 'aws-sdk';
import { createLogger } from '../utils/logger.mjs';
import { TodosAccess } from '../dataAccess/todos.js';
import { uuid } from 'uuidv4';

const logger = createLogger('business');
const todosAccess = new TodosAccess();

export async function getTodos(userId) {
    logger.info('---Get Totos Business---');

    return todosAccess.getTodos(userId);
}

export async function createTodo(newTodo, userId) {
    logger.info('---Create Todo Business---');

    const todoId = uuid();
    const createdAt = new Date().toISOString();
    const attachmentUrl = `https://${process.env.IMAGES_S3_BUCKET}.s3.amazonaws.com/${todoId}`;
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: attachmentUrl,
        ...newTodo
    };
    logger.info('Create Todo Business', newItem);
    return await todosAccess.createTodo(newItem);
}

export async function updateTodo(userId, todoId, todoUpdate) {
    logger.info('---Update todo Business---');

    return await todosAccess.updateTodo(userId, todoId, todoUpdate);
}

export async function deleteTodo(todoId, userId) {
    logger.info('---Delete todo business---');
    return await todosAccess.deleteTodo(todoId, userId);
}

export async function generateUploadUrl(todoId, userId) {
    const bucketName = process.env.IMAGES_S3_BUCKET;
    const s3 = new AWS.S3({ signatureVersion: 'v4' });
    const signedUrl = s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: todoId,
        Expires: 300
    });
    await todosAccess.updateAttachmentUrl(userId, todoId, signedUrl);
    return signedUrl;
}