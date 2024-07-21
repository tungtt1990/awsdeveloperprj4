import middy from '@middy/core';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import { getUserId } from '../utils.mjs';
import { generateUploadUrl } from '../../business/todos.mjs';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('http layer');

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
  .handler(async (event) => {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    logger.info('---Generated Upload URL---');
    logger.info(todoId);
    const url = await generateUploadUrl(todoId, userId);

    return {
      statusCode: 201,
      body: JSON.stringify({
        uploadUrl: url
      })
    };
  });