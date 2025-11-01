export const StatusTypes = {
  GRADUATE: 'GRADUATE',
  ACTIF: 'ACTIF',
  HIATUS: 'HIATUS',
  AFFILIATE: 'AFFILIATE'
} as const;

export type StatusTypes = typeof StatusTypes[keyof typeof StatusTypes];