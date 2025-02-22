import { BASIC_AUTH_PASSWORD_HASH, BASIC_AUTH_USERNAME, DB_MIGRATIONS_TABLE_NAME, ENV, getConfigErrors, KNEX_DEBUG, POSTGRES_URL, SCHEDULED_DOWNTIME } from 'back-end/config';
import * as crud from 'back-end/lib/crud';
import { Connection, readOneSession } from 'back-end/lib/db';
import codeWithUsHook from 'back-end/lib/hooks/code-with-us';
import loggerHook from 'back-end/lib/hooks/logger';
import sprintWithUsHook from 'back-end/lib/hooks/sprint-with-us';
import { makeDomainLogger } from 'back-end/lib/logger';
import { console as consoleAdapter } from 'back-end/lib/logger/adapters';
import basicAuth from 'back-end/lib/map-routes/basic-auth';
import affiliationResource from 'back-end/lib/resources/affiliation';
import avatarResource from 'back-end/lib/resources/avatar';
import contentResource from 'back-end/lib/resources/content';
import counterResource from 'back-end/lib/resources/counter';
import emailNotificationsResource from 'back-end/lib/resources/email-notifications';
import fileResource from 'back-end/lib/resources/file';
import metricsResource from 'back-end/lib/resources/metrics';
import codeWithUsOpportunityResource from 'back-end/lib/resources/opportunity/code-with-us';
import sprintWithUsOpportunityResource from 'back-end/lib/resources/opportunity/sprint-with-us';
import organizationResource from 'back-end/lib/resources/organization';
import ownedOrganizationResource from 'back-end/lib/resources/owned-organization';
import codeWithUsProposalResource from 'back-end/lib/resources/proposal/code-with-us';
import sprintWithUsProposalResource from 'back-end/lib/resources/proposal/sprint-with-us';
import sessionResource from 'back-end/lib/resources/session';
import codeWithUsSubscriberResource from 'back-end/lib/resources/subscribers/code-with-us';
import sprintWithUsSubscriberResource from 'back-end/lib/resources/subscribers/sprint-with-us';
import userResource from 'back-end/lib/resources/user';
import adminRouter from 'back-end/lib/routers/admin';
import authRouter from 'back-end/lib/routers/auth';
import frontEndRouter from 'back-end/lib/routers/front-end';
import statusRouter from 'back-end/lib/routers/status';
import { addHooksToRoute, namespaceRoute, notFoundJsonRoute, Route, RouteHook, Router } from 'back-end/lib/server';
import { express, ExpressAdapter } from 'back-end/lib/server/adapters';
import { FileUploadMetadata, SupportedRequestBodies, SupportedResponseBodies } from 'back-end/lib/types';
import Knex from 'knex';
import { concat, flatten, flow, map } from 'lodash/fp';
import { flipCurried } from 'shared/lib';
import { MAX_MULTIPART_FILES_SIZE, parseFilePermissions } from 'shared/lib/resources/file';
import { Session } from 'shared/lib/resources/session';
import { isValid } from 'shared/lib/validation';

type BasicCrudResource = crud.Resource<SupportedRequestBodies, SupportedResponseBodies, any, any, any, any, any, any, any, any, any, any, Session, Connection>;

type BasicRoute = Route<SupportedRequestBodies, any, any, any, SupportedResponseBodies, any, Session>;

type AppRouter = Router<SupportedRequestBodies, any, any, any, SupportedResponseBodies, any, Session>;

export const serverLogger = makeDomainLogger(consoleAdapter, 'back-end', ENV);

let dbConnection: Connection;

export function connectToDatabase(): Connection {
  if (!POSTGRES_URL) {
    throw new Error('Missing POSTGRES_URL');
  }

  if (!dbConnection) {
    dbConnection = Knex({
      client: 'pg',
      connection: POSTGRES_URL as string,
      migrations: {
        tableName: DB_MIGRATIONS_TABLE_NAME,
        directory: __dirname + '/../migrations/tasks'
      },
      debug: KNEX_DEBUG
    });
  }

  return dbConnection;
}

export const databaseConnection = connectToDatabase();

const globalHooks = [
  loggerHook
];

const addHooks: (hooks: Array<RouteHook<unknown, unknown, unknown, unknown, any, Session>>) => (_: BasicRoute[]) => BasicRoute[]
  = (hooks: Array<RouteHook<unknown, unknown, unknown, unknown, any, Session>>) => map((route: BasicRoute) => addHooksToRoute(hooks, route));

// We need to use `flippedConcat` as using `concat` binds the routes in the wrong order.
const flippedConcat = flipCurried(concat);

export async function createRouter(connection: Connection): Promise<AppRouter> {
  // Add new resources to this array.
  const resources: BasicCrudResource[] = [
    affiliationResource,
    avatarResource,
    codeWithUsOpportunityResource,
    contentResource,
    sprintWithUsOpportunityResource,
    codeWithUsProposalResource,
    sprintWithUsProposalResource,
    codeWithUsSubscriberResource,
    sprintWithUsSubscriberResource,
    fileResource,
    counterResource,
    organizationResource,
    ownedOrganizationResource,
    sessionResource,
    userResource,
    metricsResource,
    emailNotificationsResource
  ];

  // Define CRUD routes.
  const crudRoutes = flow([
    // Create routers from resources.
    map((resource: BasicCrudResource) => {
      return crud.makeRouter(resource)(connection);
    }),
    // Make a flat list of routes.
    flatten,
    // Respond with a standard 404 JSON response if API route is not handled.
    flippedConcat(notFoundJsonRoute),
    // Namespace all CRUD routes with '/api'.
    map((route: BasicRoute) => namespaceRoute('/api', route)),
    addHooks([codeWithUsHook(connection), sprintWithUsHook(connection)])
  ])(resources);

  // Collect all routes.
  let allRoutes = flow([
    // API routes.
    flippedConcat(crudRoutes),
    // Authentication router for SSO with OpenID Connect.
    flippedConcat(await authRouter(connection)),
    // Admin router
    flippedConcat(adminRouter().map(route => namespaceRoute('/admin', route))),
    // Front-end router.
    flippedConcat(frontEndRouter('index.html')),
    // Add global hooks to all routes.
    addHooks(globalHooks)
  ])([]);

  if (BASIC_AUTH_USERNAME && BASIC_AUTH_PASSWORD_HASH) {
    allRoutes = allRoutes.map(basicAuth({
      username: BASIC_AUTH_USERNAME,
      passwordHash: BASIC_AUTH_PASSWORD_HASH,
      mapHook: a => a
    }));
  }

  return allRoutes;
}

export async function createDowntimeRouter(): Promise<AppRouter> {
  return flow([
    // Front-end router.
    flippedConcat(frontEndRouter('downtime.html')),
    // Add global hooks to all routes.
    addHooks(globalHooks)
  ])([]);
}

export async function startServer(port?: number, host?: string) {
  // Ensure all environment variables are specified correctly.
  const configErrors = getConfigErrors();
  if (configErrors.length || !POSTGRES_URL) {
    configErrors.forEach((error: string) => serverLogger.error(error));
    throw new Error('Invalid environment variable configuration.');
  }
  // Connect to Postgres.
  const connection = connectToDatabase();
  serverLogger.info('connected to the database');
  // Create the router.
  let router: AppRouter = await (SCHEDULED_DOWNTIME ? createDowntimeRouter : createRouter)(connection);
  // Add the status router.
  // This should not be behind basic auth.
  // Also, run the CWU and SWU hooks with the status router.
  // i.e. The status route effectively acts as an action triggered by a CRON job.
  const statusRouterWithHooks = addHooks([codeWithUsHook(connection), sprintWithUsHook(connection)])(statusRouter as AppRouter);
  router = [...statusRouterWithHooks, ...router];
  // Bind the server to a port and listen for incoming connections.
  // Need to lock-in Session type here.
  const adapter: ExpressAdapter<any, any, any, any, Session, FileUploadMetadata | null> = express();
  const app = adapter({
    router,
    sessionIdToSession: async id => {
      //Do not touch the database:
      //1. During scheduled downtime.
      //2. If the ID is empty.
      if (SCHEDULED_DOWNTIME || !id) {
        return null;
      }
      try {
        //Try reading user session.
        const dbResult = await readOneSession(connection, id);
        if (isValid(dbResult)) {
          return dbResult.value;
        } else {
          throw new Error(`Failed to read session: ${id}`);
        }
      } catch (e) {
        serverLogger.warn(e.message);
        return null;
      }
    },
    sessionToSessionId: (session) => session?.id || '',
    maxMultipartFilesSize: MAX_MULTIPART_FILES_SIZE,
    parseFileUploadMetadata(raw) {
      return parseFilePermissions(raw);
    }
  });
  serverLogger.info('server started', { host, port });
  return (port && host)
    ? app.listen(port, host)
    : app.listen();
}
