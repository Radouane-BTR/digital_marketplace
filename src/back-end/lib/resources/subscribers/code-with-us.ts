import * as crud from 'back-end/lib/crud';
import * as db from 'back-end/lib/db';
import * as permissions from 'back-end/lib/permissions';
import { basicResponse, JsonResponseBody, makeJsonResponseBody, wrapRespond } from 'back-end/lib/server';
import { SupportedRequestBodies, SupportedResponseBodies } from 'back-end/lib/types';
import { validateCWUOpportunityId } from 'back-end/lib/validation';
import { omit } from 'lodash';
import { getString } from 'shared/lib';
import { AuthenticatedSession, Session } from 'shared/lib/resources/session';
import { CreateRequestBody, CreateValidationErrors, CWUOpportunitySubscriber, DeleteValidationErrors } from 'shared/lib/resources/subscribers/code-with-us';
import { Id } from 'shared/lib/types';
import { invalid, isInvalid, valid } from 'shared/lib/validation';
import i18next from 'i18next';

interface ValidatedCreateRequestBody {
  opportunity: Id;
  user: Id;
  session: AuthenticatedSession;
}

interface ValidatedDeleteRequestBody {
  opportunity: Id;
  user: Id;
  session: AuthenticatedSession;
}

type Resource = crud.Resource<
  SupportedRequestBodies,
  SupportedResponseBodies,
  CreateRequestBody,
  ValidatedCreateRequestBody,
  CreateValidationErrors,
  null,
  null,
  null,
  null,
  null,
  ValidatedDeleteRequestBody,
  DeleteValidationErrors,
  Session,
  db.Connection
>;

const resource: Resource = {
  routeNamespace: 'subscribers/code-with-us',

  create(connection) {
    return {
      async parseRequestBody(request) {
        const body: unknown = request.body.tag === 'json' ? request.body.value : {};
        return {
          opportunity: getString(body, 'opportunity')
        };
      },
      async validateRequestBody(request) {
        const { opportunity } = request.body;

        if (!permissions.isSignedIn(request.session)) {
          return invalid({
            permissions: [permissions.ERROR_MESSAGE]
          });
        }

        const validatedCWUOpportunity = await validateCWUOpportunityId(connection, opportunity, request.session);
        if (isInvalid(validatedCWUOpportunity)) {
          return invalid({
            notFound: [i18next.t('opportunityNotExistText')]
          });
        }

        // Don't allow subscribing to owned opportunity
        if (validatedCWUOpportunity.value.createdBy?.id === request.session.user.id) {
          return invalid({
            opportunity: [i18next.t('cannotSubscribeOwnOpportunityText')]
          });
        }

        // Check for existing subscription for this user
        const dbResult = await db.readOneCWUSubscriberByOpportunityAndUser(connection, validatedCWUOpportunity.value.id, request.session.user.id, request.session);
        if (isInvalid(dbResult)) {
          return invalid({
            database: [db.ERROR_MESSAGE]
          });
        }
        if (dbResult.value) {
          return invalid({
            conflict: [i18next.t('userAlreadySubscribedOpportunityText')]
          });
        }

        return valid({
          session: request.session,
          opportunity: validatedCWUOpportunity.value.id,
          user: request.session.user.id
        });
      },
      respond: wrapRespond<ValidatedCreateRequestBody, CreateValidationErrors, JsonResponseBody<CWUOpportunitySubscriber>, JsonResponseBody<CreateValidationErrors>, Session>({
        valid: (async request => {
          const dbResult = await db.createCWUOpportunitySubscriber(connection, omit(request.body, 'session'), request.session);
          if (isInvalid(dbResult)) {
            return basicResponse(503, request.session, makeJsonResponseBody({ database: [db.ERROR_MESSAGE] }));
          }
          return basicResponse(201, request.session, makeJsonResponseBody(dbResult.value));
        }),
        invalid: (async request => {
          return basicResponse(400, request.session, makeJsonResponseBody(request.body));
        })
      })
    };
  },

  delete(connection) {
    return {
      async validateRequestBody(request) {
        if (!permissions.isSignedIn(request.session)) {
          return invalid({
            permissions: [permissions.ERROR_MESSAGE]
          });
        }
        const validatedCWUOpportunity = await validateCWUOpportunityId(connection, request.params.id, request.session);
        if (isInvalid(validatedCWUOpportunity)) {
          return invalid({ notFound: [i18next.t('opportunityNotFound')] });
        }
        // Check for existing subscription for this user
        const dbResult = await db.readOneCWUSubscriberByOpportunityAndUser(connection, validatedCWUOpportunity.value.id, request.session.user.id, request.session);
        if (isInvalid(dbResult)) {
          return invalid({
            database: [db.ERROR_MESSAGE]
          });
        }
        if (!dbResult.value) {
          return invalid({
            notFound: [i18next.t('userIsntSubscribedOpportunityText')]
          });
        }
        return valid({
          opportunity: validatedCWUOpportunity.value.id,
          user: request.session.user.id,
          session: request.session
        });
      },
      respond: wrapRespond({
        valid: async request => {
          const dbResult = await db.deleteCWUOpportunitySubscriber(connection, request.body, request.session);
          if (isInvalid(dbResult)) {
            return basicResponse(503, request.session, makeJsonResponseBody({ database: [db.ERROR_MESSAGE] }));
          }
          return basicResponse(200, request.session, makeJsonResponseBody(dbResult.value));
        },
        invalid: async request => {
          return basicResponse(400, request.session, makeJsonResponseBody(request.body));
        }
      })
    };
  }
};

export default resource;
