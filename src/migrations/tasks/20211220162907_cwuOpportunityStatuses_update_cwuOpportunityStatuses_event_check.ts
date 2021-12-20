import { makeDomainLogger } from 'back-end/lib/logger';
import { console as consoleAdapter } from 'back-end/lib/logger/adapters';
import Knex from 'knex';

enum CWUOpportunityEvent {
    Edited = 'EDITED',
    AddendumAdded = 'ADDENDUM_ADDED',
    AddendumDeleted = 'ADDENDUM_DELETED',
    AddendumUpdated = 'ADDENDUM_UPDATED'
}

enum PreviousCWUOpportunityEvent {
    Edited = 'EDITED',
    AddendumAdded = 'ADDENDUM_ADDED'
}

const logger = makeDomainLogger(consoleAdapter, 'migrations', 'development');

export async function up(connection: Knex): Promise<void> {

    await connection.schema.raw(' \
        ALTER TABLE "cwuOpportunityStatuses" \
        DROP CONSTRAINT "cwuOpportunityStatuses_event_check" \
    ');

    await connection.schema.raw(` \
        ALTER TABLE "cwuOpportunityStatuses" \
        ADD CONSTRAINT "cwuOpportunityStatuses_event_check" \
        CHECK (event IN ('${Object.values(CWUOpportunityEvent).join('\',\'')}')) \
    `);
  
    logger.info('Modified constraint cwuOpportunityStatuses_event_check on cwuOpportunityStatuses');
  }

export async function down(connection: Knex): Promise<void> {

    await connection.schema.raw(' \
      ALTER TABLE "cwuOpportunityStatuses" \
      DROP CONSTRAINT "cwuOpportunityStatuses_event_check" \
    ');
  
    await connection.schema.raw(` \
      ALTER TABLE "cwuOpportunityStatuses" \
      ADD CONSTRAINT "cwuOpportunityStatuses_event_check" \
      CHECK (event IN ('${Object.values(PreviousCWUOpportunityEvent).join('\',\'')}')) \
    `);
  
    logger.info('Reverted constraint cwuOpportunityStatuses_event_check on cwuOpportunityStatuses');
  }
