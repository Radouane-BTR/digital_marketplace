import { fileBlobPath } from 'front-end/lib';
import { View } from 'front-end/lib/framework';
import DescriptionList from 'front-end/lib/views/description-list';
import Link, { externalDest, iconLinkSymbol, leftPlacement } from 'front-end/lib/views/link';
import { ProposalMarkdown } from 'front-end/lib/views/markdown';
import React from 'react';
import { Col, Row } from 'reactstrap';
import { formatDateAndTime } from 'shared/lib';
import { CWUProposal, getCWUProponentName, getCWUProponentTypeTitleCase } from 'shared/lib/resources/proposal/code-with-us';
import { User } from 'shared/lib/resources/user';
import i18next from 'i18next';

export interface Props {
  className?: string;
  showOpportunityInformation?: boolean;
  exportedBy?: User;
  exportedAt?: Date;
  proposal: CWUProposal;
}

export const ExportedPropsal: View<Props> = ({ proposal, showOpportunityInformation, exportedBy, exportedAt, className }) => {
  return (
    <div className={className}>
      <Row>
        <Col xs='12'>
          <h3 className='mb-4'>{i18next.t('vendorProposal')}</h3>
          <DescriptionList
            items={[
              { name: i18next.t('id'), children: proposal.id },
              showOpportunityInformation ? { name: i18next.t('opportunity'), children: proposal.opportunity.title } : null,
              showOpportunityInformation ? { name: i18next.t('opportunityType'), children: i18next.t('codeWithUs') } : null,
              { name: i18next.t('proponent'), children: getCWUProponentName(proposal) },
              { name: i18next.t('proponentType'), children: getCWUProponentTypeTitleCase(proposal) },
              { name: i18next.t('vendor'), children: proposal.createdBy.name },
              proposal.score ? { name: 'Score', children: `${proposal.score}%` } : null,
              exportedBy ? { name: i18next.t('exportedBy'), children: exportedBy.name } : null,
              exportedAt ? { name: i18next.t('exportedOn'), children: formatDateAndTime(exportedAt) } : null
            ]}
          />
        </Col>
      </Row>
      <Row className='mt-5'>
        <Col xs='12'>
          <h5 className='mb-4'>{i18next.t('proposal')}:</h5>
          <div><ProposalMarkdown box source={proposal.proposalText} noLinks={false} noImages={false} /></div>
        </Col>
      </Row>
      {proposal.additionalComments
        ? (<Row className='mt-5'>
            <Col xs='12'>
              <h5 className='mb-4'>{i18next.t('additionalComments')}:</h5>
              <div><ProposalMarkdown box source={proposal.additionalComments} noLinks={false} noImages={false} /></div>
            </Col>
          </Row>)
        : null}
        {proposal.attachments.length
          ? (<Row className='mt-5'>
              <Col xs='12'>
                <h5 className='mb-4'>{i18next.t('attachments')}:</h5>
                {proposal.attachments.map((a, i) => (
                  <Link
                    key={`cwu-proposal-export-attachment-${i}`}
                    className={i < proposal.attachments.length - 1 ? 'mb-3' : ''}
                    download
                    symbol_={leftPlacement(iconLinkSymbol('paperclip'))}
                    dest={externalDest(fileBlobPath(a))}>
                    {a.name}
                  </Link>
                ))}
              </Col>
            </Row>)
          : null}
    </div>
  );
};

export default ExportedPropsal;
