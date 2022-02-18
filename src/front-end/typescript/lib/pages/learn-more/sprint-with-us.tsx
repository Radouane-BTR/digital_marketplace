import { makePageMetadata, prefixPath } from 'front-end/lib';
import { Route, SharedState } from 'front-end/lib/app/types';
import { ComponentView, GlobalComponentMsg, PageComponent, PageInit, Update, View } from 'front-end/lib/framework';
import Accordion from 'front-end/lib/views/accordion';
import HowItWorksItem from 'front-end/lib/views/how-it-works-item';
import Link, { routeDest } from 'front-end/lib/views/link';
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { COPY, VENDOR_IDP_NAME } from 'shared/config';
import { ADT, adt } from 'shared/lib/types';
import i18next from 'i18next';
import { Trans } from 'react-i18next';
export interface State {
  isWhatToExpectAccordionOpen: boolean;
  isHowToApplyAccordionOpen: boolean;
}

type InnerMsg
  = ADT<'noop'>
  | ADT<'toggleWhatToExpectAccordion'>
  | ADT<'toggleHowToApplyAccordion'>;

export type Msg = GlobalComponentMsg<InnerMsg, Route>;

export type RouteParams = null;

const init: PageInit<RouteParams, SharedState, State, Msg> = async () => ({
  isWhatToExpectAccordionOpen: true,
  isHowToApplyAccordionOpen: true
});

const update: Update<State, Msg> = ({ state, msg }) => {
  switch (msg.tag) {
    case 'toggleWhatToExpectAccordion':
      return [state.update('isWhatToExpectAccordionOpen', v => !v)];
    case 'toggleHowToApplyAccordion':
      return [state.update('isHowToApplyAccordionOpen', v => !v)];
    default:
      return [state];
  }
};

const TitleView: View = () => {
  return (
    <div className='bg-c-learn-more-bg pt-4 pb-6 pb-md-7'>
      <Container>
        <Row>
          <Col xs='12'>
            <h1 className='mb-4'>{i18next.t('sprintWithUs')}</h1>
          </Col>
        </Row>
        <Row>
          <Col xs='12' md='8'>
            <p className='mb-0'><em>{i18next.t('sprintWithUs')}</em> {i18next.t('sprintWithUsDescription', {regionNameLong: COPY.region.name.long})}</p>
          </Col>
          <Col md='4'>
            <img style={{ maxWidth: '213px' }} className='d-none d-md-block position-absolute mt-n5 ml-6' src={prefixPath('/images/illustrations/sprint_with_us_learn_more.svg')} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const WhatToExpectView: ComponentView<State, Msg> = ({ state, dispatch }) => {
  return (
    <div className='pt-6 bg-white'>
      <Container>
        <Row>
          <Col xs='12' md='8'>
            <Accordion
              toggle={() => dispatch(adt('toggleWhatToExpectAccordion'))}
              color='info'
              title={i18next.t('whatToExpect')}
              titleClassName='h2 mb-0'
              chevronWidth={2}
              chevronHeight={2}
              open={state.isWhatToExpectAccordionOpen}>
                <p className='mb-5'>{i18next.t('whatToExpectDescription')}</p>
                <Row>
                  <Col xs='12' md='6'>
                    <InfoBlockView
                      className='mb-4'
                      title={i18next.t('governmentProductManagers')}
                      description={i18next.t('governmentProductManagersDescription')}
                    />
                    <InfoBlockView
                      className='mb-4'
                      title={i18next.t('interdisciplinaryTeams')}
                      description={i18next.t('interdisciplinaryTeamsDescription')}
                    />
                    <InfoBlockView
                      className='mb-4 mb-md-0'
                      title={i18next.t('openSource')}
                      description={i18next.t('openSourceDescription')}
                    />
                  </Col>
                  <Col xs='12' md='6'>
                    <InfoBlockView
                      className='mb-4'
                      title={i18next.t('agile')}
                      description={i18next.t('agileDescription')}
                    />
                    <InfoBlockView
                      className='mb-4'
                      title={i18next.t('agilePhases')}
                      description={i18next.t('agilePhasesDescription')}
                    />
                    <InfoBlockView
                      title={i18next.t('pricingIncentives')}
                      description={i18next.t('pricingIncentivesDescription')}
                    />
                  </Col>
                </Row>
            </Accordion>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

interface InfoBlockProps {
  title: string;
  description: string;
  className?: string;
}

const InfoBlockView: View<InfoBlockProps> = ({ title, description, className }) => {
  return (
    <div className={className}>
      <div className='d-flex flex-column align-items-center border bg-white rounded-lg py-4 py-md-5 px-4 text-center h-100'>
        <h4 className='my-3'>{title}</h4>
        <div className='mb-2'>{description}</div>
      </div>
    </div>
  );
};

export const HowToApplyView: ComponentView<State, Msg> = ({ state, dispatch }) => {
  return (
    <div className='pt-5 pb-6 bg-white'>
      <Container>
        <Row>
          <Col xs='12' md='8'>
            <Accordion
              toggle={() => dispatch(adt('toggleHowToApplyAccordion'))}
              color='info'
              title={i18next.t('howToApply')}
              titleClassName='h2 mb-0'
              chevronWidth={2}
              chevronHeight={2}
              open={state.isHowToApplyAccordionOpen}>
                <p className='mb-4'><Trans i18nKey="sprintWithUsHowToApplyViewBody" components={{ emphasis: <em /> }}/></p>
                <HowItWorksItem
                  symbol_={adt('text', '1')}
                  mobileSymbol={adt('text', '1.')}
                  title={i18next.t('signInVendorAccount')}
                  description={(
                    <div><Link dest={routeDest(adt('signIn', {}))}>{i18next.t('links.sign-in')}</Link> {i18next.t('signInVendorAccountDescription',{idpName: VENDOR_IDP_NAME})} <Link dest={routeDest(adt('signUpStepOne', {}))}>{i18next.t('links.sign-up')}</Link>, {i18next.t('first')}.</div>)}
                  className='mb-4'
                />
                <HowItWorksItem
                  symbol_={adt('text', '2')}
                  mobileSymbol={adt('text', '2.')}
                  title={i18next.t('registerYourOrganization')}
                  description={(
                    <div>
                      <p><Trans i18nKey="registerYourOrganizationDescriptionP1" components={{ emphasis: <em />, bold : <strong /> }}/></p>
                      <p className='mb-0'>{i18next.t('registerYourOrganizationDescriptionP2')}</p>
                    </div>
                  )}
                  className='mb-4'
                />
                <HowItWorksItem
                  symbol_={adt('text', '3')}
                  mobileSymbol={adt('text', '3.')}
                  title='Become a Qualified Supplier'
                  description={(
                    <div>
                      <p><Trans i18nKey="becomeQualifiedSupplierDescriptionP1" components={{ emphasis: <em /> }}/></p>
                      <p className='mb-0'><Trans i18nKey="becomeQualifiedSupplierDescriptionP2" components={{ emphasis: <em /> }}/></p>
                    </div>
                  )}
                />
            </Accordion>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const view: ComponentView<State, Msg> = ({ state, dispatch }) => {
  return (
    <div className='d-flex flex-column flex-grow-1'>
      <TitleView />
      <WhatToExpectView state={state} dispatch={dispatch} />
      <HowToApplyView state={state} dispatch={dispatch} />
      <div className='flex-grow-1 bg-white'></div>
    </div>
  );
};

export const component: PageComponent<RouteParams, SharedState, State, Msg> = {
  fullWidth: true,
  backgroundColor: 'c-learn-more-bg',
  init,
  update,
  view,
  getMetadata() {
    return makePageMetadata(`${i18next.t('sprintWithUs')} - ${i18next.t('links.learnMore')}`);
  }
};
