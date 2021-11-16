import { CWU_PAYMENT_OPTIONS_URL } from 'front-end/config';
import { makePageMetadata, prefixPath } from 'front-end/lib';
import { Route, SharedState } from 'front-end/lib/app/types';
import { ComponentView, GlobalComponentMsg, PageComponent, PageInit, Update, View } from 'front-end/lib/framework';
import Accordion from 'front-end/lib/views/accordion';
import HowItWorksItem from 'front-end/lib/views/how-it-works-item';
import Link, { iconLinkSymbol, leftPlacement, routeDest } from 'front-end/lib/views/link';
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { COPY } from 'shared/config';
import { ADT, adt } from 'shared/lib/types';
import i18next from 'i18next';
import { Trans } from 'react-i18next';

export interface State {
  isVendorAccordionOpen: boolean;
  isPublicSectorAccordionOpen: boolean;
}

type InnerMsg
  = ADT<'noop'>
  | ADT<'toggleVendorAccordion'>
  | ADT<'togglePublicSectorAccordion'>;

export type Msg = GlobalComponentMsg<InnerMsg, Route>;

export type RouteParams = null;

const init: PageInit<RouteParams, SharedState, State, Msg> = async () => ({
  isVendorAccordionOpen: true,
  isPublicSectorAccordionOpen: false
});

const update: Update<State, Msg> = ({ state, msg }) => {
  switch (msg.tag) {
    case 'toggleVendorAccordion':
      return [state.update('isVendorAccordionOpen', v => !v)];
    case 'togglePublicSectorAccordion':
      return [state.update('isPublicSectorAccordionOpen', v => !v)];
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
            <h1 className='mb-4'>{i18next.t('codeWithUs')}</h1>
          </Col>
        </Row>
        <Row>
          <Col xs='12' md='8'>
            <p className='mb-0'><em>{i18next.t('codeWithUs')}</em> {i18next.t('codeWithUsDescription', {regionNameLong: COPY.region.name.long})}</p>
          </Col>
          <Col md='4'>
            <img style={{ maxWidth: '250px' }} className='d-none d-md-block position-absolute ml-6' src={prefixPath('/images/illustrations/code_with_us_learn_more.svg')} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const VendorView: ComponentView<State, Msg> = ({ state, dispatch }) => {
  return (
    <div className='bg-white pt-6'>
      <Container>
        <Row>
          <Col xs='12' md='8'>
            <Accordion
              toggle={() => dispatch(adt('toggleVendorAccordion'))}
              color='info'
              title={i18next.t('vendors')}
              titleClassName='h2 mb-0 ml-2'
              icon='store'
              iconColor='info'
              iconWidth={2.5}
              iconHeight={2.5}
              chevronWidth={2}
              chevronHeight={2}
              open={state.isVendorAccordionOpen}>
                <div className='mb-3'>{i18next.t('vendorsDescriptionP1')}</div>
                <div className='mb-5'><em>{i18next.t('codeWithUs')}</em> {i18next.t('vendorsDescriptionP2')}</div>
                <VendorHIW />
                <div className='d-flex flex-column flex-sm-row mt-5 flex-nowrap align-items-start align-items-sm-center'>
                  <Link
                    button
                    dest={routeDest(adt('contentView', 'code-with-us-proposal-guide'))}
                    color='info'
                    outline
                    symbol_={leftPlacement(iconLinkSymbol('book-user'))}
                    className='mb-4 mb-sm-0 mr-0 mr-sm-4 text-nowrap'
                  >
                    {i18next.t('links.readguide')}
                  </Link>
                  <Link
                    button
                    dest={routeDest(adt('opportunities', null))}
                    color='primary'
                    symbol_={leftPlacement(iconLinkSymbol('search'))}
                    className='text-nowrap'
                  >
                    {i18next.t('links.browse-opportunities')}
                  </Link>
                </div>
            </Accordion>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const VendorHIW: View = () => {
  return (
    <div>
      <h3 className='mb-4'>{i18next.t('howItWorks')}</h3>
      <HowItWorksItem
        symbol_={adt('icon', 'search' as const)}
        title={i18next.t('search')}
        description={i18next.t('searchDescription')}
        className='mb-4'
      />
      <HowItWorksItem
        symbol_={adt('icon', 'comments-alt' as const)}
        title={i18next.t('connect')}
        description={i18next.t('connectDescription')}
        className='mb-4'
      />
      <HowItWorksItem
        symbol_={adt('icon', 'paper-plane' as const)}
        title={i18next.t('apply')}
        description={i18next.t('applyDescription')}
        className='mb-4'
      />
      <HowItWorksItem
        symbol_={adt('icon', 'code' as const)}
        title={i18next.t('contribute')}
        description={i18next.t('contributeDescription')}
        className='mb-4'
      />
      <HowItWorksItem
        symbol_={adt('icon', 'sack-dollar' as const)}
        title={i18next.t('getPaid')}
        description={(<p>{i18next.t('getPaidDescription')} <Link dest={adt('external', CWU_PAYMENT_OPTIONS_URL)}>{i18next.t('links.here')}</Link>.</p>)}
        className='mb-4'
      />
    </div>
  );
};

const PublicSectorView: ComponentView<State, Msg> = ({ state, dispatch }) => {
  return (
    <div className='bg-white pt-5 pb-6'>
      <Container>
        <Row>
          <Col xs='12' md='8'>
            <Accordion
              toggle={() => dispatch(adt('togglePublicSectorAccordion'))}
              color='info'
              title={i18next.t('publicSector')}
              titleClassName='h2 mb-0 ml-2'
              icon='government'
              iconColor='info'
              iconWidth={2.5}
              iconHeight={2.5}
              chevronWidth={2}
              chevronHeight={2}
              open={state.isPublicSectorAccordionOpen}>
                <div className='mb-3'><Trans i18nKey="publicSectorDescriptionP1" values={{ appTermsTitle: COPY.region.name.long}} components={{ emphasis: <em /> }}/></div>
                <div className='mb-5'>{i18next.t('publicSectorDescriptionP2')}</div>
                <div className='d-flex flex-row mt-5 flex-nowrap'>
                  <Link
                    button
                    dest={routeDest(adt('contentView', 'code-with-us-opportunity-guide'))}
                    color='info'
                    outline
                    symbol_={leftPlacement(iconLinkSymbol('book-user'))}
                    className='mr-3 text-nowrap'
                  >
                    {i18next.t('links.readguide')}
                  </Link>
                </div>
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
      <VendorView state={state} dispatch={dispatch} />
      <PublicSectorView state={state} dispatch={dispatch} />
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
    return makePageMetadata(`${i18next.t('codeWithUs')} - ${i18next.t('links.learnMore')}`);
  }
};
