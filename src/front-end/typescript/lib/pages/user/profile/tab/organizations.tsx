import { EMPTY_STRING } from 'front-end/config';
import { Route } from 'front-end/lib/app/types';
import * as Table from 'front-end/lib/components/table';
import { ComponentView, Dispatch, GlobalComponentMsg, Immutable, immutable, Init, mapComponentDispatch, toast, Update, updateComponentChild } from 'front-end/lib/framework';
import * as api from 'front-end/lib/http/api';
import * as toasts from 'front-end/lib/pages/organization/lib/toasts';
import { PendingBadge } from 'front-end/lib/pages/organization/lib/views/team-member';
import * as Tab from 'front-end/lib/pages/user/profile/tab';
import Icon from 'front-end/lib/views/icon';
import Link, { iconLinkSymbol, leftPlacement, routeDest } from 'front-end/lib/views/link';
import React from 'react';
import { Col, Row } from 'reactstrap';
import { compareStrings, find } from 'shared/lib';
import { AffiliationSlim, memberIsPending, MembershipType } from 'shared/lib/resources/affiliation';
import { doesOrganizationMeetSWUQualification } from 'shared/lib/resources/organization';
import { adt, ADT, Id } from 'shared/lib/types';
import i18next from 'i18next';

type TableAffiliation = AffiliationSlim;

type ModalId
  = ADT<'deleteAffiliation', AffiliationSlim>
  | ADT<'approveAffiliation', AffiliationSlim>
  | ADT<'rejectAffiliation', AffiliationSlim>;

export interface State extends Tab.Params {
  showModal: ModalId | null;
  deleteAffiliationLoading: Id | null;
  approveAffiliationLoading: Id | null;
  rejectAffiliationLoading: Id | null;
  ownedRecords: TableAffiliation[];
  affiliatedRecords: TableAffiliation[];
  ownedTable: Immutable<Table.State>;
  affiliatedTable: Immutable<Table.State>;
}

export type InnerMsg
  = ADT<'ownedTable', Table.Msg>
  | ADT<'affiliatedTable', Table.Msg>
  | ADT<'deleteAffiliation', AffiliationSlim>
  | ADT<'approveAffiliation', AffiliationSlim>
  | ADT<'rejectAffiliation', AffiliationSlim>
  | ADT<'showModal', ModalId>
  | ADT<'hideModal'>;

export type Msg = GlobalComponentMsg<InnerMsg, Route>;

const init: Init<Tab.Params, State> = async ({ viewerUser, profileUser, invitation }) => {
  const result = await api.affiliations.readMany();
  let affiliations: TableAffiliation[] = [];
  if (api.isValid(result)) {
    affiliations = result.value.sort((a, b) => compareStrings(a.organization.legalName, b.organization.legalName));
  }
  let showModal: State['showModal'] = null;
  if (invitation) {
    const affiliation = find(affiliations, a => a.id === invitation.affiliationId);
    if (affiliation && memberIsPending(affiliation)) {
      showModal = adt(
        invitation.response === 'approve' ? 'approveAffiliation' : 'rejectAffiliation',
        affiliation
      );
    }
  }
  return {
    showModal,
    deleteAffiliationLoading: null,
    approveAffiliationLoading: null,
    rejectAffiliationLoading: null,
    profileUser,
    viewerUser,
    ownedRecords: affiliations.filter(a => a.membershipType === MembershipType.Owner),
    affiliatedRecords: affiliations.filter(a => a.membershipType === MembershipType.Member),
    ownedTable: immutable(await Table.init({
      idNamespace: 'user-profile-orgs-owned'
    })),
    affiliatedTable: immutable(await Table.init({
      idNamespace: 'user-profile-orgs-affiliated'
    }))
  };
};

const update: Update<State, Msg> = ({ state, msg }) => {
  switch (msg.tag) {
    case 'showModal':
      return [state.set('showModal', msg.value)];
    case 'hideModal':
      return [state.set('showModal', null)];
    case 'ownedTable':
      return updateComponentChild({
        state,
        childStatePath: ['ownedTable'],
        childUpdate: Table.update,
        childMsg: msg.value,
        mapChildMsg: value => ({ tag: 'ownedTable', value })
      });
    case 'affiliatedTable':
      return updateComponentChild({
        state,
        childStatePath: ['affiliatedTable'],
        childUpdate: Table.update,
        childMsg: msg.value,
        mapChildMsg: value => ({ tag: 'affiliatedTable', value })
      });
    case 'deleteAffiliation':
      return [
        state
          .set('deleteAffiliationLoading', msg.value.id)
          .set('showModal', null),
        async (state, dispatch) => {
          state = state.set('deleteAffiliationLoading', null);
          const result = await api.affiliations.delete(msg.value.id);
          if (!api.isValid(result)) {
            dispatch(toast(adt('error', toasts.leftOrganization.error(msg.value))));
            return state;
          }
          dispatch(toast(adt('success', toasts.leftOrganization.success(msg.value))));
          return immutable(await init({
            profileUser: state.profileUser,
            viewerUser: state.viewerUser
          }));
        }
      ];
    case 'approveAffiliation':
      return [
        state
          .set('approveAffiliationLoading', msg.value.id)
          .set('showModal', null),
        async (state, dispatch) => {
          state = state.set('approveAffiliationLoading', null);
          const result = await api.affiliations.update(msg.value.id, null);
          if (!api.isValid(result)) {
            dispatch(toast(adt('error', toasts.approvedOrganizationRequest.error(msg.value))));
            return state;
          }
          dispatch(toast(adt('success', toasts.approvedOrganizationRequest.success(msg.value))));
          return immutable(await init({
            profileUser: state.profileUser,
            viewerUser: state.viewerUser
          }));
        }
      ];
    case 'rejectAffiliation':
      return [
        state
          .set('rejectAffiliationLoading', msg.value.id)
          .set('showModal', null),
        async (state, dispatch) => {
          state = state.set('rejectAffiliationLoading', null);
          const result = await api.affiliations.delete(msg.value.id);
          if (!api.isValid(result)) {
            dispatch(toast(adt('error', toasts.rejectedOrganizationRequest.error(msg.value))));
            return state;
          }
          dispatch(toast(adt('success', toasts.rejectedOrganizationRequest.success(msg.value))));
          return immutable(await init({
            profileUser: state.profileUser,
            viewerUser: state.viewerUser
          }));
        }
      ];
    default:
      return [state];
  }
};

function ownedTableHeadCells(state: Immutable<State>): Table.HeadCells {
  return [
    {
      children: i18next.t('legalName'),
      className: 'text-nowrap',
      style: {
        width: '100%',
        minWidth: '240px'
      }
    },
    {
      children: i18next.t('teamMembers'),
      className: 'text-center text-nowrap',
      style: {
        width: '0px'
      }
    },
    {
      children: `${i18next.t('swuQualified')}?`,
      className: 'text-center text-nowrap',
      style: {
        width: '0px'
      }
    }
  ];
}

function ownedTableBodyRows(state: Immutable<State>): Table.BodyRows {
  return state.ownedRecords.map(affiliation => {
    const swuQualified = doesOrganizationMeetSWUQualification(affiliation.organization);
    const orgId = affiliation.organization.id;
    return [
      {
        children: (<Link dest={routeDest(adt('orgEdit', { orgId })) }>{affiliation.organization.legalName}</Link>)
      },
      {
        className: 'text-center',
        children: (<Link dest={routeDest(adt('orgEdit', { orgId, tab: 'team' as const }))}>{String(affiliation.organization.numTeamMembers) || EMPTY_STRING}</Link>)
      },
      {
        className: 'text-center',
        children: (
          <Icon
            name={swuQualified ? 'check' : 'times'}
            color={swuQualified ? 'success' : 'body'} />
        )
      }
    ];
  });
}

function affiliatedTableHeadCells(state: Immutable<State>): Table.HeadCells {
  return [
    {
      children: i18next.t('legalName'),
      className: 'text-nowrap',
      style: {
        width: '100%',
        minWidth: '240px'
      }
    },
    {
      children: '',
      style: {
        width: '0px'
      }
    }
  ];
}

function affiliatedTableBodyRows(state: Immutable<State>, dispatch: Dispatch<Msg>): Table.BodyRows {
  return state.affiliatedRecords.map(affiliation => {
    const isDeleteLoading = state.deleteAffiliationLoading === affiliation.id;
    const isApproveLoading = state.approveAffiliationLoading === affiliation.id;
    const isRejectLoading = state.rejectAffiliationLoading === affiliation.id;
    const isDisabled = isDeleteLoading || isApproveLoading || isRejectLoading;
    const isPending = memberIsPending(affiliation);
    return [
      {
        children: (
          <div>
            <span>{affiliation.organization.legalName}</span>
            {isPending
              ? (<PendingBadge className='ml-3' />)
              : null}
          </div>
        ),
        style: {
          verticalAlign: 'middle'
        }
      },
      {
        showOnHover: !(isApproveLoading || isRejectLoading || isDeleteLoading),
        children: isPending
          ? (
              <div className='d-flex align-items-center flex-nowrap'>
                <Link
                  button
                  disabled={isDisabled}
                  loading={isApproveLoading}
                  size='sm'
                  color='success'
                  className='mr-2'
                  symbol_={leftPlacement(iconLinkSymbol('user-check'))}
                  onClick={() => dispatch(adt('showModal', adt('approveAffiliation', affiliation)) as Msg)}>
                  {i18next.t('approve')}
                </Link>
                <Link
                  button
                  disabled={isDisabled}
                  loading={isRejectLoading}
                  size='sm'
                  color='danger'
                  symbol_={leftPlacement(iconLinkSymbol('user-times'))}
                  onClick={() => dispatch(adt('showModal', adt('rejectAffiliation', affiliation)) as Msg)}>
                  {i18next.t('reject')}
                </Link>
              </div>
            )
          : (<Link
              button
              disabled={isDisabled}
              loading={isDeleteLoading}
              size='sm'
              color='danger'
              symbol_={leftPlacement(iconLinkSymbol('user-times'))}
              onClick={() => dispatch(adt('showModal', adt('deleteAffiliation', affiliation)) as Msg)}>
              {i18next.t('leave')}
            </Link>),
        className: 'py-2'
      }
    ];
  });
}

const view: ComponentView<State, Msg> = ({ state, dispatch }) => {
  const dispatchOwnedTable = mapComponentDispatch<Msg, Table.Msg>(dispatch, value => ({ tag: 'ownedTable', value }));
  const dispatchAffiliatedTable = mapComponentDispatch<Msg, Table.Msg>(dispatch, value => ({ tag: 'affiliatedTable', value }));
  return (
    <div>
      <Row>
        <Col xs='12'>
          <h2>{i18next.t('ownedOrganizations')}</h2>
          <p className={state.ownedRecords.length ? 'mb-5' : 'mb-0'}>
            {state.ownedRecords.length
              ? i18next.t('isOwnedOrganisations')
              : i18next.t('isNotOwnedOrganisations')}
          </p>
        </Col>
      </Row>
      {state.ownedRecords.length
        ? (<Row>
            <Col xs='12'>
              <Table.view
                headCells={ownedTableHeadCells(state)}
                bodyRows={ownedTableBodyRows(state)}
                state={state.ownedTable}
                dispatch={dispatchOwnedTable} />
            </Col>
          </Row>)
        : null}
      <Row>
        <Col xs='12'>
          <div className='mt-5 pt-5 border-top'>
            <h2>{i18next.t('affiliatedOrganizations')}</h2>
            <p className='mb-5'>
              {state.affiliatedRecords.length
                ? i18next.t('isAffilateOrganizations')
                : i18next.t('isNotAffilateOrganizations')}
            </p>
          </div>
        </Col>
      </Row>
      {state.affiliatedRecords.length
        ? (<Row>
            <Col xs='12'>
              <Table.view
                headCells={affiliatedTableHeadCells(state)}
                bodyRows={affiliatedTableBodyRows(state, dispatch)}
                state={state.affiliatedTable}
                dispatch={dispatchAffiliatedTable} />
            </Col>
          </Row>)
        : null}
    </div>
  );
};

export const component: Tab.Component<State, Msg> = {
  init,
  update,
  view,
  getModal(state) {
    if (!state.showModal) { return null; }
    switch (state.showModal.tag) {
      case 'deleteAffiliation':
        return {
          title: `${i18next.t('leaveOrganization')}?`,
          body: () => i18next.t('leaveOrganizationModalBody'),
          onCloseMsg: adt('hideModal'),
          actions: [
            {
              text: i18next.t('leaveOrganization'),
              icon: 'user-times',
              color: 'danger',
              msg: adt('deleteAffiliation', state.showModal.value),
              button: true
            },
            {
              text: i18next.t('links.cancel'),
              color: 'secondary',
              msg: adt('hideModal')
            }
          ]
        };
      case 'approveAffiliation':
        return {
          title:  `${i18next.t('approveRequest')}?`,
          body: () => i18next.t('approveRequestModalBody'),
          onCloseMsg: adt('hideModal'),
          actions: [
            {
              text: i18next.t('approveRequest'),
              icon: 'user-check',
              color: 'success',
              msg: adt('approveAffiliation', state.showModal.value),
              button: true
            },
            {
              text: i18next.t('links.cancel'),
              color: 'secondary',
              msg: adt('hideModal')
            }
          ]
        };
      case 'rejectAffiliation':
        return {
          title:  `${i18next.t('rejectRequest')}?`,
          body: () => i18next.t('rejectRequestModalBody'),
          onCloseMsg: adt('hideModal'),
          actions: [
            {
              text: i18next.t('rejectRequest'),
              icon: 'user-times',
              color: 'danger',
              msg: adt('rejectAffiliation', state.showModal.value),
              button: true
            },
            {
              text: i18next.t('links.cancel'),
              color: 'secondary',
              msg: adt('hideModal')
            }
          ]
        };
    }
  },
  getContextualActions({ state }) {
    return adt('links', [{
      children: i18next.t('links.create-organization'),
      dest: routeDest(adt('orgCreate', null)),
      button: true,
      symbol_: leftPlacement(iconLinkSymbol('plus-circle')),
      color: 'primary'
    }]);
  }
};
