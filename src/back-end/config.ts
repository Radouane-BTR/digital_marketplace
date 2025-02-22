import { makeDomainLogger } from 'back-end/lib/logger';
import { console as consoleAdapter } from 'back-end/lib/logger/adapters';
import dotenv from 'dotenv';
import findUp from 'find-up';
import { existsSync, mkdirSync } from 'fs';
import SendmailTransport from 'nodemailer/lib/sendmail-transport';
import { dirname, join, resolve } from 'path';
import { parseBooleanEnvironmentVariable } from 'shared/config';

// HARDCODED CONFIG
// Offset for total opportunity metrics displayed on landing page
export const TOTAL_AWARDED_COUNT_OFFSET = 94;

export const TOTAL_AWARDED_VALUE_OFFSET = 13211500;

export const DB_MIGRATIONS_TABLE_NAME = 'migrations';

export const MAILER_REPLY = get('MAILER_REPLY', 'noreply@digitalmarketplace.gov.bc.ca');

export const SILENT_LOGS = get('SILENT_LOGS', 'false') === 'true';

// ENV CONFIG

function get(name: string , fallback: string): string {
  return process.env[name] || fallback;
}

// export the root directory of the repository.
export const REPOSITORY_ROOT_DIR = dirname(findUp.sync('package.json') || '') || __dirname;

// Load environment variables from a .env file.
dotenv.config({
  debug: process.env.NODE_ENV !== 'production',
  path: resolve(REPOSITORY_ROOT_DIR, '.env')
});

export const NODE_ENV: 'development' | 'production' | 'test' = (() => {
  switch (process.env.NODE_ENV) {
    case 'development': return 'development';
    case 'production': return 'production';
    case 'test': return 'test';
    default: return 'production';
  }
})();

export const ENV = NODE_ENV;

const logger = makeDomainLogger(consoleAdapter, 'back-end:config', ENV);

export const SERVER_HOST = get('SERVER_HOST', '127.0.0.1');

export const SERVER_PORT = parseInt(get('SERVER_PORT', '3000'), 10);

export const SCHEDULED_DOWNTIME = parseBooleanEnvironmentVariable(get('SCHEDULED_DOWNTIME', '0')) || false;

export const BASIC_AUTH_USERNAME = get('BASIC_AUTH_USERNAME', '');

export const BASIC_AUTH_PASSWORD_HASH = get('BASIC_AUTH_PASSWORD_HASH', '');

export const ORIGIN = get('ORIGIN', 'https://digital.gov.bc.ca/marketplace').replace(/\/*$/, '');

export const BACKEND_ORIGIN = get('BACKEND_ORIGIN', ORIGIN).replace(/\/*$/, '');
export const FRONTEND_ORIGIN = ORIGIN;

export const SERVICE_TOKEN_HASH = get('SERVICE_TOKEN_HASH', '');

export const SWAGGER_ENABLE = get('SWAGGER_ENABLE', '') === 'true';

export const SWAGGER_UI_PATH = get('SWAGGER_UI_PATH', '/docs/api');

export function getPostgresUrl(): string | null {
  // *SERVICE* variables are set automatically by OpenShift.
  const databaseServiceName = (process.env.DATABASE_SERVICE_NAME || 'postgresql').toUpperCase().replace(/-/g, '_');
  const host = get(`${databaseServiceName}_SERVICE_HOST`, '');
  const port = get(`${databaseServiceName}_SERVICE_PORT`, '');
  const user = get('DATABASE_USERNAME', '');
  const password = get('DATABASE_PASSWORD', '');
  const databaseName = get('DATABASE_NAME', '');
  // Support OpenShift's environment variables.
  if (host && port && user && password && databaseName) {
    return `postgresql://${user}:${password}@${host}:${port}/${databaseName}`;
  } else {
    // Return standard POSTGRES_URL as fallback.
    return get('POSTGRES_URL', '') || null;
  }
}

export const POSTGRES_URL = getPostgresUrl();

export const COOKIE_SECRET = get('COOKIE_SECRET', '');

export const FRONT_END_BUILD_DIR = resolve(REPOSITORY_ROOT_DIR, 'build/front-end');

const mailerPort = parseInt(get('MAILER_PORT', '25'), 10);
const productionMailerConfigOptions = {
  host: get('MAILER_HOST', ''),
  port: mailerPort,
  auth: {
    user: get('MAILER_USERNAME', ''),
    pass: get('MAILER_PASSWORD', '')
  },
  secure: mailerPort === 465 ? true : false,
  connectionTimeout: 5000,
  greetingTimeout: 5000,
  ignoreTLS: false,
  tls: {
    rejectUnauthorized: false
  },
  pool: true,
  maxConnections: parseInt(get('MAILER_MAX_CONNECTIONS', '5'), 10)
};

const developmentGmailMailerConfigOptions = {
  service: 'gmail',
  auth: {
    user: get('MAILER_GMAIL_USER', ''),
    pass: get('MAILER_GMAIL_PASS', '')
  },
  tls: {
    rejectUnauthorized: false
  },
  pool: true,
  maxConnections: parseInt(get('MAILER_MAX_CONNECTIONS', '5'), 10)
};

const developmentSendmailMailerConfigOptions: SendmailTransport.Options = {
  sendmail: true,
  path: '/usr/sbin/sendmail',
  newline: 'unix'
};

const developmentMailerConfigOptions = get('MAILER_GMAIL_USER', '')
? developmentGmailMailerConfigOptions
: developmentSendmailMailerConfigOptions;

export const MAILER_CONFIG = ENV !== 'production' ? developmentMailerConfigOptions : productionMailerConfigOptions;

export const MAILER_FROM = get('MAILER_FROM', `Digital Marketplace<${MAILER_REPLY}>`);

export const MAILER_BATCH_SIZE = parseInt(get('MAILER_BATCH_SIZE', '50'), 10);

// Keycloak configuration
export const KEYCLOAK_URL = get('KEYCLOAK_URL', 'https://sso-dev.pathfinder.gov.bc.ca');
export const KEYCLOAK_PUBLIC_URL = get('KEYCLOAK_PUBLIC_URL', KEYCLOAK_URL);

export const KEYCLOAK_REALM = get('KEYCLOAK_REALM', 'p2zhow64');

export const KEYCLOAK_CLIENT_ID = get('KEYCLOAK_CLIENT_ID', 'dm-auth-web');

export const KEYCLOAK_CLIENT_SECRET = get('KEYCLOAK_CLIENT_SECRET', '');

// Knex debugging
export const KNEX_DEBUG = get('KNEX_DEBUG', '') === 'true';

// Configuration for CWU/SWU auto-update hooks
export const UPDATE_HOOK_THROTTLE = parseInt(get('UPDATE_HOOK_THROTTLE', '60000'), 10);

// Maximum image dimensions for user and organization avatars
export const AVATAR_MAX_IMAGE_WIDTH = parseInt(get('AVATAR_MAX_IMAGE_WIDTH', '500'), 10);

export const AVATAR_MAX_IMAGE_HEIGHT = parseInt(get('AVATAR_MAX_IMAGE_HEIGHT', '500'), 10);

// Temp storage for file uploads
const fileStorageDir = get('FILE_STORAGE_DIR', '.');
export const FILE_STORAGE_DIR = fileStorageDir && resolve(REPOSITORY_ROOT_DIR, fileStorageDir);
export const TMP_DIR = join(FILE_STORAGE_DIR, '__tmp');

function isPositiveInteger(n: number): boolean {
  return !isNaN(n) && !!n && n >= 0 && Math.abs(n % 1) === 0;
}

function errorToJson(error: Error): object {
  return {
    message: error.message,
    stack: error.stack,
    raw: error.toString()
  };
}

export function getConfigErrors(): string[] {
  let errors: string[] = [];

  if (!['development', 'production', 'test'].includes(ENV)) {
    errors.push('NODE_ENV must be either"test", "development" or "production"');
  }

  if (!SERVER_HOST.match(/^\d+\.\d+\.\d+\.\d+/)) {
    errors.push('SERVER_HOST must be a valid IP address.');
  }

  if (BASIC_AUTH_USERNAME && !BASIC_AUTH_PASSWORD_HASH) {
    errors.push('BASIC_AUTH_PASSWORD_HASH must be defined if BASIC_AUTH_USERNAME is non-empty.');
  }

  if (!BASIC_AUTH_USERNAME && BASIC_AUTH_PASSWORD_HASH) {
    errors.push('BASIC_AUTH_USERNAME must be defined if BASIC_AUTH_PASSWORD_HASH is non-empty.');
  }

  if (!ORIGIN) {
    errors.push('ORIGIN must be specified.');
  }

  if (!isPositiveInteger(SERVER_PORT)) {
    errors.push('SERVER_PORT must be a positive integer.');
  }

  if (!POSTGRES_URL) {
    errors = errors.concat([
      'POSTGRES_URL must be specified.'
    ]);
  }

  if (!COOKIE_SECRET) {
    errors.push('COOKIE_SECRET must be specified.');
  }

  if (!FILE_STORAGE_DIR) {
    errors.push('FILE_STORAGE_DIR must be specified.');
  }
  // Create FILE_STORAGE_DIR
  try {
    if (!existsSync(FILE_STORAGE_DIR)) {
      mkdirSync(FILE_STORAGE_DIR, { recursive: true });
    }
  } catch (error) {
    logger.error('error caught trying to create FILE_STORAGE_DIR', errorToJson(error));
    errors.push('FILE_STORAGE_DIR does not exist and this process was unable to create it.');
  }

  if (!TMP_DIR) {
    errors.push('TMP_DIR must be specified.');
  }
  // Create TMP_DIR
  try {
    if (!existsSync(TMP_DIR)) {
      mkdirSync(TMP_DIR, { recursive: true });
    }
  } catch (error) {
    logger.error('error caught trying to create TMP_DIR', errorToJson(error));
    errors.push('TMP_DIR does not exist and this process was unable to create it.');
  }

  if (ENV === 'production' && (!productionMailerConfigOptions.host || !isPositiveInteger(productionMailerConfigOptions.port))) {
    errors = errors.concat([
      'MAILER_* variables must be properly specified for production.',
      'MAILER_HOST and MAILER_PORT (positive integer) must all be specified.'
    ]);
  }

  if (ENV === 'production' && (!!productionMailerConfigOptions.auth.user !== !!productionMailerConfigOptions.auth.pass)) {
    errors = errors.concat([
      'MAILER_* variables must be properly specified for production.',
      'MAILER_USERNAME and MAILER_PASSWORD must be either both specified or both absent'
    ]);
  }
/*
  if (ENV === 'development' && (!developmentMailerConfigOptions.auth.user || !developmentMailerConfigOptions.auth.pass)) {
    errors = errors.concat([
      'MAILER_* variables must be properly specified for development.',
      'MAILER_GMAIL_USER and MAILER_GMAIL_PASS must both be specified.'
    ]);
  }
*/
  if (!MAILER_FROM || !MAILER_FROM.match(/^[^<>@]+<[^@]+@[^@]+\.[^@]+>$/)) {
    errors.push('MAILER_FROM must be specified using the format: "Name <email@domain.tld>".');
  }

  return errors;
}
