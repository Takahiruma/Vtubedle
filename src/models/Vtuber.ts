import type { StatusTypes } from "./StatusTypes";

export interface Vtuber {
  id: number;
  first_name: string;
  last_name: string;
  colour: string;
  gender: string;
  status: StatusTypes;
  speciality: string[];
  nb_followers: number;
  debut_date: string;
  height: number;
  seiso_meter: number;
  portrait: string;
  is_selected: boolean;
}