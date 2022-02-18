import i18next from 'i18next'

export const CAPABILITIES_WITH_DESCRIPTIONS = [
  {
    name: i18next.t('agile-coaching.title'),
    description: [
      i18next.t('agile-coaching.descriptions.0'),
      i18next.t('agile-coaching.descriptions.1'),
      i18next.t('agile-coaching.descriptions.2'),
      i18next.t('agile-coaching.descriptions.3'),
      i18next.t('agile-coaching.descriptions.4'),
      i18next.t('agile-coaching.descriptions.5'),
      i18next.t('agile-coaching.descriptions.6'),
      i18next.t('agile-coaching.descriptions.7'),
      i18next.t('agile-coaching.descriptions.8'),
      i18next.t('agile-coaching.descriptions.9'),
      i18next.t('agile-coaching.descriptions.10'),
    ]
  },
  {
    name: i18next.t('backend-development.title'),
    description: [
      i18next.t('backend-development.descriptions.0'),
      i18next.t('backend-development.descriptions.1'),
      i18next.t('backend-development.descriptions.2'),
      i18next.t('backend-development.descriptions.3'),
      i18next.t('backend-development.descriptions.4'),
      i18next.t('backend-development.descriptions.5'),
      i18next.t('backend-development.descriptions.6'),
      i18next.t('backend-development.descriptions.7'),
      i18next.t('backend-development.descriptions.8'),
      i18next.t('backend-development.descriptions.9'),
      i18next.t('backend-development.descriptions.10'),
      i18next.t('backend-development.descriptions.11'),
    ]
  },
  {
    name: i18next.t('delivery-management.title'),
    description: [
      i18next.t('delivery-management.descriptions.0'),
      i18next.t('delivery-management.descriptions.1'),
      i18next.t('delivery-management.descriptions.2'),
      i18next.t('delivery-management.descriptions.3'),
      i18next.t('delivery-management.descriptions.4'),
      i18next.t('delivery-management.descriptions.5')
    ]
  },
  {
    name: i18next.t('devOps-engineering.title'),
    description: [
      i18next.t('devOps-engineering.descriptions.0'),
      i18next.t('devOps-engineering.descriptions.1'),
      i18next.t('devOps-engineering.descriptions.2'),
      i18next.t('devOps-engineering.descriptions.3'),
      i18next.t('devOps-engineering.descriptions.4'),
      i18next.t('devOps-engineering.descriptions.5'),
      i18next.t('devOps-engineering.descriptions.6'),
      i18next.t('devOps-engineering.descriptions.7')
    ]
  },
  {
    name: i18next.t('frontend-development.title'),
    description: [
      i18next.t('frontend-development.descriptions.0'),
      i18next.t('frontend-development.descriptions.1'),
      i18next.t('frontend-development.descriptions.2'),
      i18next.t('frontend-development.descriptions.3'),
      i18next.t('frontend-development.descriptions.4'),  
      i18next.t('frontend-development.descriptions.5'),
      i18next.t('frontend-development.descriptions.6'),
      i18next.t('frontend-development.descriptions.7'),
      i18next.t('frontend-development.descriptions.8')
    ]
  },
  {
    name: i18next.t('security-engineering.title'),
    description: [
      i18next.t('security-engineering.descriptions.0'),
      i18next.t('security-engineering.descriptions.1'),
      i18next.t('security-engineering.descriptions.2')
    ]
  },
  {
    name: i18next.t('technical-architecture.title'),
    description: [
      i18next.t('technical-architecture.descriptions.0'),
      i18next.t('technical-architecture.descriptions.1'),
      i18next.t('technical-architecture.descriptions.2'),
      i18next.t('technical-architecture.descriptions.3'),
      i18next.t('technical-architecture.descriptions.4'),  
      i18next.t('technical-architecture.descriptions.5')
    ]
  },
  {
    name: i18next.t('user-experience-design.title'),
    description: [
      i18next.t('user-experience-design.descriptions.0'),
      i18next.t('user-experience-design.descriptions.1'),
      i18next.t('user-experience-design.descriptions.2'),
      i18next.t('user-experience-design.descriptions.3'),
      i18next.t('user-experience-design.descriptions.4'),
      i18next.t('user-experience-design.descriptions.5'),
      i18next.t('user-experience-design.descriptions.6'),
      i18next.t('user-experience-design.descriptions.7')
    ]
  },
  {
    name: i18next.t('user-research.title'),
    description: [
      i18next.t('user-research.descriptions.0'),
      i18next.t('user-research.descriptions.1'),
      i18next.t('user-research.descriptions.2'),
      i18next.t('user-research.descriptions.3'),
      i18next.t('user-research.descriptions.4'),
      i18next.t('user-research.descriptions.5'),
      i18next.t('user-research.descriptions.6'),
      i18next.t('user-research.descriptions.7')
    ]
  }
];

const CAPABILITY_NAMES_ONLY = CAPABILITIES_WITH_DESCRIPTIONS.map(({ name }) => name);

export default CAPABILITY_NAMES_ONLY;
