import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { StatusTypes } from "../models/StatusTypes";
import type { Vtuber } from "../models/Vtuber";
import { selectRandomVtuber } from "../utils/VtubeUtils";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import {
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  Paper,
  Typography,
  Tooltip,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import { motion } from "framer-motion";
import TableCell from "@mui/material/TableCell";
import { SeisonessTypes } from "../models/SeisonessTypes";
import { AffiliationTypes } from "../models/AffiliationTypes";
import {
  normalizePortraitName,
  formatDate,
  formatFollowers,
} from "../utils/FormatUtils";
import { cellColor, cellVariants } from "../utils/CellUtils";

import "./VtuberLoader.scss";

const MotionTableCell = motion(TableCell);

const VtuberLoader: React.FC = () => {
  const [vtubers, setVtubers] = useState<Vtuber[]>([]);
  const [currentlySelected, setCurrentlySelected] = useState<Vtuber | null>(null);
  const [randomSelected, setRandomSelected] = useState<Vtuber | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [comparisonList, setComparisonList] = useState<Vtuber[]>([]);
  const [hasWon, setHasWon] = useState(false);

  const handleRestart = () => {
    const storedData = localStorage.getItem("vtubers");
    if (storedData) {
      const parsedData: Vtuber[] = JSON.parse(storedData);
      const random = selectRandomVtuber(parsedData);
      setRandomSelected(random);
    }
    setCurrentlySelected(null);
    setComparisonList([]);
    setSearchTerm("");
    setHasWon(false);
  };

  useEffect(() => {
    const storedData = localStorage.getItem("vtubers");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setVtubers(parsedData);
      if (parsedData.length > 0) {
        const random = selectRandomVtuber(parsedData);
        setRandomSelected(random);
      }
    } else {
      fetchVtuberData();
    }
  }, []);

  useEffect(() => {
    if (currentlySelected && randomSelected) {
      const timer = setTimeout(() => {
        if (randomSelected.id === currentlySelected.id) {
          setHasWon(true);
        }
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [currentlySelected, randomSelected]);

  const fetchVtuberData = async () => {
    try {
      const response = await fetch("/Vtube_bdd.csv");
      const csvText = await response.text();
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      const data: Vtuber[] = parsed.data.map((row: any, index: number) => {
        const firstName = normalizePortraitName(row.first_name.toLowerCase() ?? "");
        const lastName = normalizePortraitName(row.last_name.toLowerCase() ?? "");
        const portraitName =
          firstName && lastName
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
          has_been_selected: row.is_selected === "true",
        };
      });

      data.sort((a, b) => {
        const lastNameCompare = a.first_name.localeCompare(b.first_name);
        if (lastNameCompare !== 0) return lastNameCompare;
        return a.last_name.localeCompare(b.last_name);
      });

      setVtubers(data);
      localStorage.setItem("vtubers", JSON.stringify(data));

      if (data.length > 0) {
        const random = selectRandomVtuber(data);
        setRandomSelected(random);
      }
    } catch (error) {
      console.error("Erreur lors du chargement du CSV:", error);
    }
  };

  const filteredVtubers = vtubers.filter((vt) => {
    const alreadySelected = comparisonList.find((c) => c.id === vt.id);
    if (alreadySelected) return false;
    const fullName = `${vt.first_name} ${vt.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const addToComparison = (vtuber: Vtuber) => {
    setComparisonList((prev) => {
      const filtered = prev.filter((v) => v.id !== vtuber.id);
      return [vtuber, ...filtered];
    });
  };

  const handleSelect = (vtuber: Vtuber) => {
    setCurrentlySelected(vtuber);
    addToComparison(vtuber);
    setSearchTerm("");
  };

  const renderValueWithHint = (
    displayValue: string | number,
    compareValue?: number,
    numericValue?: number
  ) => {
    if (
      compareValue === undefined ||
      numericValue === undefined ||
      numericValue === compareValue
    ) {
      return <div className="text-center">{displayValue}</div>;
    }
    return (
      <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
        {displayValue}
        <img
          src={
            numericValue < compareValue
              ? "/assets/hints/up.png"
              : "/assets/hints/down.png"
          }
          alt={numericValue < compareValue ? "up" : "down"}
          className="hint-icon"
        />
      </div>
    );
  };

  return (
    <div className="vtuber-loader-container">
      <h2>Devine le VTuber ou la VTubeuse</h2>
      <h3>Tape n'importe quel VTuber pour commecer</h3>

      {hasWon && (
        <button className="restart-button" onClick={handleRestart}>
          Recommencer
        </button>
      )}
      <div className="vtuber-container">
        
        <div  className="textfield-wrapper">
          {!hasWon && (
            <TextField
              label="Rechercher un VTuber"
              variant="outlined"
              size="small"
              fullWidth
              margin="normal"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tapez un prénom ou nom"
            />
          )}

        {searchTerm.trim().length > 0 && !hasWon ? (
          <Paper className="search-results-paper" elevation={4}>
            <List>
              {filteredVtubers.map((vt) => (
                <ListItem key={vt.id} disablePadding>
                  <ListItemButton
                    selected={currentlySelected?.id === vt.id}
                    onClick={() => handleSelect(vt)}
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt={`${vt.first_name} ${vt.last_name}`}
                        src={vt.portrait}
                        className="avatar-cell"
                      />
                    </ListItemAvatar>
                    <ListItemText primary={`${vt.first_name} ${vt.last_name}`} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          <p className="placeholder-empty"></p>
        )}
      
        </div>
        {currentlySelected && hasWon && (
          <Typography variant="h6" color="success.main">
            Victoire
          </Typography>
        )}

        <TableContainer component={Paper} className="table-container">
          <Table
            stickyHeader
            size="small"
            aria-label="table comparaison VTubers"
            className="vtuber-table"
          >
            <TableHead>
              <TableRow>
                <TableCell>Portrait</TableCell>
                <TableCell>Couleur</TableCell>
                <TableCell>
                  <div className="header-with-tooltip">
                    Followers
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
                    <Tooltip title="Talent pour quoi un Vtuber est reconnu pour. Pas nécessairement ce que stream habituellement le Vtuber">
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
                const specBg = cellColor(vt.speciality, randomSelected?.speciality, true);
                const seisoMeterBg = cellColor(vt.seisoness, randomSelected?.seisoness);
                const cntBg = cellColor(vt.country, randomSelected?.country, true);
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
                      {renderValueWithHint(
                        formatFollowers(vt.nb_followers),
                        randomSelected?.nb_followers,
                        vt.nb_followers
                      )}
                    </MotionTableCell>

                    <MotionTableCell
                      initial="hidden"
                      animate="visible"
                      custom={2}
                      variants={cellVariants}
                      sx={{ border: "1px solid #ddd", backgroundColor: debutBg }}
                    >
                      {renderValueWithHint(
                        vtDebutYear,
                        Number(randomVtDebutYear),
                        Number(vtDebutYear)
                      )}
                    </MotionTableCell>

                    <MotionTableCell
                      initial="hidden"
                      animate="visible"
                      custom={3}
                      variants={cellVariants}
                      sx={{ border: "1px solid #ddd", backgroundColor: heightBg }}
                    >
                      {renderValueWithHint(vt.height, randomSelected?.height, vt.height)}
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
      </div>
    </div>
  );
};

export default VtuberLoader;
