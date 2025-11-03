export const AffiliationTypes = {
  HOLOLIVE: 'HOLOLIVE',
  INDIE: 'INDIE',
  PHASECONNECT: 'PHASECONNECT'
} as const;

export type AffiliationTypes = typeof AffiliationTypes[keyof typeof AffiliationTypes];