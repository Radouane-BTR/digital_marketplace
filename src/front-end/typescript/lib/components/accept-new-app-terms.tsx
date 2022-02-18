import { APP_TERMS_CONTENT_ID } from 'front-end/config';
import { AsyncWithState, WithState } from 'front-end/lib';
import { Route } from 'front-end/lib/app/types';
import * as FormField from 'front-end/lib/components/form-field';
import * as Checkbox from 'front-end/lib/components/form-field/checkbox';
import { Component, ComponentViewProps, GlobalComponentMsg, Immutable, mapComponentDispatch, PageModal, reload, UpdateReturnValue, View } from 'front-end/lib/framework';
import * as api from 'front-end/lib/http/api';
import Link, { routeDest } from 'front-end/lib/views/link';
import React from 'react';
import { COPY } from 'shared/config';
import { adt, Id } from 'shared/lib/types';
import i18next from 'i18next';
import { Trans } from 'react-i18next';

export type State = Checkbox.State;
export type Msg = Checkbox.Msg;
export type Params = Checkbox.Params;

export const init = Checkbox.init;
export const update = Checkbox.update;

export function setCheckbox(state: Immutable<State>, v: Checkbox.Value): Immutable<State> {
  return FormField.setValue(state, v);
}

export function getCheckbox(state: Immutable<State>): Checkbox.Value {
  return FormField.getValue(state);
}

export interface MakeModalParams<ParentMsg> {
  loading: boolean;
  disabled: boolean;
  state: Immutable<State>;
  onSubmitMsg: ParentMsg;
  onCloseMsg: ParentMsg;
  mapMsg(msg: Msg): ParentMsg;
}
export function makeModal<ParentMsg>(params: MakeModalParams<ParentMsg>): PageModal<ParentMsg> {
  return {
    title: i18next.t('reviewUpdatedTermsConditions'),
    body: dispatch => (
      <View
        disabled={params.loading}
        state={params.state}
        dispatch={mapComponentDispatch(dispatch, params.mapMsg)} />
    ),
    onCloseMsg: params.onCloseMsg,
    actions: [
      {
        text: i18next.t('links.agreeAndContinue'),
        color: 'primary',
        msg: params.onSubmitMsg,
        button: true,
        loading: params.loading,
        disabled: params.disabled
      },
      {
        text: i18next.t('links.cancel'),
        color: 'secondary',
        msg: params.onCloseMsg
      }
    ]
  };
}

export interface SubmitAcceptNewTermsParams<ParentState, ParentInnerMsg> {
  state: Immutable<ParentState>;
  userId: Id;
  startLoading: WithState<ParentState>;
  stopLoading: WithState<ParentState>;
  onSuccess?: AsyncWithState<ParentState>;
}

export function submitAcceptNewTerms<ParentState, ParentInnerMsg>(params: SubmitAcceptNewTermsParams<ParentState, ParentInnerMsg>): UpdateReturnValue<ParentState, GlobalComponentMsg<ParentInnerMsg, Route>> {
  return [
    params.startLoading(params.state),
    async (state, dispatch) => {
      const result = await api.users.update(params.userId, adt('acceptTerms'));
      if (!api.isValid(result)) { return params.stopLoading(state); }
      dispatch(reload());
      return params.onSuccess ? await params.onSuccess(state) : state;
    }
  ];
}

export interface Props extends ComponentViewProps<State, Msg> {
  disabled?: boolean;
}
const View: View<Props> = ({ disabled, state, dispatch }) => {
  const termsRoute = adt('contentView', APP_TERMS_CONTENT_ID) as Route;
  return (
    <div>
      <p>{i18next.t('newAppTermsTextInfo')}&nbsp;<Link newTab dest={routeDest(termsRoute)}>{COPY.appTermsTitle}</Link>.</p>
      <Checkbox.view
        extraChildProps={{
          inlineLabel: (<span> <Trans i18nKey="newAppTermsTextInfoCheck" values={{ appTermsTitle: COPY.appTermsTitle}} components={{ italic: <i /> }}/></span>)
        }}
        disabled={disabled}
        className='font-weight-bold'
        state={state}
        dispatch={dispatch} />
      <p className='mb-0'>{i18next.t('newAppTermsTextInfoCheckText')}</p>
    </div>
  );
};

export const view = View;

export const component: Component<Params, State, Msg> = {
  init,
  update,
  view
};

export default component;
