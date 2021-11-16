import { makePageMetadata } from 'front-end/lib';
import { Route, SharedState } from 'front-end/lib/app/types';
import { ComponentView, GlobalComponentMsg, PageComponent, PageInit, Update } from 'front-end/lib/framework';
import Link, { routeDest } from 'front-end/lib/views/link';
import React from 'react';
import { Col, Row } from 'reactstrap';
import { adt, ADT } from 'shared/lib/types';
import i18next from 'i18next';
export interface RouteParams {
  path?: string;
}

export type State = RouteParams;

export type Msg = GlobalComponentMsg<ADT<'noop'>, Route>;

const init: PageInit<RouteParams, SharedState, State, Msg> = async ({ routeParams }) => {
  return routeParams;
};

const update: Update<State, Msg> = ({ state, msg }) => {
  return [state];
};

const view: ComponentView<State, Msg> = () => {
  return (
    <div>
      <Row className='mb-3'>
        <Col xs='12'>
          <h1>{i18next.t('notFound')}</h1>
        </Col>
      </Row>
      <Row className='mb-3 pb-3'>
        <Col xs='12'>
          <p>{i18next.t('notFoundBody')}</p>
        </Col>
      </Row>
      <Row>
        <Col xs='12'>
          <Link dest={routeDest(adt('landing', null))} button color='primary'>{i18next.t('links.home')}</Link>
        </Col>
      </Row>
    </div>
  );
};

export const component: PageComponent<RouteParams, SharedState, State, Msg> = {
  init,
  update,
  view,
  getMetadata() {
    return makePageMetadata(i18next.t('notFound'));
  }
};
