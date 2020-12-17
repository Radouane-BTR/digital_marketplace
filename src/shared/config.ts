import { IdentityProvider } from 'shared/lib/resources/user';

export function parseBooleanEnvironmentVariable(raw?: string): boolean | null {
  switch (raw) {
    case '1': return true;
    case '0': return false;
    default: return null;
  }
}

export const SHOW_TEST_INDICATOR = parseBooleanEnvironmentVariable(process.env.SHOW_TEST_INDICATOR) || false;

export const CONTACT_EMAIL = 'digitalmarketplace@gov.bc.ca';

export const GOV_IDP_SUFFIX = 'idir'; //TODO enlever

export const GOV_IDP_NAME = 'IDIR'; //TODO enlever

const govIdpMap = new Map<string, IdentityProvider>();

govIdpMap.set('idir', {
  suffix: 'idir',
  name: 'IDIR',
  icon: ''
});

//Add goverment Identity providers here:
/*
govIdpMap.set('idp_map_index', {
  suffix: 'idp_name_in_keycloak',
  name: 'Display idp name',
  icon: ''
});
*/

export const GOV_IDPS: Map<string, IdentityProvider> = govIdpMap;

const vendorIdpMap = new Map<string, IdentityProvider>();

vendorIdpMap.set('github', {
  suffix: 'github',
  name: 'GitHub',
  icon: ''
});

vendorIdpMap.set('bitbucket', {
  suffix: 'bitbucket',
  name: 'Bitbucket',
  icon: ''
});

//Add vendors Identity providers here:
/*
vendorIdpMap.set('idp', {
  suffix: 'idp_name_in_keycloak',
  name: 'Display idp name',
  icon: ''
});
*/

export const VENDOR_IDPS: Map<string, IdentityProvider> = vendorIdpMap;

export const TIMEZONE = 'America/Toronto';

export const CWU_MAX_BUDGET = 70000;

export const SWU_MAX_BUDGET = 2000000;

export const COPY = {
  appTermsTitle: 'Digital Marketplace Terms & Conditions for E-Bidding',
  gov: {
    name: {
      short: 'Québec',
      long: 'Governement du Québec'
    }
  },
  region: {
    name: {
      short: 'QC',
      long: 'Québec'
    }
  }
};

export const EMPTY_STRING = '—'; // emdash

export const DEFAULT_PAGE_SIZE = 20;
