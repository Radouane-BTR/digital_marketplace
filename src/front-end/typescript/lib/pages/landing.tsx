import { makePageMetadata, prefixPath } from 'front-end/lib';
import { Route, SharedState } from 'front-end/lib/app/types';
import { ComponentView, GlobalComponentMsg, PageComponent, PageInit, Update, View } from 'front-end/lib/framework';
import * as api from 'front-end/lib/http/api';
import { BulletPoint } from 'front-end/lib/views/bullet-point';
import Link, { iconLinkSymbol, rightPlacement, routeDest } from 'front-end/lib/views/link';
import ProgramCard from 'front-end/lib/views/program-card';
import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import { adt, ADT } from 'shared/lib/types';
import { useTranslation, Trans } from 'react-i18next';
import i18next from 'i18next'; 

const IMG_MAX_WIDTH = '400px';

export interface State {
  totalCount: number;
  totalAwarded: number;
}

type InnerMsg = ADT<'noop'>;

export type Msg = GlobalComponentMsg<InnerMsg, Route>;

export type RouteParams = null;

const init: PageInit<RouteParams, SharedState, State, Msg> = async () => {
  const metricsR = await api.metrics.readMany();
  if (!api.isValid(metricsR)) {
    return {
      totalCount: 0,
      totalAwarded: 0
    };
  }

  return metricsR.value[0];
};

const update: Update<State, Msg> = ({ state, msg }) => {
  return [state];
};

const Hero: ComponentView<State, Msg> = ({state, dispatch}) => {
  const { t } = useTranslation();
  return (
    <Container className='hero-component pb-7 pb-md-8 pt-sm-4 pt-md-3'>
      <Row className='justify-content-left text-left'>
        <Col md='5'>
          <h1 className='roboto' style={{lineHeight: '3.75rem'}}>
            <Trans i18nKey="landing.header" />
          </h1>
          <div className='mt-3 mb-3'>
            <Trans i18nKey="landing.body" />
          </div>
          <Link
            button
            outline
            symbol_={rightPlacement(iconLinkSymbol('arrow-right'))}
            dest={routeDest(adt('contentView', 'about'))}
            color='primary'
            className='mr-3'>
             {t('links.about')}
          </Link>
          <Link
            button
            symbol_={rightPlacement(iconLinkSymbol('arrow-right'))}
            dest={routeDest(adt('opportunities', null))}
            color='primary'>
             {t('links.browse-opportunities')}
          </Link>
        </Col>
        <Col xs='12' sm='10' md='7'>
          <img src={prefixPath('images/illustrations/accueil.svg')} className='w-100' alt='Logo Échanges entre concepteurs' />
        </Col>
      </Row>
    </Container>
  );
};

/*
const Stats: ComponentView<State, Msg> = ({ state }) => {
  return (
    <div className='bg-c-landing-stats-bg py-5'>
      <Container>
        <Row>
          <Col xs='12' className='d-flex flex-column flex-md-row justify-content-center align-items-center'>
            <Stat stat={formatAmount(state.totalCount)} description='Total Opportunities Awarded' className='mr-md-6 mb-5 mb-md-0' />
            <Stat stat={formatAmount(state.totalAwarded, '$')} description='Total Value of All Opportunities' />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const Stat: View<{ stat: string; description: string; className?: string; }> = ({ stat, description, className }) => {
  return (
    <div className={`d-flex flex-column justify-content-center align-items-center text-center ${className}`}>
      <div className='mb-3 text-c-landing-stats-stat'>
        <span className='d-md-none h1'>{stat}</span>
        <span className='d-none d-md-inline display-4 font-weight-bold'>{stat}</span>
      </div>
      <div className='overline text-c-landing-stats-description'>{description}</div>
    </div>
  );
};
*/

const Programs: View = () => {
  const { t } = useTranslation();
  return (
    <div className='py-7'>
      <Container>
        <Row>
          <ProgramCard
            img={prefixPath('/images/illustrations/developpez_avec_nous.svg')}
            title= {t('codeWithUs')}
            className='mb-4 mb-md-0'
            description={
              <div>
                <Trans i18nKey="landing.program-card.develop.description" />
              </div>
            }
            links={[
              {
                button: true,
                dest: routeDest(adt('learnMoreCWU', null)),
                children: [ i18next.t('links.more-info') ],
                color: 'primary',
                outline: true,
                symbol_: rightPlacement(iconLinkSymbol('arrow-right'))
              }
            ]}
          />
          <ProgramCard
            img={prefixPath('/images/illustrations/cocreez_avec_nous.svg')}
            title= {t('sprintWithUs')}
            className='mb-4 mb-md-0'
            description={
              (<div>
                  <Trans i18nKey="landing.program-card.co-create.description" />
              </div>)
            }
            links={[
              {
                button: true,
                dest: routeDest(adt('learnMoreSWU', null)),
                children: [ i18next.t('links.more-info') ],
                color: 'primary',
                outline: true,
                symbol_: rightPlacement(iconLinkSymbol('arrow-right'))
              }
            ]}
          />
        </Row>
      </Container>
    </div>
  );
};

const AppInfo: View = () => {
  return (
    <Container className=''>
      <Row className='justify-content-center text-center'>
        <Col xs='12' md='8'>
          <div className='mb-0 font-size-large'>
            <Trans i18nKey="landing.info" />
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs='12' className='d-flex align-items-center justify-content-center'>
          <div className='px-1 pt-1 mt-4' style={{ width: '5rem' }} />
        </Col>
      </Row>
    </Container>
  );
};

const VendorRoleInfo: View = () => {
  return (
    <Container className='mt-7 mt-md-9'>
      <Row>
        <Col xs='12' className='order-2 order-md-1'>
          <h6 className='text-c-landing-role-heading font-size-large'>
              {i18next.t('landing.vendor-role-info.title')}
          </h6>
        </Col>
        <Col xs='12' md='6' className='order-3 order-md-2'>
          <div className='mb-3 font-size-large font-weight-light'>
              {i18next.t('landing.vendor-role-info.header')}
          </div>
          <BulletPoint
            className='my-4'
            header= {i18next.t('landing.vendor-role-info.role-one.header')}
            subText= {i18next.t('landing.vendor-role-info.role-one.description')} />
          <BulletPoint
            className='my-4'
            header= {i18next.t('landing.vendor-role-info.role-two.header')}
            subText= {i18next.t('landing.vendor-role-info.role-two.description')}/>
          <BulletPoint
            className='my-4'
            header= {i18next.t('landing.vendor-role-info.role-three.header')}
            subText={i18next.t('landing.vendor-role-info.role-three.description')}/>
        </Col>
        <Col xs='12' md='6' className='order-1 order-md-3 mb-5 mb-md-0'>
          <img style={{ maxWidth: IMG_MAX_WIDTH }} className='w-100 mx-auto d-block' src={prefixPath('/images/illustrations/vendeurs.svg')} />
        </Col>
      </Row>
    </Container>
  );
};

const GovRoleInfo: View = () => {
  return (
    <Container className='my-7 my-md-9'>
      <Row>
        <Col xs='12' md='7' className='mb-5 mb-md-0'>
          <img style={{ maxWidth: IMG_MAX_WIDTH }} className='w-100 mx-auto d-block' src={prefixPath('/images/illustrations/employes.svg')} />
        </Col>
        <Col cs='12' md='5'>
          <Row>
            <Col xs='12'>
              <h6 className='text-c-landing-role-heading font-size-large'>
                {i18next.t('landing.gov-role-info.title')}
              </h6>
            </Col>
            <Col xs='12'>
                <div className='mb-3 font-size-large font-weight-light'>
                  {i18next.t('landing.gov-role-info.header')}
                </div>
              <BulletPoint
                className='my-4'
                header= {i18next.t('landing.gov-role-info.role-one.header')}
                subText= {i18next.t('landing.gov-role-info.role-one.description')} />
              <BulletPoint
                className='my-4'
                header= {i18next.t('landing.gov-role-info.role-two.header')}
                subText= {i18next.t('landing.gov-role-info.role-two.description')} />
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
};

const BottomView: View = () => {
  return (
    <Container className='my-7'>
      <Row className='justify-content-center text-center'>
        <Col xs='12' md='8'>
          <div className="font-size-large">
            <Trans i18nKey="landing.bottom-view.description" />
          </div>
        </Col>
      </Row>
      <Row className='mt-5'>
        <Col xs='12' className='d-flex justify-content-center'>
          <Link
            button
            symbol_={rightPlacement(iconLinkSymbol('arrow-right'))}
            dest={routeDest(adt('opportunities', null))}
            color='primary'>
              {i18next.t('links.browse-opportunities')}
          </Link>
        </Col>
      </Row>
    </Container>
  );
};

const view: ComponentView<State, Msg> = props => {
  return (
    <div>
      <Hero {...props} />

      <Programs />
      <AppInfo />
      <GovRoleInfo />
      <VendorRoleInfo />
      <BottomView />
    </div>
  );
};

export const component: PageComponent<RouteParams, SharedState, State, Msg> = {
  fullWidth: true,
  init,
  update,
  view,
  getMetadata() {
    return makePageMetadata(i18next.t('links.home'));
  }
};
