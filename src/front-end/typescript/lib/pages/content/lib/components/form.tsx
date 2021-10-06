import * as FormField from 'front-end/lib/components/form-field';
import * as RichMarkdownEditor from 'front-end/lib/components/form-field/rich-markdown-editor';
import * as ShortText from 'front-end/lib/components/form-field/short-text';
import { ComponentViewProps, Immutable, immutable, Init, mapComponentDispatch, Update, updateComponentChild, View } from 'front-end/lib/framework';
import * as api from 'front-end/lib/http/api';
import { slugPath } from 'front-end/lib/pages/content/lib';
import React from 'react';
import { Col, Row } from 'reactstrap';
import { Content, CreateRequestBody, CreateValidationErrors } from 'shared/lib/resources/content';
import { adt, ADT } from 'shared/lib/types';
import * as contentValidation from 'shared/lib/validation/content';
import i18next from 'i18next';
export interface State {
  content: Content | null;
  title: Immutable<ShortText.State>;
  slug: Immutable<ShortText.State>;
  body: Immutable<RichMarkdownEditor.State>;
}

export type Msg
  = ADT<'title', ShortText.Msg>
  | ADT<'slug', ShortText.Msg>
  | ADT<'body', RichMarkdownEditor.Msg>;

export interface Params {
  content?: Content;
}

export function isValid(state: Immutable<State>): boolean {
  return FormField.isValid(state.title) && FormField.isValid(state.slug) && FormField.isValid(state.body);
}

export type Values = CreateRequestBody;

export function getValues(state: Immutable<State>): Values {
  return {
    title: FormField.getValue(state.title),
    slug: FormField.getValue(state.slug),
    body: FormField.getValue(state.body)
  };
}

export type Errors = CreateValidationErrors;

export function setErrors(state: Immutable<State>, errors: Errors): Immutable<State> {
  return state
    .update('title', s => FormField.setErrors(s, errors.title || []))
    .update('slug', s => FormField.setErrors(s, errors.slug || []))
    .update('body', s => FormField.setErrors(s, errors.body || []));
}

export const init: Init<Params, State> = async ({ content = null }) => {
  return {
    content,
    title: immutable(await ShortText.init({
      errors: [],
      validate: contentValidation.validateTitle,
      child: {
        type: 'text',
        value: content?.title || '',
        id: 'content-title'
      }
    })),
    slug: immutable(await ShortText.init({
      errors: [],
      validate: contentValidation.validateSlug,
      child: {
        type: 'text',
        value: content?.slug || '',
        id: 'content-slug'
      }
    })),
    body: immutable(await RichMarkdownEditor.init({
      errors: [],
      validate: contentValidation.validateBody,
      child: {
        value: content?.body || '',
        id: 'content-body',
        uploadImage: api.makeUploadMarkdownImage()
      }
    }))
  };
};

export const update: Update<State, Msg> = ({ state, msg }) => {
  switch (msg.tag) {
    case 'title':
      return updateComponentChild({
        state,
        childStatePath: ['title'],
        childUpdate: ShortText.update,
        childMsg: msg.value,
        mapChildMsg: (value) => adt('title', value)
      });
    case 'slug':
      return updateComponentChild({
        state,
        childStatePath: ['slug'],
        childUpdate: ShortText.update,
        childMsg: msg.value,
        mapChildMsg: (value) => adt('slug', value)
      });
    case 'body':
      return updateComponentChild({
        state,
        childStatePath: ['body'],
        childUpdate: RichMarkdownEditor.update,
        childMsg: msg.value,
        mapChildMsg: (value) => adt('body', value)
      });
  }
};

export interface Props extends ComponentViewProps<State, Msg> {
  disabled?: boolean;
}

export const view: View<Props> = ({ state, dispatch, disabled }) => {
  const slug = FormField.getValue(state.slug);
  return (
    <div>
      <Row>
        <Col xs='12' md='9' lg='8'>
          <ShortText.view
            extraChildProps={{}}
            label={i18next.t('title')}
            placeholder={i18next.t('title')}
            required
            disabled={disabled}
            state={state.title}
            dispatch={mapComponentDispatch(dispatch, value => adt('title' as const, value))} />
        </Col>
      </Row>
      <Row> 
        <Col xs='12' md='9' lg='8'>
          <ShortText.view
            extraChildProps={{}}
            label={i18next.t('content-form.slugLabel')}
            placeholder={i18next.t('content-form.slugPlaceHolder')}
            help={i18next.t('content-form.slugHelp')}
            hint={slug ? (<span>{ state.content?.slug !== slug ? i18next.t('content-form.HasNotSlugHint') : i18next.t('content-form.HasSlugHint') } <b>{slugPath(slug)}</b>.</span>) : undefined}
            required={!state.content?.fixed}
            disabled={disabled || !!state.content?.fixed}
            state={state.slug}
            dispatch={mapComponentDispatch(dispatch, value => adt('slug' as const, value))} />
        </Col>
      </Row>
      <Row>
        <Col xs='12' md='9' lg='8'>
          <RichMarkdownEditor.view
            label={i18next.t('body')}
            placeholder={i18next.t('content-form.bodyPlaceHolder')}
            help={i18next.t('content-form.bodyHelp')}
            extraChildProps={{
              style: { height: '60vh', minHeight: '400px' }
            }}
            required
            disabled={disabled}
            state={state.body}
            dispatch={mapComponentDispatch(dispatch, value => adt('body' as const, value))} />
        </Col>
      </Row>
    </div>
  );
};
