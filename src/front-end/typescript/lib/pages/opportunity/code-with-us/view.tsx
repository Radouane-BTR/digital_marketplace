import { EMPTY_STRING } from 'front-end/config';
import { getAlertsValid, getContextualActionsValid, getMetadataValid, makePageMetadata, makeStartLoading, makeStopLoading, updateValid, viewValid } from 'front-end/lib';
import { Route, SharedState } from 'front-end/lib/app/types';
import { AddendaList } from 'front-end/lib/components/addenda';
import { AttachmentList } from 'front-end/lib/components/attachments';
import { ComponentView, GlobalComponentMsg, Immutable, immutable, PageComponent, PageInit, replaceRoute, Update, View } from 'front-end/lib/framework';
import * as api from 'front-end/lib/http/api';
import { OpportunityBadge } from 'front-end/lib/views/badge';
import DateMetadata from 'front-end/lib/views/date-metadata';
import GotQuestions from 'front-end/lib/views/got-questions';
import Icon, { AvailableIcons, IconInfo } from 'front-end/lib/views/icon';
import Link, { emailDest, iconLinkSymbol, leftPlacement, routeDest } from 'front-end/lib/views/link';
import Markdown from 'front-end/lib/views/markdown';
import OpportunityInfo from 'front-end/lib/views/opportunity-info';
import ProgramType from 'front-end/lib/views/program-type';
import Skills from 'front-end/lib/views/skills';
import TabbedNav, { Tab } from 'front-end/lib/views/tabbed-nav';
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { CONTACT_EMAIL } from 'shared/config';
import { formatAmount, formatDate, formatDateAtTime } from 'shared/lib';
import { getCWUOpportunityViewsCounterName } from 'shared/lib/resources/counter';
import { CWUOpportunity, DEFAULT_OPPORTUNITY_TITLE, isCWUOpportunityAcceptingProposals } from 'shared/lib/resources/opportunity/code-with-us';
import { CWUProposalSlim } from 'shared/lib/resources/proposal/code-with-us';
import { isVendor, User, UserType } from 'shared/lib/resources/user';
import { adt, ADT, Id } from 'shared/lib/types';
import { invalid, valid, Validation } from 'shared/lib/validation';
import i18next from 'i18next';

type InfoTab
  = 'details'
  | 'attachments'
  | 'addenda';

interface ValidState {
  toggleWatchLoading: number;
  opportunity: CWUOpportunity;
  existingProposal?: CWUProposalSlim;
  viewerUser?: User;
  activeInfoTab: InfoTab;
  routePath: string;
}

export type State = Validation<Immutable<ValidState>, null>;

type InnerMsg
  = ADT<'toggleWatch'>
  | ADT<'setActiveInfoTab', InfoTab>;

export type Msg = GlobalComponentMsg<InnerMsg, Route>;

export interface RouteParams {
  opportunityId: Id;
}

const init: PageInit<RouteParams, SharedState, State, Msg> = async ({ dispatch, routeParams, shared, routePath }) => {
  const { opportunityId } = routeParams;
  const viewerUser = shared.session?.user;
  const oppR = await api.opportunities.cwu.readOne(opportunityId);
  if (!api.isValid(oppR)) {
    dispatch(replaceRoute(adt('notFound', { path: routePath }) as Route));
    return invalid(null);
  }
  await api.counters.update(getCWUOpportunityViewsCounterName(opportunityId), null);
  let existingProposal: CWUProposalSlim | undefined;
  if (viewerUser && isVendor(viewerUser)) {
    existingProposal = await api.proposals.cwu.getExistingProposalForOpportunity(opportunityId);
  }
  return valid(immutable({
    toggleWatchLoading: 0,
    viewerUser,
    opportunity: oppR.value,
    existingProposal,
    activeInfoTab: 'details',
    routePath
  }));
};

const startToggleWatchLoading = makeStartLoading<ValidState>('toggleWatchLoading');
const stopToggleWatchLoading = makeStopLoading<ValidState>('toggleWatchLoading');

const update: Update<State, Msg> = updateValid(({ state, msg }) => {
  switch (msg.tag) {
    case 'setActiveInfoTab':
      return [state.set('activeInfoTab', msg.value)];
    case 'toggleWatch':
      return [
        startToggleWatchLoading(state),
        async state => {
          state = stopToggleWatchLoading(state);
          const id = state.opportunity.id;
          const result = state.opportunity.subscribed
            ? await api.subscribers.cwu.delete(id)
            : await api.subscribers.cwu.create({ opportunity: id });
          if (result.tag === 'valid') {
            state = state.update('opportunity', o => ({
              ...o,
              subscribed: !o.subscribed
            }));
          }
          return state;
        }
      ];
    default:
      return [state];
  }
});

const Header: ComponentView<ValidState, Msg> = ({ state, dispatch }) => {
  const opp = state.opportunity;
  const isToggleWatchLoading = state.toggleWatchLoading > 0;
  const isAcceptingProposals = isCWUOpportunityAcceptingProposals(state.opportunity);
  return (
    <div>
      <Container>
        <Row>
          <Col xs='12'>
            <DateMetadata
              className='mb-5'
              dates={[
                opp.publishedAt
                  ? {
                      tag: 'date',
                      date: opp.publishedAt,
                      label: i18next.t('published'),
                      withTimeZone: true
                    }
                  : null,
                {
                  tag: 'date',
                  date: opp.updatedAt,
                  label: i18next.t('updated'),
                  withTimeZone: true
                }
              ]} />
          </Col>
        </Row>
        <Row className='align-items-center'>
          <Col xs='12' md='6' lg='6'>
            <h2 className='mb-2'>{opp.title || DEFAULT_OPPORTUNITY_TITLE}</h2>
            <ProgramType size='lg' type_='cwu' className='mb-4' />
            <div className='d-flex flex-column flex-sm-row flex-nowrap align-items-start align-items-md-center mb-4'>
              <OpportunityBadge opportunity={adt('cwu', opp)} viewerUser={state.viewerUser} className='mb-2 mb-sm-0' />
              <IconInfo
                name='alarm-clock-outline'
                value={`${isAcceptingProposals ? i18next.t('closes') : i18next.t('closed')} ${formatDateAtTime(opp.proposalDeadline, true)}`}
                className='ml-sm-3 flex-shrink-0' />
            </div>
            {opp.teaser ? (<p className='text-secondary mb-4'>{opp.teaser}</p>) : null}
            <div className='d-flex flex-nowrap align-items-center'>
              <Link
                disabled={isToggleWatchLoading}
                dest={emailDest([CONTACT_EMAIL, opp.title])}
                symbol_={leftPlacement(iconLinkSymbol('envelope'))}
                color='info'
                size='sm'
                outline
                button>
                Contact
              </Link>
              {state.viewerUser && state.viewerUser.id !== opp.createdBy?.id
                ? (<Link
                    className='ml-3'
                    disabled={isToggleWatchLoading}
                    loading={isToggleWatchLoading}
                    onClick={() => dispatch(adt('toggleWatch'))}
                    symbol_={leftPlacement(iconLinkSymbol(opp.subscribed ? 'check' : 'eye'))}
                    color={opp.subscribed ? 'info' : 'primary'}
                    size='sm'
                    outline={!opp.subscribed}
                    button>
                    {opp.subscribed ? i18next.t('watching') : i18next.t('watch')}
                  </Link>)
                : null}
            </div>
          </Col>
          <Col xs='12' md='6' lg={{ offset: 1, size: 5 }} className='mt-5 mt-md-0 pl-md-4'>
            <Row className='mb-4 mb-md-5'>
              <Col xs='6' className='d-flex justify-content-start align-items-start flex-nowrap'>
                <OpportunityInfo
                  icon='comment-dollar-outline'
                  name= {i18next.t('detailsViewProposalDeadlineLabel')}
                  value={formatDate(opp.proposalDeadline)} />
              </Col>
              <Col xs='6' className='d-flex justify-content-start align-items-start flex-nowrap'>
                <OpportunityInfo
                  icon='badge-dollar-outline'
                  name={i18next.t('value')}
                  value={opp.reward ? formatAmount(opp.reward, '$') : EMPTY_STRING} />
              </Col>
            </Row>
            <Row className='mb-4 mb-md-5'>
              <Col xs='6' className='d-flex justify-content-start align-items-start flex-nowrap'>
                <OpportunityInfo
                  icon='map-marker-outline'
                  name={i18next.t('location')}
                  value={opp.location || EMPTY_STRING} />
              </Col>
              <Col xs='6' className='d-flex justify-content-start align-items-start flex-nowrap'>
                <OpportunityInfo
                  icon='laptop-outline'
                  name={`${i18next.t('overviewViewRemote')} ?`}
                  value={opp.remoteOk ? i18next.t('yes') : i18next.t('no')} />
              </Col>
            </Row>
            <Row>
              <Col xs='6' className='d-flex justify-content-start align-items-start flex-nowrap'>
                <OpportunityInfo
                  icon='award-outline'
                  name={i18next.t('assignmentDate')}
                  value={formatDate(opp.assignmentDate)} />
              </Col>
              <Col xs='6' className='d-flex justify-content-start align-items-start flex-nowrap'>
                <OpportunityInfo
                  icon='user-hard-hat-outline'
                  name={i18next.t('workStartDate')}
                  value={formatDate(opp.startDate)} />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const InfoDetailsHeading: View<{ icon: AvailableIcons; text: string; }> = ({ icon, text }) => {
  return (
    <div className='d-flex align-items-start flex-nowrap mb-3'>
      <Icon name={icon} width={1.5} height={1.5} className='flex-shrink-0' style={{ marginTop: '0.3rem' }} />
      <h4 className='mb-0 ml-2'>{text}</h4>
    </div>
  );
};

const InfoDetails: ComponentView<ValidState, Msg> = ({ state }) => {
  const opp = state.opportunity;
  return (
    <Row>
      <Col xs='12'>
        <h3 className='mb-0'>{i18next.t('details')}</h3>
      </Col>
      <Col xs='12' className='mt-5'>
        <InfoDetailsHeading icon='toolbox-outline' text={i18next.t('requiredSkills')} />
        <p className='mb-2'>{i18next.t('infoDetailsHeading')}</p>
        <Skills skills={opp.skills} />
      </Col>
      <Col xs='12' className='mt-5'>
        <InfoDetailsHeading icon='info-circle-outline' text='Description' />
        <Markdown source={opp.description || EMPTY_STRING} smallerHeadings openLinksInNewTabs />
      </Col>
      {opp.submissionInfo
        ? (<Col xs='12' className='mt-5'>
            <InfoDetailsHeading icon='laptop-code-outline' text={i18next.t('projectSubmissionInformation')} />
            <p className='mb-0'>{opp.submissionInfo}</p>
          </Col>)
        : null}
      {opp.remoteOk && opp.remoteDesc
        ? (<Col xs='12' className='mt-5'>
            <InfoDetailsHeading icon='laptop-outline' text={i18next.t('remoteWorkOptions')} />
            <p className='mb-0' style={{ whiteSpace: 'pre-line' }}>{opp.remoteDesc}</p>
          </Col>)
        : null}
    </Row>
  );
};

const InfoAttachments: ComponentView<ValidState, Msg> = ({ state }) => {
  const attachments = state.opportunity.attachments;
  return (
    <Row>
      <Col xs='12'>
        <h3 className='mb-0'>{i18next.t('attachments')}</h3>
      </Col>
      <Col xs='12' className='mt-4'>
        {attachments.length
          ? (<AttachmentList files={state.opportunity.attachments} />)
          : i18next.t('noAttachementsMessage')}
      </Col>
    </Row>
  );
};

const InfoAddenda: ComponentView<ValidState, Msg> = ({ state }) => {
  const addenda = state.opportunity.addenda;
  return (
    <Row>
      <Col xs='12'>
        <h3 className='mb-0'>{i18next.t('addenda')}</h3>
      </Col>
      <Col xs='12' className='mt-4'>
        {addenda.length
          ? (<AddendaList addenda={state.opportunity.addenda} />)
          : i18next.t('noAddendaMessage')}
      </Col>
    </Row>
  );
};

const InfoTabs: ComponentView<ValidState, Msg> = ({ state, dispatch }) => {
  const activeTab = state.activeInfoTab;
  const opp = state.opportunity;
  const getTabInfo = (tab: InfoTab) => ({
    active: activeTab === tab,
    onClick: () => dispatch(adt('setActiveInfoTab', tab))
  });
  const tabs: Tab[] = [
    {
      ...getTabInfo('details'),
      text: i18next.t('details')
    },
    {
      ...getTabInfo('attachments'),
      text: i18next.t('attachments'),
      count: opp.attachments.length
    },
    {
      ...getTabInfo('addenda'),
      text: i18next.t('addenda'),
      count: opp.addenda.length
    }
  ];
  return (
    <Row className='mb-5'>
      <Col xs='12'>
        <TabbedNav tabs={tabs} />
      </Col>
    </Row>
  );
};

const Info: ComponentView<ValidState, Msg> = props => {
  const { state } = props;
  const activeTab = (() => {
    switch (state.activeInfoTab) {
      case 'details':     return (<InfoDetails {...props} />);
      case 'attachments': return (<InfoAttachments {...props} />);
      case 'addenda':     return (<InfoAddenda {...props} />);
    }
  })();
  return (
    <div className='mt-6'>
      <Container>
        <InfoTabs {...props} />
        <Row>
          <Col xs='12' md='8'>
            {activeTab}
          </Col>
          <Col xs='12' md='4' lg={{ offset: 1, size: 3 }} className='mt-5 mt-md-0'>
            <GotQuestions disabled={state.toggleWatchLoading > 0} title={state.opportunity.title} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const AcceptanceCriteria: ComponentView<ValidState, Msg> = ({ state }) => {
  if (!state.opportunity.acceptanceCriteria) { return null; }
  return (
    <Container>
      <div className='mt-5 pt-5 border-top'>
        <Row>
          <Col xs='12'>
            <h3 className='mb-4'>{i18next.t('detailsViewAcceptanceCriteriaLabel')}</h3>
            <p className='mb-4'>{i18next.t('acceptanceCriteriaViewText')}</p>
            <Markdown source={state.opportunity.acceptanceCriteria} smallerHeadings openLinksInNewTabs />
          </Col>
        </Row>
      </div>
    </Container>
  );
};

const EvaluationCriteria: ComponentView<ValidState, Msg> = ({ state }) => {
  if (!state.opportunity.evaluationCriteria) { return null; }
  return (
    <Container>
      <div className='mt-5 pt-5 border-top'>
        <Row>
          <Col xs='12'>
            <h3 className='mb-4'>{i18next.t('proposalEvaluationCriteria')}</h3>
            <p className='mb-4'>{i18next.t('proposalEvaluationCriteriaViewText')}</p>
            <Markdown source={state.opportunity.evaluationCriteria} smallerHeadings openLinksInNewTabs />
          </Col>
        </Row>
      </div>
    </Container>
  );
};

const HowToApply: ComponentView<ValidState, Msg> = ({ state }) => {
  const viewerUser = state.viewerUser;
  if ((viewerUser && !isVendor(viewerUser)) || !isCWUOpportunityAcceptingProposals(state.opportunity)) { return null; }
  return (
    <div className='bg-c-opportunity-view-apply-bg py-5 mt-auto'>
      <Container>
        <Row>
          <Col xs='12' md='8'>
            <h3 className='mb-4'>{i18next.t('howToApply')}</h3>
            <p>
              {i18next.t('CWUhowToApplyViewBodyP1-1')}&nbsp;
              {!viewerUser
                ? (<span>{i18next.t('CWUhowToApplyViewBodyP1-2')}<Link dest={routeDest(adt('signIn', { redirectOnSuccess: state.routePath }))}>{i18next.t('links.sign-in')}</Link>.</span>)
                : null}
            </p>
            <p className='mb-0'>{i18next.t('CWUhowToApplyViewBodyP2')}</p>
            {viewerUser && isVendor(viewerUser) && !state.existingProposal && isCWUOpportunityAcceptingProposals(state.opportunity)
              ? (<Link
                  disabled={state.toggleWatchLoading > 0}
                  className='mt-4'
                  button
                  color='primary'
                  dest={routeDest(adt('proposalCWUCreate', { opportunityId: state.opportunity.id }))}
                  symbol_={leftPlacement(iconLinkSymbol('comment-dollar'))}>
                  {i18next.t('links.startProposal')}
                </Link>)
              : null}
          </Col>
          <Col md='4' lg={{ offset: 1, size: 3 }} className='align-items-center justify-content-center d-none d-md-flex'>
            <OpportunityInfo
              icon='comment-dollar-outline'
              name={i18next.t('detailsViewProposalDeadlineLabel')}
              value={formatDate(state.opportunity.proposalDeadline, true)} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const view: ComponentView<State, Msg> = viewValid(props => {
  const isDetails = props.state.activeInfoTab === 'details';
  return (
    <div className='flex-grow-1 d-flex flex-column flex-nowrap align-items-stretch'>
      <div className='mb-5'>
        <Header {...props} />
        <Info {...props} />
        {isDetails ? (<AcceptanceCriteria {...props} />) : null}
        {isDetails ? (<EvaluationCriteria {...props} />) : null}
      </div>
      <HowToApply {...props} />
    </div>
  );
});

export const component: PageComponent<RouteParams, SharedState, State, Msg> = {
  fullWidth: true,
  init,
  update,
  view,

  getMetadata: getMetadataValid(state => {
    return makePageMetadata(state.opportunity.title || DEFAULT_OPPORTUNITY_TITLE);
  }, makePageMetadata(i18next.t('opportunity'))),

  getAlerts: getAlertsValid(state => {
    const viewerUser = state.viewerUser;
    const existingProposal = state.existingProposal;
    const successfulProponentName = state.opportunity.successfulProponent?.name;
    return {
      info: (() => {
        const alerts = [];
        if (viewerUser && isVendor(viewerUser) && existingProposal?.submittedAt) {
          alerts.push({
            text: i18next.t('alertSubmitProposalPush', {date: formatDateAtTime(existingProposal.submittedAt, true)})
          });
        }
        if (successfulProponentName) {
          alerts.push({
            text: i18next.t('alertAwardedProposalPush', {who: successfulProponentName})
          });
        }
        return alerts;
      })()
    };
  }),

  getContextualActions: getContextualActionsValid(({ state }) => {
    const viewerUser = state.viewerUser;
    if (!viewerUser) { return null; }
    const isToggleWatchLoading = state.toggleWatchLoading > 0;
    const isAcceptingProposals = isCWUOpportunityAcceptingProposals(state.opportunity);
    switch (viewerUser.type) {
      case UserType.Admin:
        return adt('links', [
          {
            disabled: isToggleWatchLoading,
            children: i18next.t('links.editOpportunity'),
            symbol_: leftPlacement(iconLinkSymbol('edit')),
            button: true,
            color: 'primary',
            dest: routeDest(adt('opportunityCWUEdit', {
              opportunityId: state.opportunity.id
            }))
          }
        ]);
      case UserType.Government:
        if (state.opportunity.createdBy?.id === viewerUser.id) {
          return adt('links', [
            {
              disabled: isToggleWatchLoading,
              children: i18next.t('links.editOpportunity'),
              symbol_: leftPlacement(iconLinkSymbol('edit')),
              button: true,
              color: 'primary',
              dest: routeDest(adt('opportunityCWUEdit', {
                opportunityId: state.opportunity.id
              }))
            }
          ]);
        } else {
          return null;
        }
      case UserType.Vendor:
        if (state.existingProposal) {
          return adt('links', [
            {
              disabled: isToggleWatchLoading,
              children: i18next.t('links.viewProposal'),
              symbol_: leftPlacement(iconLinkSymbol('comment-dollar')),
              button: true,
              color: 'primary',
              dest: routeDest(adt('proposalCWUEdit', {
                opportunityId: state.opportunity.id,
                proposalId: state.existingProposal.id
              }))
            }
          ]);
        } else if (isAcceptingProposals) {
          return adt('links', [
            {
              disabled: isToggleWatchLoading,
              children: i18next.t('links.startProposal'),
              symbol_: leftPlacement(iconLinkSymbol('comment-dollar')),
              button: true,
              color: 'primary',
              dest: routeDest(adt('proposalCWUCreate', {
                opportunityId: state.opportunity.id
              }))
            }
          ]);
        } else {
          return null;
        }
    }
  })
};
