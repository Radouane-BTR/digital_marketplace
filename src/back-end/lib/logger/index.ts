import { SessionRecord } from 'back-end/../shared/lib/resources/session';
import { SILENT_LOGS } from 'back-end/config';
import { Adapter, AdapterFunction } from 'back-end/lib/logger/adapters';
import { reduce } from 'lodash';

export type LogFunction = (domain: string, msg: string, data?: object) => void;

export type DomainLogFunction = (msg: string, data?: object) => void;

export interface Logger {
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
  debug: LogFunction;
}

export interface DomainLogger {
  info: DomainLogFunction;
  warn: DomainLogFunction;
  error: DomainLogFunction;
  debug: DomainLogFunction;
}

export function logWith(adapter: AdapterFunction): LogFunction {
  return (domain, msg, data = {}) => {
    const dataMsg = reduce<object, string>(data, (acc, v, k) => {
      return `${k}=${JSON.stringify(v)} ${acc}`;
    }, '');
    adapter(domain, `${msg} ${dataMsg}`);
  };
}

export function makeLogger(adapter: Adapter): Logger {
  return {
    info: logWith(adapter.info),
    warn: logWith(adapter.warn),
    error: logWith(adapter.error),
    debug: logWith(adapter.debug)
  };
}

const noOpLog: LogFunction = logWith((domain, msg) => { return; });

export function makeDomainLogger(adapter: Adapter, domain: string, env: 'development' | 'production' | 'test'): DomainLogger {
  const { info, warn, error, debug } = makeLogger(adapter);
  const showDebug = env !== 'production' && !SILENT_LOGS;
  return {
    info: SILENT_LOGS ? noOpLog.bind(null, domain) : info.bind(null, domain),
    warn: SILENT_LOGS ? noOpLog.bind(null, domain) : warn.bind(null, domain),
    error: SILENT_LOGS ? noOpLog.bind(null, domain) : error.bind(null, domain),
    debug: showDebug ? debug.bind(null, domain) : noOpLog.bind(null, domain)
  };
}

function logObjectChange(domainLogger: DomainLogger, msg: string, object: any, userSession: SessionRecord){
  return domainLogger.info(msg, {...object, changedBy: userSession.user.id, sessionId: userSession.id });
}

// Make this functions stubbable
export default {
  logObjectChange
}

// Make this functions stubbable
export {
  logObjectChange
}
