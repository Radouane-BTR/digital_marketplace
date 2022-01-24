import { makeStartLoading, makeStopLoading } from 'front-end/lib';
import { Route } from 'front-end/lib/app/types';
import * as FormField from 'front-end/lib/components/form-field';
import * as RichMarkdownEditor from 'front-end/lib/components/form-field/rich-markdown-editor';
import { ComponentViewProps, GlobalComponentMsg, immutable, Immutable, Init, mapComponentDispatch, PageGetContextualActions, PageGetModal, toast, Update, updateComponentChild, View } from 'front-end/lib/framework';
import { makeUploadMarkdownImage } from 'front-end/lib/http/api';
import { iconLinkSymbol, leftPlacement } from 'front-end/lib/views/link';
import Markdown from 'front-end/lib/views/markdown';
import React from 'react';
import { formatDateAndTime } from 'shared/lib';
import { Addendum } from 'shared/lib/resources/opportunity/code-with-us';
import { adt, ADT } from 'shared/lib/types';
import * as validation from 'shared/lib/validation';
import { validateAddendumText } from 'shared/lib/validation/addendum';
import Icon from 'front-end/lib/views/icon';
import { CWUOpportunityAddendaStatus } from 'shared/lib/resources/addendum';
import { ThemeColor } from 'front-end/lib/types';
import Badge from 'front-end/lib/views/badge';

const published = {
  success: {
    title: 'Addendum Published',
    body: 'Your addendum has been successfully published.'
  },
  error: {
    title: 'Unable to Publish Addendum',
    body: 'Your addendum could not be published. Please try again later.'
  }
};

const saved = {
  success: {
    title: 'Addendum Saved',
    body: 'Your addendum has been successfully saved.'
  },
  error: {
    title: 'Unable to Save Addendum',
    body: 'Your addendum could not be saved. Please try again later.'
  }
};

const deleted = {
  success: {
    title: 'Addendum Deleted',
    body: 'Your addendum has been successfully deleted.'
  },
  error: {
    title: 'Unable to Delete Addendum',
    body: 'Your addendum could not be deleted. Please try again later.'
  }
};

// const edited = {
//   success: {
//     title: 'Addendum Edited',
//     body: 'Your addendum has been successfully Edited.'
//   },
//   error: {
//     title: 'Unable to Edited Addendum',
//     body: 'Your addendum could not be Edited. Please try again later.'
//   }
// };

interface ExistingAddendum extends Addendum {
  field: Immutable<RichMarkdownEditor.State>;
}

// Either return the updated list of existing addenda, or the list of errors for the new addendum field.
export type PublishNewAddendum = (value: string) => Promise<validation.Validation<Addendum[], string[]>>;
export type SaveNewAddendum = (value: string) => Promise<validation.Validation<Addendum[], string[]>>;
//export type UpdateAddendum = (value: string) => Promise<validation.Validation<Addendum[], string[]>>;
export type DeleteAddendum = (value: string) => Promise<validation.Validation<Addendum[], string[]>>;

type ModalId = 'publish' | 'save' | 'delete' | 'cancel' | 'deleteConfirmation' ;
type AddendumId = string;

export function cwuOpportunityAddendaStatusToColor(s: CWUOpportunityAddendaStatus): ThemeColor {
  switch (s) {
    case CWUOpportunityAddendaStatus.Draft: return 'secondary';
    case CWUOpportunityAddendaStatus.Published: return 'success';
    default: return 'success';
  }
}

export function cwuOpportunityAddendaStatusToTitleCase(s: CWUOpportunityAddendaStatus): string {
  switch (s) {
    case CWUOpportunityAddendaStatus.Draft: return 'Draft';
    case CWUOpportunityAddendaStatus.Published: return 'Published';
    default: return 'Draft';
  }
}

export function isEditable(s: CWUOpportunityAddendaStatus): boolean {
  return ( s != CWUOpportunityAddendaStatus.Published );
}

export interface State {
  isEditing: boolean;
  publishLoading: number;
  showModal: ModalId | null;
  publishNewAddendum: PublishNewAddendum;
  saveNewAddendum: SaveNewAddendum;
  //updateAddendum: UpdateAddendum;
  deleteAddendum: DeleteAddendum;
  newAddendum: Immutable<RichMarkdownEditor.State> | null;
  existingAddenda: ExistingAddendum[];
  editAddendum: Immutable<RichMarkdownEditor.State> | null;
  editedAddendumId?: string;
  deletedAddendumId?: string;
  newTextAddendum: Immutable<RichMarkdownEditor.State> | null;
}

type InnerMsg
  = ADT<'showModal', ModalId>
  | ADT<'hideModal'>
  | ADT<'add'>
  | ADT<'save'>
  | ADT<'edit', AddendumId>
  | ADT<'delete', string>
  | ADT<'deleteConfirmation'>
  | ADT<'cancel'>
  | ADT<'publish'>
  | ADT<'onChangeExisting', [number, RichMarkdownEditor.Msg]>
  | ADT<'onChangeNew', RichMarkdownEditor.Msg>;

export type Msg = GlobalComponentMsg<InnerMsg, Route>;

export interface Params extends Pick<State, 'publishNewAddendum' | 'saveNewAddendum' | 'deleteAddendum' > {
  existingAddenda: Addendum[];
  editedAddendumId?: string;
  deletedAddendumId?: string;
  newAddendum?: {
    errors: string[];
    value: string;
  };
  editAddendum?: {
    errors: string[];
    value: string;
  };
  newTextAddendum?: {
    errors: string[];
    value: string;
  };
}

export function isValid(state: Immutable<State>): boolean {
  return state.newAddendum ? FormField.isValid(state.newAddendum) : true;
}

export function getNewAddendum(state: Immutable<State>): string | null {
  return state.newAddendum ? FormField.getValue(state.newAddendum) : null;
}

export function getNewTextAddendum(state: Immutable<State>): string | null {
  return state.newTextAddendum ? FormField.getValue(state.newTextAddendum) : null;
}

export function getUpdatedAddendum(state: Immutable<State>): string | null {
  return state.editAddendum ? FormField.getValue(state.editAddendum) : null;
}

export function getDeletedAddendum(state: Immutable<State>): string | null | undefined {
  return state.deletedAddendumId
}

async function initAddendumField(id: string, value = '', errors: string[] = []): Promise<Immutable<RichMarkdownEditor.State>> {
  return immutable(await RichMarkdownEditor.init({
    errors,
    validate: validateAddendumText,
    child: {
      uploadImage: makeUploadMarkdownImage(),
      value,
      id
    }
  }));
}

async function initEditedAddendumField(id: string, value = '', errors: string[] = []): Promise<Immutable<RichMarkdownEditor.State>> {
  return immutable(await RichMarkdownEditor.init({
    errors,
    validate: validateAddendumText,
    child: {
      uploadImage: makeUploadMarkdownImage(),
      value,
      id
    }
  }));
}

export const init: Init<Params, State> = async params => {
  // Existing Addenda
  const existingAddenda: ExistingAddendum[] = [];
  let i = 0;
  for (const addendum of params.existingAddenda) {
    existingAddenda.push({
      ...addendum,
      field: await initAddendumField(`existing-addendum-${i}`, addendum.description)
    });
    i++;
  }
  
return {
    publishNewAddendum: params.publishNewAddendum,
    saveNewAddendum: params.saveNewAddendum,
    deleteAddendum: params.deleteAddendum,
    editedAddendumId: params.editedAddendumId,
    deletedAddendumId: params.deletedAddendumId,
    isEditing: false,
    publishLoading: 0,
    editAddendum: null,
    showModal: null,
    existingAddenda, //existingAddenda sorted in the http/api module.
    newAddendum:
      params.newAddendum
        ? await initAddendumField('new-addendum', params.newAddendum.value, params.newAddendum.errors)
        : null,
    newTextAddendum: 
      params.newTextAddendum
        ? await initAddendumField('new-addendum', params.newTextAddendum.value, params.newTextAddendum.errors)
        : null
  };
};

const startPublishLoading = makeStartLoading<State>('publishLoading');
const stopPublishLoading = makeStopLoading<State>('publishLoading');

export const update: Update<State, Msg> = ({ state, msg }) => {
  switch (msg.tag) {
    case 'showModal':
      return [state.set('showModal', msg.value)];
    case 'hideModal':
      return [state.set('showModal', null)];
    case 'add':
      return [
        state,
        async state => {
          // Adding addenda asynchronously means that validation is momentarily
          // quirky when adding a new addendum.
          return state
            .set('newAddendum', await initAddendumField('new-addendum'))
            .set('isEditing', true);
        }
      ];
    case 'edit':
      return [
        state,
        async state => {
          return state
          .set('editedAddendumId', msg.value)
          .set('newTextAddendum', await initAddendumField('new-addendum'))
          .set('editAddendum', await initEditedAddendumField('edited-addedum-id', msg.value))
          .set('isEditing', true)
        }
      ];
    case 'cancel':
      return [
        state
          .set('showModal', null)
          .set('isEditing', false)
          .set('newAddendum', null)
          .set('editedAddendumId', undefined)
      ];
    case 'delete':
      return [
        state,
        async (state) => {
          return state.set('deletedAddendumId', msg.value)
                      .set('showModal', 'deleteConfirmation')
        }
      ];
    case 'deleteConfirmation':
      return [
        state,
        async (state, dispatch) => {
          const deletedAddendum = await getDeletedAddendum(state);
          const result = await state.deleteAddendum(deletedAddendum as string)
          console.log('deleteConfirmation resultat : ' ,result);
          if (validation.isValid(result)) {
            dispatch(toast(adt('success', deleted.success)));
            return immutable(await init({
              publishNewAddendum: state.publishNewAddendum,
              saveNewAddendum: state.publishNewAddendum,
              deleteAddendum: state.deleteAddendum,
              existingAddenda: result.value as Addendum[]
            }));
          } else {
            return dispatch(toast(adt('error', deleted.error)));
          }
        }
      ];
    case 'save':
      return [
        startPublishLoading(state).set('showModal', null),
        async (state, dispatch) => {
          state = stopPublishLoading(state);
          const newAddendum = getNewAddendum(state) as any;
          const updatedAddedum = getUpdatedAddendum(state) as any;
          const newtext = getNewTextAddendum(state) as any;
          console.log({ state, newAddendum, edited: state.editAddendum, editedValue: state.editAddendum ? FormField.getValue(state.editAddendum) : null })
          if (updatedAddedum) {
            console.log('im not a new addendum : ', updatedAddedum);
            console.log('and my text is : ', newtext);
            const result = await state.saveNewAddendum(updatedAddedum);
            if (validation.isValid(result)) {
              dispatch(toast(adt('success', saved.success)));
              return immutable(await init({
                publishNewAddendum: state.publishNewAddendum,
                saveNewAddendum: state.saveNewAddendum,
                deleteAddendum: state.deleteAddendum,
                existingAddenda: result.value as Addendum[]
              }));
            } else {
              state.set('editedAddendumId', undefined); 
              dispatch(toast(adt('error', saved.error)));
              return state.update('newAddendum', s => s ? FormField.setErrors(s, result.value) : s);
            }
          }
          console.log('text new addenda is ', newAddendum);
          const result = await state.saveNewAddendum(newAddendum);
          if (validation.isValid(result)) {
            dispatch(toast(adt('success', saved.success)));
            return immutable(await init({
              publishNewAddendum: state.publishNewAddendum,
              saveNewAddendum: state.saveNewAddendum,
              deleteAddendum: state.deleteAddendum,
              existingAddenda: result.value as Addendum[]
            }));
          } else {
            dispatch(toast(adt('error', saved.error)));
            return state.update('newAddendum', s => s ? FormField.setErrors(s, result.value) : s);
          }
        }
      ];
    case 'publish':
      return [
        startPublishLoading(state).set('showModal', null),
        async (state, dispatch) => {
          state = stopPublishLoading(state);
          const newAddendum = getNewAddendum(state);
          if (!newAddendum) { return state; }
          const result = await state.publishNewAddendum(newAddendum);
          if (validation.isValid(result)) {
            dispatch(toast(adt('success', published.success)));
            return immutable(await init({
              publishNewAddendum: state.publishNewAddendum,
              saveNewAddendum: state.publishNewAddendum,
              deleteAddendum: state.deleteAddendum,
              existingAddenda: result.value as Addendum[]
            }));
          } else {
            dispatch(toast(adt('error', published.error)));
            return state.update('newAddendum', s => s ? FormField.setErrors(s, result.value) : s);
          }
        }
      ];
    case 'onChangeExisting':
      return updateComponentChild({
        state,
        childStatePath: ['existingAddenda', String(msg.value[0]), 'field'],
        childUpdate: RichMarkdownEditor.update,
        childMsg: msg.value[1],
        mapChildMsg: value => adt('onChangeExisting', [msg.value[0], value]) as Msg
      });
    case 'onChangeNew':
      return updateComponentChild({
        state,
        childStatePath: ['newAddendum'],
        childUpdate: RichMarkdownEditor.update,
        childMsg: msg.value,
        mapChildMsg: value => adt('onChangeNew', value) as Msg
      });
    default:
      return [state];
  }
};

export const AddendaList: View<{ addenda: Addendum[]; }> = ({ addenda }) => {
  return (
    <div>
      {addenda.map((a, i) => (
        isEditable(a.status) ? '' : 
        <div key={`addenda-list-${i}`} className={`border rounded overflow-hidden ${i < addenda.length - 1 ? 'mb-4' : ''}`}>
          <Markdown source={a.description} className='p-3' smallerHeadings openLinksInNewTabs />
          <div className='bg-light text-secondary p-3 border-top'>Posted on {formatDateAndTime(a.createdAt, true)}{a.createdBy ? ` by ${a.createdBy.name}` : ''}</div>
        </div> 
      ))}
    </div>
  );
};

export interface Props extends ComponentViewProps<State, Msg> {
  className?: string;
}

export const view: View<Props> = props => {
  const { className, state, dispatch } = props;
  const isPublishLoading = state.publishLoading > 0;
  const isDisabled = isPublishLoading;
  const AddendumId = state.get('editedAddendumId');
  const style = {
    height: '300px'
  };
  return (
    <div className={className}>
      {state.newAddendum
        ? (<RichMarkdownEditor.view
            extraChildProps={{}}
            disabled={isDisabled}
            style={style}
            label='New Addendum'
            help='Provide additional information that was not provided on the original posting of the opportunity.'
            required
            state={state.newAddendum}
            dispatch={mapComponentDispatch(dispatch, msg => adt('onChangeNew', msg) as Msg)} />)
        : null}
      {state.existingAddenda.map((addendum, i) => (
        <RichMarkdownEditor.view
          key={`existing-addendum-${i}`}
          extraChildProps={{}}
          disabled = {AddendumId != addendum.id}
          style={style}
          label='Existing Addendum'
          hint={`Created ${formatDateAndTime(addendum.createdAt)}`}
          state={addendum.field}
          componentBefore={
          <div className='mb-2'>
            <Badge className='mx-2 ml-auto' text={cwuOpportunityAddendaStatusToTitleCase(addendum.status)} color={cwuOpportunityAddendaStatusToColor(addendum.status)} />
            <span className='mx-2'>
                <Icon hover className='ml-auto' name='edit' color='secondary' onClick={() => {console.log('addendum de i', addendum) ; return dispatch(adt('edit', addendum.id))}} />
                <strong >Edit</strong>
            </span>
            { isEditable(addendum.status) ? ( <span className='mx-2'>
                <Icon hover className='ml-auto' name='trash' color='secondary' onClick={() =>dispatch(adt('delete', addendum.id))} />
                {/* <Icon hover className='ml-auto' name='trash' color='secondary'  onClick={() => { dispatch(adt('deleteAddendum', addendum.id)) }} /> */}
                <strong >Delete</strong>
            </span> ) : ''
            }
            
          </div>}
          dispatch={mapComponentDispatch(dispatch, msg => adt('onChangeExisting', [i, msg]) as Msg)} />
      ))}
    </div>);
};

export const getContextualActions: PageGetContextualActions<State, Msg> = ({ state, dispatch }) => {
  if (state.isEditing) {
    const isPublishLoading = state.publishLoading > 0;
    const isSaveDraftLoading = state.publishLoading > 0; // TODO : Enlever le mock avec un frais attribut 
    // const isLoading = isPublishLoading || isSaveDraftLoading;
    return adt('links', [
      {
        children: 'Publish Addendum',
        onClick: () => dispatch(adt('showModal', 'publish' as const)),
        button: true,
        disabled: isPublishLoading || !isValid(state),
        loading: isPublishLoading,
        symbol_: leftPlacement(iconLinkSymbol('bullhorn')),
        color: 'primary'
      },
      {
        children: 'Save Draft',
        onClick: () => dispatch(adt('showModal', 'save' as const)),
        button: true,
        disabled: isPublishLoading || !isValid(state),
        loading: isSaveDraftLoading,
        symbol_: leftPlacement(iconLinkSymbol('save')),
        color: 'success'
      },
      {
        children: 'Cancel',
        disabled: isPublishLoading,
        onClick: () => dispatch(adt('showModal', 'cancel' as const))
      }
    ]);
  } else {
    return adt('links', [
      {
        children: 'Add Addendum',
        onClick: () => dispatch(adt('add')),
        button: true,
        symbol_: leftPlacement(iconLinkSymbol('file-plus')),
        color: 'primary'
      }
    ]);
  }
};

export const getModal: PageGetModal<State, Msg> = state => {
  switch (state.showModal) {
    case 'publish':
      return {
        title: 'Publish Addendum?',
        onCloseMsg: adt('hideModal'),
        actions: [
          {
            text: 'Publish Addendum',
            icon: 'bullhorn',
            color: 'primary',
            button: true,
            msg: adt('publish')
          },
          {
            text: 'Cancel',
            color: 'secondary',
            msg: adt('hideModal')
          }
        ],
        body: () => 'Are you sure you want to publish this addendum? Once published, all subscribers will be notified.'
      };
    case 'save':
      return {
        title: 'Save Addendum?',
        onCloseMsg: adt('hideModal'),
        actions: [
          {
            text: 'Save Addendum',
            icon: 'save',
            color: 'primary',
            button: true,
            msg: adt('save')
          },
          {
            text: 'Cancel',
            color: 'secondary',
            msg: adt('hideModal')
          }
        ],
        body: () => 'Are you sure you want to save this addendum?'
      };
    case 'deleteConfirmation':
        return {
          title: 'Delete Addendum?',
          onCloseMsg: adt('hideModal'),
          actions: [
            {
              text: 'Delete Addendum',
              color: 'danger',
              icon: 'trash',
              button: true,
              msg: adt('deleteConfirmation')
            },
            {
              text: 'Cancel',
              color: 'secondary',
              msg: adt('hideModal')
            }
          ],
          body: () => 'Are you sure you want to delete this addendum?'
        };
    case 'cancel':
      return {
        title: 'Cancel Adding an Addendum?',
        onCloseMsg: adt('hideModal'),
        actions: [
          {
            text: 'Yes, I want to cancel',
            color: 'danger',
            button: true,
            msg: adt('cancel')
          },
          {
            text: 'Go Back',
            color: 'secondary',
            msg: adt('hideModal')
          }
        ],
        body: () => 'Are you sure you want to cancel? Any information you may have entered will be lost if you do so.'
      };
    default:
        return null;
  }
};
