import Papa from "papaparse";
import type { AffiliationTypes } from "../models/AffiliationTypes";
import type { SeisonessTypes } from "../models/SeisonessTypes";
import type { StatusTypes } from "../models/StatusTypes";
import type { Vtuber } from "../models/Vtuber";
import { csvData } from "./csvData";
import { normalizePortraitName } from "./FormatUtils";

export const createVtuberTable = (db: any): void => {
  db.run(`
    CREATE TABLE IF NOT EXISTS vtuber (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      colour TEXT NOT NULL,
      gender TEXT NOT NULL,
      status TEXT NOT NULL,
      speciality TEXT NOT NULL,
      nb_followers INTEGER NOT NULL,
      debut_date TEXT NOT NULL,
      height INTEGER NOT NULL,
      affiliation TEXT NOT NULL,
      country TEXT NOT NULL,
      seisoness TEXT NOT NULL,
      portrait_id INTEGER, 
      has_been_selected BOOLEAN NOT NULL,
      nickname TEXT NOT NULL,
      FOREIGN KEY (portrait_id) REFERENCES portrait(id) ON DELETE SET NULL ON UPDATE CASCADE
    );
  `);
};


export const addVtuber = (db: any, vtuber: Omit<Vtuber, 'id'>): void => {
  const sql = `INSERT INTO vtuber (
    first_name, last_name, colour, gender, status, speciality, nb_followers, debut_date, height, affiliation, country, seisoness, portrait_id, has_been_selected, nickname
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const stmt = db.prepare(sql);
  stmt.run([
    vtuber.first_name, vtuber.last_name, vtuber.colour, vtuber.gender, vtuber.status,
    JSON.stringify(vtuber.speciality),
    vtuber.nb_followers, vtuber.debut_date, vtuber.height, vtuber.affiliation,
    JSON.stringify(vtuber.country),
    vtuber.seisoness, vtuber.portrait, vtuber.has_been_selected,
    JSON.stringify(vtuber.nickname)
  ]);
  stmt.free();
};

export const updateVtuberById = (db: any, id: number, updatedData: Partial<Vtuber>): void => {
  const sets = Object.entries(updatedData).map(([key, value]) => {
    if (Array.isArray(value)) {
      value = JSON.stringify(value);
    }
    if (typeof value === 'string') {
      return `${key}='${value}'`;
    } else if (typeof value === 'boolean' || typeof value === 'number') {
      return `${key}=${value}`;
    }
    return '';
  }).filter(Boolean).join(', ');

  const sql = `UPDATE vtuber SET ${sets} WHERE id=${id}`;
  db.run(sql);
};

export const updateMultipleVtubers = (db: any, updates: {id: number, data: Partial<Vtuber>}[]): void => {
  updates.forEach(update => {
    updateVtuberById(db, update.id, update.data);
  });
};

export const deleteVtuberById = (db: any, id: number): void => {
  db.run(`DELETE FROM vtuber WHERE id=${id}`);
};

export const getAllVtubers = (db: any): Vtuber[] => {
  const res = db.exec("SELECT * FROM vtuber;");
  if (res.length === 0) return [];
  return res[0].values.map((row: any[]) => ({
    id: row[0] as number,
    first_name: row[1] as string,
    last_name: row[2] as string,
    colour: row[3] as string,
    gender: row[4] as string,
    status: row[5] as StatusTypes,
    speciality: JSON.parse(row[6] as string),
    nb_followers: row[7] as number,
    debut_date: row[8] as string,
    height: row[9] as number,
    affiliation: row[10] as AffiliationTypes,
    country: JSON.parse(row[11] as string),
    seisoness: row[12] as SeisonessTypes,
    portrait: row[13] as string,
    has_been_selected: Boolean(row[14]),
    nickname: JSON.parse(row[15] as string),
  }));
};

export const getVtuberById = (db: any, id: number): Vtuber | null => {
  const res = db.exec(`SELECT * FROM vtuber WHERE id = ${id};`);
  if (res.length === 0 || res[0].values.length === 0) return null;
  const row = res[0].values[0];
  return {
    id: row[0] as number,
    first_name: row[1] as string,
    last_name: row[2] as string,
    colour: row[3] as string,
    gender: row[4] as string,
    status: row[5] as StatusTypes,
    speciality: JSON.parse(row[6] as string),
    nb_followers: row[7] as number,
    debut_date: row[8] as string,
    height: row[9] as number,
    affiliation: row[10] as AffiliationTypes,
    country: JSON.parse(row[11] as string),
    seisoness: row[12] as SeisonessTypes,
    portrait: row[13] as string,
    has_been_selected: Boolean(row[14]),
    nickname: JSON.parse(row[15] as string),
  };
};

export const initializeDatabase = async (db: any): Promise<void> => {
  createVtuberTable(db);

  await new Promise<void>((resolve, reject) => {
    Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          results.data.forEach((row: any) => {
            const firstName = normalizePortraitName(row.first_name?.toLowerCase() ?? "");
            const lastName = normalizePortraitName(row.last_name?.toLowerCase() ?? "");
            const portraitName = firstName && lastName
              ? `${firstName}_${lastName}_Portrait.webp`
              : `${firstName || lastName}_Portrait.webp`;

            const vtuber = {
              first_name: row.first_name,
              last_name: row.last_name,
              colour: row.colour,
              gender: row.gender,
              status: row.status,
              speciality: row.speciality ? row.speciality.split(",") : [],
              nb_followers: Number(row.nb_followers),
              debut_date: row.debut_date,
              height: Number(row.height),
              affiliation: row.affiliation,
              country: row.country ? row.country.split(",") : [],
              seisoness: row.seisoness,
              portrait: `/portrait/${portraitName}`,
              has_been_selected: row.has_been_selected.toLowerCase() === "true",
              nickname: row.nickname ? row.nickname.split(',') : [],
            };
            addVtuber(db, vtuber);
          });
          resolve();
        } catch (error) {
          reject(error);
        }
      },
      error: (error: any) => {
        reject(error);
      }
    });
  });
}
