import { EMPTY_STRING } from 'front-end/config';
import { Route } from 'front-end/lib/app/types';
import { ComponentView, GlobalComponentMsg, Init, Update } from 'front-end/lib/framework';
import * as Tab from 'front-end/lib/pages/opportunity/code-with-us/edit/tab';
import EditTabHeader from 'front-end/lib/pages/opportunity/code-with-us/lib/views/edit-tab-header';
import DescriptionList from 'front-end/lib/views/description-list';
import Link, { emailDest, routeDest } from 'front-end/lib/views/link';
import ReportCardList, { ReportCard } from 'front-end/lib/views/report-card-list';
import Skills from 'front-end/lib/views/skills';
import React from 'react';
import { Col, Row } from 'reactstrap';
import { formatAmount, formatDate } from 'shared/lib';
import { NUM_SCORE_DECIMALS } from 'shared/lib/resources/proposal/code-with-us';
import { isAdmin } from 'shared/lib/resources/user';
import { adt, ADT } from 'shared/lib/types';
import i18next from 'i18next';

export type State = Tab.Params;

export type InnerMsg
  = ADT<'noop'>;

export type Msg = GlobalComponentMsg<InnerMsg, Route>;

const init: Init<Tab.Params, State> = async params => params;

const update: Update<State, Msg> = ({ state, msg }) => {
  switch (msg.tag) {
    default:
      return [state];
  }
};

const SuccessfulProponent: ComponentView<State, Msg> = ({ state }) => {
  const { successfulProponent } = state.opportunity;
  if (!successfulProponent || !successfulProponent.score) { return null; }
  const isViewerAdmin = isAdmin(state.viewerUser);
  const items = [
    {
      name: i18next.t('awardedProponent'),
      children: (() => {
        if (isViewerAdmin) {
          const nameRoute: Route = (() => {
            switch (successfulProponent.id.tag) {
              case 'individual':
                return adt('userProfile', { userId: successfulProponent.id.value }) as Route;
              case 'organization':
                return adt('orgEdit', { orgId: successfulProponent.id.value }) as Route;
            }
          })();
          const email = (() => {
            if (successfulProponent.email) {
              return (<span>(<Link dest={emailDest([successfulProponent.email])}>{successfulProponent.email}</Link>)</span>);
            } else {
              return null;
            }
          })();
          return (
            <div>
              <Link newTab dest={routeDest(nameRoute)}>{successfulProponent.name}</Link> {email}
            </div>
          );
        } else {
          return successfulProponent.name;
        }
      })()
    },
    {
      name: i18next.t('submittedBy'),
      children: (() => {
        if (!successfulProponent.createdBy) { return null; }
        if (isViewerAdmin) {
          return (<Link newTab dest={routeDest(adt('userProfile', { userId: successfulProponent.createdBy.id }))}>{successfulProponent.createdBy.name}</Link>);
        } else {
          return successfulProponent.createdBy.name;
        }
      })()
    }
  ];
  return (
    <div className='mt-5 pt-5 border-top'>
      <Row>
        <Col xs='12'>
          <h4 className='mb-4'>{i18next.t('successfulProponent')}</h4>
        </Col>
      </Row>
      <Row>
        <Col xs='12' md='4' className='mb-4 mb-md-0 d-flex d-md-block'>
          <ReportCard
            icon='star-full'
            iconColor='c-report-card-icon-highlight'
            name={i18next.t('winningScore')}
            value={`${successfulProponent.score ? `${successfulProponent.score.toFixed(NUM_SCORE_DECIMALS)}%` : EMPTY_STRING}`} />
        </Col>
        <Col xs='12' md='8' className='d-flex align-items-center flex-nowrap'>
          <DescriptionList items={items} />
        </Col>
      </Row>
    </div>
  );
};

const Details: ComponentView<State, Msg> = ({ state }) => {
  const opportunity = state.opportunity;
  const skills = opportunity.skills;
  const items = [
    {
      name: i18next.t('assignmentDate'),
      children: formatDate(opportunity.assignmentDate)
    },
    {
      name: i18next.t('startDate'),
      children: formatDate(opportunity.startDate)
    }
  ];
  const reportCards: ReportCard[] = [
    {
      icon: 'alarm-clock',
      name: i18next.t('proposalsDue'),
      value: formatDate(opportunity.proposalDeadline)
    },
    {
      icon: 'badge-dollar',
      name: i18next.t('value'),
      value: formatAmount(opportunity.reward, '$')
    },
    {
      icon: 'map-marker',
      name: i18next.t('location'),
      value: opportunity.location
    }
  ];
  return (
    <div className='mt-5 pt-5 border-top'>
      <Row>
        <Col xs='12'>
          <h4 className='mb-4'>{i18next.t('details')}</h4>
        </Col>
      </Row>
      <Row className='mb-5'>
        <Col xs='12'>
          <ReportCardList reportCards={reportCards} />
        </Col>
      </Row>
      <Row>
        <Col xs='12' md='6'>
          <DescriptionList items={items} />
        </Col>
        <Col xs='12' md='6'>
          <div className='font-weight-bold mb-2 mt-3 mt-md-0'>{i18next.t('requiredSkills')}</div>
          <Skills skills={skills} />
        </Col>
      </Row>
    </div>
  );
};

const view: ComponentView<State, Msg> = props => {
  return (
    <div>
      <EditTabHeader opportunity={props.state.opportunity} viewerUser={props.state.viewerUser} />
      <SuccessfulProponent {...props} />
      <Details {...props} />
    </div>
  );
};

export const component: Tab.Component<State, Msg> = {
  init,
  update,
  view
};
