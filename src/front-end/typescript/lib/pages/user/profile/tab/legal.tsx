import { APP_TERMS_CONTENT_ID } from 'front-end/config';
import { makeStartLoading, makeStopLoading } from 'front-end/lib';
import { Route } from 'front-end/lib/app/types';
import * as AcceptNewTerms from 'front-end/lib/components/accept-new-app-terms';
import { ComponentView, GlobalComponentMsg, immutable, Immutable, Init, Update, updateComponentChild, View, ViewElementChildren } from 'front-end/lib/framework';
import * as Tab from 'front-end/lib/pages/user/profile/tab';
import Link, { emailDest, iconLinkSymbol, leftPlacement, routeDest } from 'front-end/lib/views/link';
import React from 'react';
import { Col, Row } from 'reactstrap';
import { COPY } from 'shared/config';
import { formatDate, formatTime } from 'shared/lib';
import { adt, ADT } from 'shared/lib/types';
import i18next from 'i18next';
import { Trans } from 'react-i18next';

// Only vendors can view this tab.

type ModalId = 'acceptNewTerms';

export interface State extends Tab.Params {
  showModal: ModalId | null;
  acceptNewTermsLoading: number;
  acceptNewTerms: Immutable<AcceptNewTerms.State>;
}

export type InnerMsg
  = ADT<'showModal', ModalId>
  | ADT<'hideModal'>
  | ADT<'acceptNewTerms', AcceptNewTerms.Msg>
  | ADT<'submitAcceptNewTerms'>;

export type Msg = GlobalComponentMsg<InnerMsg, Route>;

const init: Init<Tab.Params, State> = async ({ viewerUser, profileUser }) => {
  return {
    profileUser,
    viewerUser,
    showModal: null,
    acceptNewTermsLoading: 0,
    acceptNewTerms: immutable(await AcceptNewTerms.init({
      errors: [],
      child: {
        value: !!profileUser.acceptedTermsAt,
        id: 'profile-legal-accept-new-terms'
      }
    }))
  };
};

function hideModal(state: Immutable<State>): Immutable<State> {
  return state.set('showModal', null);
}

const startAcceptNewTermsLoading = makeStartLoading<State>('acceptNewTermsLoading');
const stopAcceptNewTermsLoading = makeStopLoading<State>('acceptNewTermsLoading');

const update: Update<State, Msg> = ({ state, msg }) => {
  switch (msg.tag) {
    case 'showModal':
      return [state.set('showModal', msg.value)];
    case 'hideModal':
      return [hideModal(state)];
    case 'acceptNewTerms':
      return updateComponentChild({
        state,
        childStatePath: ['acceptNewTerms'],
        childUpdate: AcceptNewTerms.update,
        childMsg: msg.value,
        mapChildMsg: value => adt('acceptNewTerms', value)
      });
    case 'submitAcceptNewTerms':
      return AcceptNewTerms.submitAcceptNewTerms({
        state,
        userId: state.profileUser.id,
        startLoading: startAcceptNewTermsLoading,
        stopLoading: stopAcceptNewTermsLoading
      });
    default:
      return [state];
  }
};

const TermsSubtext: View<{ children: ViewElementChildren; }> = ({ children }) => {
  return (
    <div className='mt-2 text-secondary font-size-small'>
      {children}
    </div>
  );
};

const view: ComponentView<State, Msg> = ({ state, dispatch }) => {
  const acceptedTerms = state.profileUser.acceptedTermsAt;
  const hasAcceptedLatest = !!acceptedTerms;
  return (
    <div>
      <Row>
        <Col xs='12'>
          <h2>{i18next.t('policiesTermsAndAgreements')}</h2>
          <p className='mb-0'>{i18next.t('legalTermsDescription')}</p>
        </Col>
      </Row>
      <Row>
        <Col xs='12'>
          <div className='mt-5 pt-5 border-top'>
            <h3>{i18next.t('privacyPolicy')}</h3>
            <div>{i18next.t('privacyPolicyDescriptionP1')} <Link dest={emailDest(['procurementadvisory@gov.bc.ca'])}>procurementadvisory@gov.bc.ca</Link>.</div>
            <TermsSubtext><Trans i18nKey="privacyPolicyDescriptionP2" components={{ italic: <i /> }}/></TermsSubtext>
          </div>
        </Col>
        <Col xs='12'>
          <div className='mt-4'>
            <h3>{i18next.t('termsAndConditions')}</h3>
            <div className='mt-3'>
              <Link newTab dest={routeDest(adt('contentView', APP_TERMS_CONTENT_ID))} symbol_={hasAcceptedLatest ? undefined : leftPlacement(iconLinkSymbol('warning'))} symbolClassName='text-warning'>{COPY.appTermsTitle}</Link>
              {acceptedTerms
                ? (<TermsSubtext><Trans i18nKey="termsAndConditionsDescriptionP1" values={{title:COPY.appTermsTitle, date: formatDate(acceptedTerms), time: formatTime(acceptedTerms, true)}} components={{ italic: <i /> }}/></TermsSubtext>)
                : (<TermsSubtext><Trans i18nKey="termsAndConditionsDescriptionP2" values={{title:COPY.appTermsTitle}} components={{ italic: <i /> }}/> <Link newTab dest={routeDest(adt('contentView', APP_TERMS_CONTENT_ID))}>{i18next.t('reviewLatestVersion')}</Link> {i18next.t('and')} <Link onClick={() => dispatch(adt('showModal', 'acceptNewTerms' as const))}>{i18next.t('agreeToTheUpdateTerms')}</Link>.</TermsSubtext>)}
            </div>
            <div className='mt-3'>
              <Link newTab dest={routeDest(adt('contentView', 'code-with-us-terms-and-conditions'))}>{i18next.t('cwuTermsConditions')}</Link>
            </div>
            <div className='mt-3'>
              <Link newTab dest={routeDest(adt('contentView', 'sprint-with-us-terms-and-conditions'))}>{i18next.t('organization.sprint-with-us.title')}</Link>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export const component: Tab.Component<State, Msg> = {
  init,
  update,
  view,
  getModal(state) {
    if (!state.showModal) { return null; }
    const hasAcceptedTerms = AcceptNewTerms.getCheckbox(state.acceptNewTerms);
    const isAcceptNewTermsLoading = state.acceptNewTermsLoading > 0;
    switch (state.showModal) {
      case 'acceptNewTerms':
        return AcceptNewTerms.makeModal<Msg>({
          loading: isAcceptNewTermsLoading,
          disabled: !hasAcceptedTerms || isAcceptNewTermsLoading,
          state: state.acceptNewTerms,
          mapMsg: msg => adt('acceptNewTerms', msg) as Msg,
          onSubmitMsg: adt('submitAcceptNewTerms'),
          onCloseMsg: adt('hideModal')
        });
    }
  }
};
