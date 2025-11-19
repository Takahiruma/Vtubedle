import React from "react";
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  TableCell,
  Avatar,
  Tooltip,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { motion } from "framer-motion";

import type { Vtuber } from "../../models/Vtuber";
import { formatDate, formatFollowers } from "../../utils/FormatUtils";
import { cellColor, cellVariants } from "../../utils/CellUtils";
import RenderValueWithHint from "../RenderValueWithHint/RenderValueWithHint";

import "./VtuberComparaisonTable.scss"

const MotionTableCell = motion.create(TableCell);

interface Props {
  comparisonList: Vtuber[];
  randomSelected: Vtuber | null;
}

const VtuberComparisonTable: React.FC<Props> = ({ comparisonList, randomSelected }) => {
  return (
    <TableContainer component={Paper} className="table-container">
      <Table stickyHeader size="small" aria-label="table comparaison VTubers" className="vtuber-table">
        <TableHead>
          <TableRow>
            <TableCell>Portrait</TableCell>
            <TableCell>Couleur</TableCell>
            <TableCell>
              <div className="header-with-tooltip">
                Abonnés
                <Tooltip title="Nombre total d'abonnés sur Youtube.">
                  <HelpOutlineIcon className="tooltip-icon" fontSize="small" />
                </Tooltip>
              </div>
            </TableCell>
            <TableCell>
              <div className="header-with-tooltip">
                Début
                <Tooltip title="Année de début de la carrière du VTuber.">
                  <HelpOutlineIcon className="tooltip-icon" fontSize="small" />
                </Tooltip>
              </div>
            </TableCell>
            <TableCell>Taille (cm)</TableCell>
            <TableCell>Genre</TableCell>
            <TableCell>
              <div className="header-with-tooltip">
                Spécialités
                <Tooltip title="Talent reconnu, non forcément ce qu'il diffuse en streaming.">
                  <HelpOutlineIcon className="tooltip-icon" fontSize="small" />
                </Tooltip>
              </div>
            </TableCell>
            <TableCell>Affiliation</TableCell>
            <TableCell>Pays</TableCell>
            <TableCell>
              <div className="header-with-tooltip">
                Seisoness
                <Tooltip title="Niveau de décence du VTuber (de Seiso à Yabai).">
                  <HelpOutlineIcon className="tooltip-icon" fontSize="small" />
                </Tooltip>
              </div>
            </TableCell>
            <TableCell>
              <div className="header-with-tooltip">
                Statut
                <Tooltip title="Le statut de l'activité du Vtuber.">
                  <HelpOutlineIcon className="tooltip-icon" fontSize="small" />
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {comparisonList.map((vt) => {
            const vtDebutYear = formatDate(vt.debut_date);
            const randomVtDebutYear = randomSelected?.debut_date
              ? formatDate(randomSelected.debut_date)
              : undefined;

            const colourBg = cellColor(vt.colour, randomSelected?.colour);
            const followersBg = cellColor(vt.nb_followers, randomSelected?.nb_followers);
            const debutBg = cellColor(vtDebutYear, randomVtDebutYear);
            const heightBg = cellColor(vt.height, randomSelected?.height);
            const genderBg = cellColor(vt.gender, randomSelected?.gender);
            const statusBg = cellColor(vt.status, randomSelected?.status);
            const specBg = cellColor(vt.speciality, randomSelected?.speciality);
            const seisoMeterBg = cellColor(vt.seisoness, randomSelected?.seisoness);
            const cntBg = cellColor(vt.country, randomSelected?.country);
            const affBg = cellColor(vt.affiliation, randomSelected?.affiliation);

            return (
              <TableRow key={vt.id}>
                <TableCell className="avatar-cell">
                  <Avatar alt={`${vt.first_name} ${vt.last_name}`} src={vt.portrait} />
                </TableCell>

                <MotionTableCell
                  initial="hidden"
                  animate="visible"
                  custom={0}
                  variants={cellVariants}
                  sx={{ border: "1px solid #ddd", backgroundColor: colourBg }}
                >
                  {vt.colour}
                </MotionTableCell>

                <MotionTableCell
                  initial="hidden"
                  animate="visible"
                  custom={1}
                  variants={cellVariants}
                  sx={{ border: "1px solid #ddd", backgroundColor: followersBg }}
                >
                  <RenderValueWithHint
                    displayValue={formatFollowers(vt.nb_followers)}
                    compareValue={randomSelected?.nb_followers}
                    numericValue={vt.nb_followers}
                  />
                </MotionTableCell>

                <MotionTableCell
                  initial="hidden"
                  animate="visible"
                  custom={2}
                  variants={cellVariants}
                  sx={{ border: "1px solid #ddd", backgroundColor: debutBg }}
                >
                  <RenderValueWithHint
                    displayValue={vtDebutYear}
                    compareValue={Number(randomVtDebutYear)}
                    numericValue={Number(vtDebutYear)}
                  />
                </MotionTableCell>

                <MotionTableCell
                  initial="hidden"
                  animate="visible"
                  custom={3}
                  variants={cellVariants}
                  sx={{ border: "1px solid #ddd", backgroundColor: heightBg }}
                >
                  <RenderValueWithHint
                    displayValue={vt.height}
                    compareValue={randomSelected?.height}
                    numericValue={vt.height}
                  />
                </MotionTableCell>

                <MotionTableCell
                  initial="hidden"
                  animate="visible"
                  custom={4}
                  variants={cellVariants}
                  sx={{ border: "1px solid #ddd", backgroundColor: genderBg }}
                >
                  {vt.gender}
                </MotionTableCell>

                <MotionTableCell
                  initial="hidden"
                  animate="visible"
                  custom={5}
                  variants={cellVariants}
                  sx={{ border: "1px solid #ddd", backgroundColor: specBg }}
                >
                  {vt.speciality.join(", ")}
                </MotionTableCell>

                <MotionTableCell
                  initial="hidden"
                  animate="visible"
                  custom={6}
                  variants={cellVariants}
                  sx={{ border: "1px solid #ddd", backgroundColor: affBg }}
                >
                  {vt.affiliation.toLocaleLowerCase()}
                </MotionTableCell>

                <MotionTableCell
                  initial="hidden"
                  animate="visible"
                  custom={7}
                  variants={cellVariants}
                  sx={{ border: "1px solid #ddd", backgroundColor: cntBg }}
                >
                  {vt.country.join(", ")}
                </MotionTableCell>

                <MotionTableCell
                  initial="hidden"
                  animate="visible"
                  custom={8}
                  variants={cellVariants}
                  sx={{ border: "1px solid #ddd", backgroundColor: seisoMeterBg }}
                >
                  {vt.seisoness.toLocaleLowerCase()}
                </MotionTableCell>

                <MotionTableCell
                  initial="hidden"
                  animate="visible"
                  custom={9}
                  variants={cellVariants}
                  sx={{ border: "1px solid #ddd", backgroundColor: statusBg }}
                >
                  {vt.status}
                </MotionTableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VtuberComparisonTable;
