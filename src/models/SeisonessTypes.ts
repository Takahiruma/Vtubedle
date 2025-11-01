export const SeisonessTypes = {
  SEISO: 'SEISO',
  YABAI: 'YABAI',
} as const;

export type SeisonessTypes = typeof SeisonessTypes[keyof typeof SeisonessTypes];