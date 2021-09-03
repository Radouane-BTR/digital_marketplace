import { getAlertsValid, getContextualActionsValid, getMetadataValid, getModalValid, makePageMetadata, sidebarValid, updateValid, viewValid } from 'front-end/lib';
import { isUserType } from 'front-end/lib/access-control';
import router from 'front-end/lib/app/router';
import { SharedState } from 'front-end/lib/app/types';
import * as TabbedPage from 'front-end/lib/components/sidebar/menu/tabbed-page';
import { Immutable, immutable, mergePageAlerts, PageAlerts, PageComponent, PageInit, replaceRoute } from 'front-end/lib/framework';
import * as Tab from 'front-end/lib/pages/organization/edit/tab';
import Link, { routeDest } from 'front-end/lib/views/link';
import React from 'react';
import { isAdmin, isVendor, UserType } from 'shared/lib/resources/user';
import { adt, ADT, Id } from 'shared/lib/types';
import { invalid, valid, Validation } from 'shared/lib/validation';
import { Trans } from 'react-i18next';
import i18next from 'i18next'; 

type ValidState<K extends Tab.TabId> = Tab.ParentState<K>;

export type State_<K extends Tab.TabId> = Validation<Immutable<ValidState<K>>, null>;

export type State = State_<Tab.TabId>;

export type Msg_<K extends Tab.TabId> = Tab.ParentMsg<K, ADT<'noop'>>;

export type Msg = Msg_<Tab.TabId>;

export interface RouteParams {
  orgId: Id;
  tab?: Tab.TabId;
}

function makeInit<K extends Tab.TabId>(): PageInit<RouteParams, SharedState, State_<K>, Msg_<K>> {
  return isUserType({
    userType: [UserType.Vendor, UserType.Admin],

    async success({ routePath, dispatch, routeParams, shared }) {
      const params = await Tab.initParams(routeParams.orgId, shared.sessionUser);
      if (!params) {
        dispatch(replaceRoute(adt('notFound' as const, { path: routePath })));
        return invalid(null);
      }
      // Set up the visible tab state.
      const tabId = routeParams.tab || 'organization';
      const tabState = immutable(await Tab.idToDefinition(tabId, params.organization).component.init(params));
      // Everything checks out, return valid state.
      return valid(immutable({
        tab: [tabId, tabState],
        sidebar: await Tab.makeSidebarState(params.organization, tabId)
      })) as State_<K>;
    },
    async fail({ routePath, dispatch, shared, routeParams }) {
      if (!shared.session) {
        dispatch(replaceRoute(adt('signIn' as const, {
          redirectOnSuccess: router.routeToUrl(adt('orgEdit', {orgId: routeParams.orgId}))
        })));
      } else {
        dispatch(replaceRoute(adt('notFound' as const, { path: routePath })));
      }
      return invalid(null);
    }
  });
}

function makeComponent<K extends Tab.TabId>(): PageComponent<RouteParams, SharedState, State_<K>, Msg_<K>> {
  const idToDefinition: TabbedPage.IdToDefinitionWithState<Tab.Tabs, K, ValidState<K>> = state => id => Tab.idToDefinition(id, state.tab[1].organization);
  return {
    init: makeInit(),
    update: updateValid(TabbedPage.makeParentUpdate({
      extraUpdate: ({ state }) => [state],
      idToDefinition
    })),
    view: viewValid(TabbedPage.makeParentView(idToDefinition)),
    sidebar: sidebarValid(TabbedPage.makeParentSidebar()),
    getAlerts: getAlertsValid(state => {
      return mergePageAlerts(
        {
          info: (() => {
            if (!state.tab[1].swuQualified && state.tab[0] !== 'qualification') {
              if (isVendor(state.tab[1].viewerUser)) {
                return [{
                  text: 
                  (<div>
                    <Trans i18nKey="organization.isVendorNotQualified" components={{ emphasis: <em /> }}/>&nbsp;<Link dest={routeDest(adt('orgEdit', { orgId: state.tab[1].organization.id, tab: 'qualification' as const }))}>
                      {i18next.t("links.become-qualified")}
                    </Link>.
                    </div>)
                }];
              } else if (isAdmin(state.tab[1].viewerUser)) {
                return [{
                  text: (<div><Trans i18nKey="organization.isAdminNotQualified" /></div>)
                }];
              }
            }
            return [];
          })()
        },
        TabbedPage.makeGetParentAlerts(idToDefinition) as PageAlerts<Msg>
      );
    }),
    getModal: getModalValid(TabbedPage.makeGetParentModal(idToDefinition)),
    getContextualActions: getContextualActionsValid(TabbedPage.makeGetParentContextualActions(idToDefinition)),
    getMetadata: getMetadataValid(TabbedPage.makeGetParentMetadata({
      idToDefinition,
      getTitleSuffix: state => {
        return state.tab[0] === 'organization'
          ? i18next.t('links.edit-organization') 
          : `${state.tab[1].organization.legalName} — ${i18next.t('links.edit-organization')}` ;
      }
    }), makePageMetadata( i18next.t('links.contact-us') ))
  };
}

export const component: PageComponent<RouteParams, SharedState, State, Msg> = makeComponent();
