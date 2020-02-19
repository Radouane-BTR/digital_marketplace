import { Route } from 'front-end/lib/app/types';
import * as Table from 'front-end/lib/components/table';
import { Dispatch, View } from 'front-end/lib/framework';
import { ComponentView, GlobalComponentMsg,  Immutable, immutable, Init, mapComponentDispatch, Update, updateComponentChild } from 'front-end/lib/framework';
import * as api from 'front-end/lib/http/api';
import * as Tab from 'front-end/lib/pages/opportunity/code-with-us/edit/tab';
import { cwuProposalStatusToColor, cwuProposalStatusToTitleCase } from 'front-end/lib/pages/opportunity/code-with-us/lib';
import EditTabHeader from 'front-end/lib/pages/opportunity/code-with-us/lib/views/edit-tab-header';
import Badge from 'front-end/lib/views/badge';
import ReportCardList, { ReportCard } from 'front-end/lib/views/report-card-list';
import React from 'react';
import { Col, Row } from 'reactstrap';
import { CWUOpportunity, CWUOpportunityStatus } from 'shared/lib/resources/opportunity/code-with-us';
import { CWUProposalSlim, CWUProposalStatus } from 'shared/lib/resources/proposal/code-with-us';
import { ADT, adt } from 'shared/lib/types';

export type State = Tab.Params & {
  proposals: CWUProposalSlim[];
  table: Immutable<Table.State>;
};

export type InnerMsg
  = ADT<'table', Table.Msg>;

export type Msg = GlobalComponentMsg<InnerMsg, Route>;

const init: Init<Tab.Params, State> = async params => {
  params.opportunity.status = CWUOpportunityStatus.Evaluation;

  const proposalResult = await api.proposals.cwu.readMany(params.opportunity.id);
  let proposals: CWUProposalSlim[] = [];
  switch (proposalResult.tag) {
    case 'valid':
      proposals = proposalResult.value;
      proposals[1] =  {...proposals[0]};
      proposals[2] =  {...proposals[0]};
      proposals[3] =  {...proposals[0]};
      proposals[4] =  {...proposals[0]};
      proposals[5] =  {...proposals[0]};
      proposals[6] =  {...proposals[0]};
      proposals[7] =  {...proposals[0]};
      proposals[8] =  {...proposals[0]};
      proposals[9] =  {...proposals[0]};
      proposals[0].score = 10;
      proposals[1].score = 63;
      proposals[2].score = 90;

      proposals[0].status = CWUProposalStatus.Draft        ;
      proposals[1].status = CWUProposalStatus.Submitted    ;
      proposals[2].status = CWUProposalStatus.UnderReview  ;
      proposals[3].status = CWUProposalStatus.Evaluated    ;
      proposals[4].status = CWUProposalStatus.Awarded      ;
      proposals[5].status = CWUProposalStatus.NotAwarded   ;
      proposals[6].status = CWUProposalStatus.Disqualified ;
      proposals[7].status = CWUProposalStatus.Withdrawn    ;
      break;
    case 'invalid':
    case 'unhandled':
      // TODO(Jesse): ??
      break;
  }

  return {
    proposals,
    table: immutable(await Table.init({
      idNamespace: '???'
    })),
    ...params
  };
};

const update: Update<State, Msg> = ({ state, msg }) => {
  switch (msg.tag) {

    case 'table':
      return updateComponentChild({
        state,
        childStatePath: ['table'],
        childUpdate: Table.update,
        childMsg: msg.value,
        mapChildMsg: value => ({ tag: 'table', value })
      });

    default:
      return [state];
  }
};

const makeCardData = (opportunity: CWUOpportunity, proposals: CWUProposalSlim[]): ReportCard[]  => {

  const proposalsValue = proposals.length.toString();
  const winningScoreValue = '- -'; // TODO(Jesse): @successful-proponent

  let scoredProposals = 0;
  let avgScore = proposals.reduce( (acc, proposal) => {
    if (proposal.score) {
      ++scoredProposals;
      return acc + proposal.score;
    } else {
      return acc;
    }
  }, 0);
  avgScore /= scoredProposals;

  const avgScoreDisplay = avgScore ? `${avgScore.toFixed(1)}%` : '- -';
  return [
    {
      icon: 'comment-dollar',
      name: 'Proposals',
      value: proposalsValue
    },
    {
      icon: 'star-full',
      iconColor: 'yellow',
      name: 'Winning Score',
      value: winningScoreValue
    },
    {
      icon: 'star-half',
      iconColor: 'yellow',
      name: 'Avg. Score',
      value: avgScoreDisplay.toString()
    }
  ];
};

type Props = {
  state: State;
  dispatch: Dispatch<Msg>;
};

const WaitForOpportunityToClose: View<Props> = ({ state }) => {
  return (<div>Proposals will be displayed here once the opportunity has closed.</div>);
};

function evaluationTableBodyRows(state: State): Table.BodyRows  {
  return state.proposals.map( (p) => {
    return [
      { children: <div>{p.proponent.value.legalName}</div> },
      { children: <Badge text={cwuProposalStatusToTitleCase(p.status)} color={cwuProposalStatusToColor(p.status)} /> },
      { children: <div>{p.score ? p.score : '- -'}</div> }
    ];
  });
}

function evaluationTableHeadCells(state: State): Table.HeadCells {
  return [
    {
      children: 'Proponent',
      className: 'text-nowrap',
      style: { width: '50%' }
    },
    {
      children: 'Status',
      className: 'text-nowrap',
      style: {
        width: '25%',
        minWidth: '200px'
      }
    },
    {
      children: 'Score',
      className: 'text-nowrap',
      style: { width: '25%' }
    }
  ];
}

const EvaluationTable: View<Props> = ({ state, dispatch }) => {
  return (
    <div>
      <Table.view
        headCells={evaluationTableHeadCells(state)}
        bodyRows={evaluationTableBodyRows(state)}
        state={state.table}
        dispatch={mapComponentDispatch(dispatch, msg => adt('table' as const, msg))} />
    </div>
  );
};

const view: ComponentView<State, Msg> = (props) => {
  const state = props.state;
  const dispatch = props.dispatch;

  const opportunity = state.opportunity;
  const cardData = makeCardData(opportunity, state.proposals);

  const status = opportunity.status;

  let ActiveView = WaitForOpportunityToClose({state, dispatch});

  switch (status) {

    // case 'DRAFT':
    //   ActiveView = WaitForOpportunityToClose({state});
    //   break;

    case 'EVALUATION':
      ActiveView = EvaluationTable({state, dispatch});
      break;

  }

  return (
    <div>
      <EditTabHeader opportunity={state.opportunity} viewerUser={state.viewerUser} />
      <Row>
        <Col className='py-5' xs='12'>
          <ReportCardList reportCards={cardData} />
        </Col>
      </Row>
      <Row>
        <Col className='border-top py-5' xs='12'>
          <h4 className='pb-3'>Proposals</h4>
          { ActiveView }
        </Col>
      </Row>
    </div>
  );
};

export const component: Tab.Component<State, Msg> = {
  init,
  update,
  view
};
