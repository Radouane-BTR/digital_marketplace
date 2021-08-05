import { serverLogger, startServer } from '.';
import { SERVER_HOST, SERVER_PORT } from './config';
import { makeErrorResponseBody } from './lib/server';

startServer(SERVER_PORT, SERVER_HOST).catch((error) => {
  serverLogger.error('app startup failed', makeErrorResponseBody(error).value);
  process.exit(1);
});
