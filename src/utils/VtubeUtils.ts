import type { Vtuber } from "../models/Vtuber";

export function encodeVtuber(vtuber: Vtuber): string {
  const json = JSON.stringify(vtuber);
  return btoa(json);
}

export function decodeVtuber(encoded: string): Vtuber {
  const json = atob(encoded);
  return JSON.parse(json);
}

export function selectRandomVtuber(vtubers: Vtuber[]): Vtuber | null {
  const candidates = vtubers.filter(v => !v.has_been_selected);
  if (candidates.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * candidates.length);
  return candidates[randomIndex];
}