import { makeDomainLogger } from 'back-end/lib/logger';
import { console as consoleAdapter } from 'back-end/lib/logger/adapters';
import Knex from 'knex';

enum CWUOpportunityAddendaStatus {
    Draft = 'DRAFT',
    Published = 'PUBLISHED',
    Deleted = 'DELETED'
  }

const logger = makeDomainLogger(consoleAdapter, 'migrations', 'development');

export async function up(connection: Knex): Promise<void> {
  await connection.schema.alterTable('cwuOpportunityAddenda', table => {
    table.enu('status', Object.values(CWUOpportunityAddendaStatus))
    .defaultTo(CWUOpportunityAddendaStatus.Published)
    .notNullable();
    table.timestamp('updatedAt');
    table.uuid('updatedBy').references('id').inTable('users');
  });
  
  logger.info('Ajouter les colonnes status, updatedAt et updatedBy');
}

export async function down(connection: Knex): Promise<void> {
    await connection('cwuOpportunityAddenda')
      .whereNull('status')
      .update({ completionDate: CWUOpportunityAddendaStatus.Published });

    logger.info('Completed reverting cwuOpportunityVersions table.');
}
