import { Route } from 'front-end/lib/app/types';
import { ComponentView, GlobalComponentMsg, Init, Update, View, ViewElement } from 'front-end/lib/framework';
import * as Tab from 'front-end/lib/pages/organization/edit/tab';
import EditTabHeader from 'front-end/lib/pages/organization/lib/views/edit-tab-header';
import { acceptedSWUTermsText, TITLE as SWU_TERMS_TITLE } from 'front-end/lib/pages/organization/sprint-with-us-terms';
import Icon from 'front-end/lib/views/icon';
import Link, { routeDest } from 'front-end/lib/views/link';
import React from 'react';
import { Col, Row } from 'reactstrap';
import { doesOrganizationMeetSWUQualificationNumTeamMembers } from 'shared/lib/resources/organization';
import { adt, ADT } from 'shared/lib/types';
import i18next from 'i18next'; 

export type State = Tab.Params;

export type InnerMsg = ADT<'noop'>;

export type Msg = GlobalComponentMsg<InnerMsg, Route>;

const init: Init<Tab.Params, State> = async params => {
  return params;
};

const update: Update<State, Msg> = ({ state, msg }) => {
  return [state];
};

interface RequirementProps {
  name: string | ViewElement;
  description: string;
  checked: boolean;
  className?: string;
}

const Requirement: View<RequirementProps> = ({ name, description, checked, className = '' }) => {
  return (
    <div className={`d-flex flex-nowrap align-items-start ${className}`}>
      <Icon name={checked ? 'check-circle' : 'circle'} color={checked ? 'success' : 'body'} className='mr-2 mt-1 flex-shrink-0'/>
      <div className='flex-grow-1'>
        <div className='mb-1'>{name}</div>
        <div className='small text-secondary'>{description}</div>
      </div>
    </div>
  );
};

const view: ComponentView<State, Msg> = ({ state }) => {
  return (
    <div>
      <EditTabHeader
        legalName={state.organization.legalName}
        swuQualified={state.swuQualified} />
      <Row className='mt-5'>
        <Col xs='12'>
          <h3>{ i18next.t('organization.edit.tab.qualification.rows.one.title') }</h3>
          <p className='mb-4'>{ i18next.t('organization.edit.tab.qualification.rows.one.description') }</p>
          <Requirement
            className='mb-4'
            name= { i18next.t('organization.edit.tab.qualification.rows.one.requirements.one.name') }
            description= { i18next.t('organization.edit.tab.qualification.rows.one.requirements.one.description') }
            checked={doesOrganizationMeetSWUQualificationNumTeamMembers(state.organization)} />
          <Requirement
            className='mb-4'
            name= { i18next.t('organization.edit.tab.qualification.rows.one.requirements.two.name') }
            description= { i18next.t('organization.edit.tab.qualification.rows.one.requirements.two.description') }
            checked={!!state.organization.possessAllCapabilities} />
          <Requirement
            name= { i18next.t('organization.edit.tab.qualification.rows.one.requirements.three.name', {swuTermsTitle: SWU_TERMS_TITLE})} //`Agreed to ${SWU_TERMS_TITLE}.`
            description= { i18next.t('organization.edit.tab.qualification.rows.one.requirements.three.description', {swuTermsTitle: SWU_TERMS_TITLE})} //{`You can view the ${SWU_TERMS_TITLE} below.`}
            checked={!!state.organization.acceptedSWUTerms} />
        </Col>
      </Row>
      <div className='mt-5 pt-5 border-top'>
        <Row>
          <Col xs='12'>
            <h3>{ i18next.t('organization.edit.tab.qualification.rows.two.title') }</h3>
            <p className='mb-4'>
              {acceptedSWUTermsText(state.organization, i18next.t('organization.edit.tab.qualification.rows.two.description', {swuTermsTitle: SWU_TERMS_TITLE}))}
            </p>
            <Link
              button
              color='primary'
              dest={routeDest(adt('orgSWUTerms', { orgId: state.organization.id }))}>
              { i18next.t('organization.edit.tab.qualification.rows.two.link') }
            </Link>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export const component: Tab.Component<State, Msg> = {
  init,
  update,
  view
};
