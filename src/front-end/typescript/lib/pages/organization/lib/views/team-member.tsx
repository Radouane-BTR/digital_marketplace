import { PageModal, View } from 'front-end/lib/framework';
import { userAvatarPath } from 'front-end/lib/pages/user/lib';
import Badge from 'front-end/lib/views/badge';
import Capabilities from 'front-end/lib/views/capabilities';
import React from 'react';
import { AffiliationMember } from 'shared/lib/resources/affiliation';
import i18next from 'i18next'

interface MakeViewTeamMemberModalParams<Msg> {
  member: AffiliationMember;
  onCloseMsg: Msg;
}

export function makeViewTeamMemberModal<Msg>(params: MakeViewTeamMemberModalParams<Msg>): PageModal<Msg> {
  const { onCloseMsg, member } = params;
  return {
    title: i18next.t('team-member.title'),
    onCloseMsg,
    body: () => {
      const numCapabilities = member.user.capabilities.length;
      return (
        <div>
          <div className='d-flex flex-nowrap align-items-center'>
            <img
              className='rounded-circle border'
              style={{
                width: '4rem',
                height: '4rem',
                objectFit: 'cover'
              }}
              src={userAvatarPath(member.user)} />
            <div className='ml-3 d-flex flex-column align-items-start'>
              <strong className='mb-1'>{member.user.name}</strong>
              <span className='font-size-small'>{numCapabilities} {numCapabilities === 1 ? i18next.t('team-member.capability') : i18next.t('team-member.capabilities') }</span>
            </div>
          </div>
          {numCapabilities
            ? (<Capabilities
                className='mt-4'
                capabilities={member.user.capabilities.map(capability => ({
                  capability,
                  checked: true
                }))} />)
            : null}
        </div>
      );
    },
    actions: []
  };
}

export const PendingBadge: View<{ className?: string; }> = ({ className }) => (
  <Badge text={i18next.t('team-member.pending')} color='warning' className={className} />
);

export const OwnerBadge: View<{ className?: string; }> = ({ className }) => (
  <Badge text={i18next.t('team-member.owner')} color='success' className={className} />
);
