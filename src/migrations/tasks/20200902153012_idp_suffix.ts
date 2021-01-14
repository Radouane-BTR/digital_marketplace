import { makeDomainLogger } from 'back-end/lib/logger';
import { console as consoleAdapter } from 'back-end/lib/logger/adapters';
import Knex from 'knex';
import { GOV_IDP_SUFFIX, VENDOR_IDPS } from 'shared/config';
import { UserType } from 'shared/lib/resources/user';

const logger = makeDomainLogger(consoleAdapter, 'migrations', 'development');

export async function up(connection: Knex): Promise<void> {
  const results = await connection<{ id: string, idpUsername: string }>('users')
    .select('id', 'idpUsername')
    .where(q => {
      let finalQ = q;
      Object.values(VENDOR_IDPS).forEach(vendorIdp => {
        finalQ = finalQ.where('idpUsername', 'LIKE', `%@${vendorIdp}`).andWhere('type', '=', UserType.Vendor)
      })
      return finalQ;
    })
    .orWhere(q => q.where('idpUsername', 'LIKE', `%@${GOV_IDP_SUFFIX}`).andWhere('type', '=', UserType.Admin))
    .where(q => {
      let finalQ = q;
      Object.values(VENDOR_IDPS).forEach(vendorIdp => {
        finalQ = finalQ.orWhere(q => q.where('idpUsername', 'LIKE', `%@${vendorIdp}`).andWhere('type', '=', UserType.Admin))
      })
      return finalQ;
    })
    .orWhere(q => q.where('idpUsername', 'LIKE', `%@${GOV_IDP_SUFFIX}`).andWhere('type', '=', UserType.Government));

  for (const result of results) {
    const withoutSuffix = result.idpUsername.slice(0, result.idpUsername.lastIndexOf('@'));
    await connection('users')
      .where({ id: result.id })
      .update({
        idpUsername: withoutSuffix
      });
    logger.info(`Changed username '${result.idpUsername}' to '${withoutSuffix}`);
  }
  logger.info('Completed updating users table.');
}

export async function down(connection: Knex): Promise<void> {
  logger.info('Unable to reverse one-way migration of username modification.');
}
