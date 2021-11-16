import { View } from 'front-end/lib/framework';
import Icon from 'front-end/lib/views/icon';
import Link, { emailDest, iconLinkSymbol, leftPlacement } from 'front-end/lib/views/link';
import React from 'react';
import { CONTACT_EMAIL } from 'shared/config';
import i18next from 'i18next';
export interface Props {
  title: string;
  className?: string;
  disabled?: boolean;
}

const GotQuestions: View<Props> = ({ title, className = '', disabled }) => {
  return (
    <div className='sticky-md'>
      <div className={`rounded bg-c-opportunity-view-got-questions-bg px-4 py-5 position-relative overflow-hidden ${className}`}>
        <Icon
        name='question-circle-outline'
        width={12}
        height={12}
        className='position-absolute'
        style={{ top: '-2rem', right: '-2rem', opacity: '0.12' }}
        color='c-opportunity-view-got-questions-icon' />
        <h5 className='mb-3'>{i18next.t('gotQuestions')}?</h5>
        <p className='mb-4'>{i18next.t('gotQuestionsBody')}</p>
        <Link
          disabled={disabled}
          dest={emailDest([CONTACT_EMAIL, title])}
          symbol_={leftPlacement(iconLinkSymbol('envelope'))}
          color='info'
          size='sm'
          outline
          button>
          {i18next.t('links.contact')}
        </Link>
      </div>
    </div>
  );
};

export default GotQuestions;
