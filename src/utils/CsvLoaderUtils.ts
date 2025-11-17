import Papa from "papaparse";
import { normalizePortraitName } from "../utils/FormatUtils";
import { StatusTypes } from "../models/StatusTypes";
import { SeisonessTypes } from "../models/SeisonessTypes";
import { AffiliationTypes } from "../models/AffiliationTypes";
import type { Vtuber } from "../models/Vtuber";

export async function loadVtuberData(): Promise<Vtuber[]> {
  const storedData = localStorage.getItem("vtubers");
  if (storedData) {
    return JSON.parse(storedData);
  }

  try {
    const response = await fetch("/Vtube_bdd.csv");
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    const data: Vtuber[] = parsed.data.map((row: any, index: number) => {
      const firstName = normalizePortraitName(row.first_name?.toLowerCase() ?? "");
      const lastName = normalizePortraitName(row.last_name?.toLowerCase() ?? "");
      const portraitName = firstName && lastName
        ? `${firstName}_${lastName}_Portrait.webp`
        : `${firstName || lastName}_Portrait.webp`;

      return {
        id: Number(row.Id ?? index),
        first_name: row.first_name,
        last_name: row.last_name,
        colour: row.colour ?? "",
        gender: row.gender ?? "",
        status: (row.status as StatusTypes) ?? StatusTypes.ACTIF,
        speciality: row.speciality ? row.speciality.split(",") : [],
        nb_followers: Number(row.nb_followers ?? 0),
        debut_date: row.debut_date ?? "",
        height: Number(row.height ?? 0),
        affiliation: row.affiliation ?? AffiliationTypes.INDIE,
        country: row.country ? row.country.split(",") : [],
        seisoness: (row.seisoness as SeisonessTypes) ?? SeisonessTypes.YABAI,
        portrait: `/assets/portrait/${portraitName}`,
        nickname: row.nickname? row.nickname.split(',') : [],
        has_been_selected: row.is_selected === "true",
      };
    });

    data.sort((a, b) => {
      const nameCompare = a.first_name.localeCompare(b.first_name);
      return nameCompare !== 0 ? nameCompare : a.last_name.localeCompare(b.last_name);
    });

    localStorage.setItem("vtubers", JSON.stringify(data));
    return data;
  } catch (err) {
    console.error("Erreur de chargement du CSV:", err);
    return [];
  }
}
