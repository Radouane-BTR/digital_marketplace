import * as MenuSidebar from 'front-end/lib/components/sidebar/menu';
import * as TabbedPage from 'front-end/lib/components/sidebar/menu/tabbed-page';
import { immutable, Immutable } from 'front-end/lib/framework';
import * as ProposalTab from 'front-end/lib/pages/proposal/code-with-us/edit/tab/proposal';
import { routeDest } from 'front-end/lib/views/link';
import { CWUProposal } from 'shared/lib/resources/proposal/code-with-us';
import { User } from 'shared/lib/resources/user';
import { adt, Id } from 'shared/lib/types';
import i18next from 'i18next'; 

// Parent page types & functions.

export type ParentState<K extends TabId> = TabbedPage.ParentState<Tabs, K>;

export type ParentMsg<K extends TabId, InnerMsg> = TabbedPage.ParentMsg<Tabs, K, InnerMsg>;

// Tab component types & functions.

export interface Params {
  proposal: CWUProposal;
  viewerUser: User;
}

export type Component<State, Msg> = TabbedPage.TabComponent<Params, State, Msg>;

export interface Tabs {
  proposal: TabbedPage.Tab<Params, ProposalTab.State, ProposalTab.InnerMsg>;
}

export type TabId = TabbedPage.TabId<Tabs>;

export type TabState<K extends TabId> = TabbedPage.TabState<Tabs, K>;

export type TabMsg<K extends TabId> = TabbedPage.TabMsg<Tabs, K>;

export const parseTabId: TabbedPage.ParseTabId<Tabs> = raw => {
  switch (raw) {
    case 'proposal':
      return raw;
    default:
      return null;
  }
};

export function idToDefinition<K extends TabId>(id: K): TabbedPage.TabDefinition<Tabs, K> {
  switch (id) {
    case 'proposal':
    default:
      return {
        component: ProposalTab.component,
        icon: 'comment-dollar',
        title: i18next.t('proposal')
      } as TabbedPage.TabDefinition<Tabs, K>;
  }
}

export function makeSidebarLink(tab: TabId, proposalId: Id, opportunityId: Id, activeTab: TabId): MenuSidebar.SidebarItem {
  const { icon, title } = idToDefinition(tab);
  return adt('link', {
    icon,
    text: title,
    active: activeTab === tab,
    dest: routeDest(adt('proposalCWUEdit', { proposalId, opportunityId, tab }))
  });
}

export async function makeSidebarState(proposalId: Id, opportunityId: Id, activeTab: TabId): Promise<Immutable<MenuSidebar.State>> {
  const proposalManagement = i18next.t('proposalManagement')
  const needHelp = i18next.t('needHelp')
  return immutable(await MenuSidebar.init({
    items: [
      adt('heading', proposalManagement),
      makeSidebarLink('proposal', proposalId, opportunityId, activeTab),
      adt('heading', needHelp),
      adt('link', {
        icon: 'external-link-alt',
        text: i18next.t('links.readGuide'),
        active: false,
        newTab: true,
        dest: routeDest(adt('contentView', 'code-with-us-proposal-guide'))
      })
    ]
  }));
}
