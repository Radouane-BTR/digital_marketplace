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
    table.enu('status', Object.values(CWUOpportunityAddendaStatus)).notNullable();
    table.timestamp('updatedAt');
    table.uuid('updatedBy').references('id').inTable('users');
  });
  
  logger.info('Ajouter les colonnes status, updatedAt et updatedBy');
}

export async function down(connection: Knex): Promise<void> {

  await connection.schema.alterTable('cwuOpportunityAddenda', table => {
    table.dropColumn('status');
  });

  await connection.schema.alterTable('cwuOpportunityAddenda', table => {
    table.dropColumn('updatedAt');
  });

  await connection.schema.alterTable('cwuOpportunityAddenda', table => {
    table.dropColumn('updatedBy');
  });

  logger.info('Completed reverting cwuOpportunityAddenda table.');
}
