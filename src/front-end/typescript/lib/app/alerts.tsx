import { APP_TERMS_CONTENT_ID } from 'front-end/config';
import { Msg, State } from 'front-end/lib/app/types';
import { AppGetAlerts, emptyPageAlerts } from 'front-end/lib/framework';
import Link, { routeDest } from 'front-end/lib/views/link';
import React from 'react';
import { COPY } from 'shared/config';
import { adt } from 'shared/lib/types';
import { Trans } from 'react-i18next';
import i18next from 'i18next'

const getAlerts: AppGetAlerts<State, Msg> = ({ state, dispatch }) => {
  const user = state.shared.session?.user;
  if (user && user.lastAcceptedTermsAt && !user.acceptedTermsAt) {
    const reviewLatestVersion = i18next.t("links.reviewLatestVersion") as string;
    const agreeToTheUpdateTerms = i18next.t("links.agreeToTheUpdateTerms") as string;
    return {
      ...emptyPageAlerts(),
      warnings: [{
        text: (
          <div>
            {/* @TODO : must be tested verify*/}
            {/* The <i>{COPY.appTermsTitle}</i> have been updated. Please save what you are working on, <Link newTab dest={routeDest(adt('contentView', APP_TERMS_CONTENT_ID))}>{i18next.t("links.reviewLatestVersion")}</Link> and <Link onClick={() => dispatch(adt('showModal', 'acceptNewTerms' as const))}> {i18next.t("links.agreeToTheUpdateTerms")}</Link>. */}
            <Trans i18nKey="termsTitleUpdated" values={{ appTermsTitle: COPY.appTermsTitle}} components={{ italic: <i /> }}/>&nbsp;
            {i18next.t("emptyPageAlertText")},&nbsp;<Link newTab dest={routeDest(adt('contentView', APP_TERMS_CONTENT_ID))}>{reviewLatestVersion}</Link>&nbsp;{i18next.t("and")}&nbsp;<Link onClick={() => dispatch(adt('showModal', 'acceptNewTerms' as const))}>{agreeToTheUpdateTerms}</Link>.
          </div>
        )
      }]
    };
  } else {
    return emptyPageAlerts();
  }
};

export default getAlerts;
