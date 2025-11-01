import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { StatusTypes } from "../models/StatusTypes";
import type { Vtuber } from "../models/Vtuber";
import { selectRandomVtuber } from "../utils/VtubeUtils";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import { TextField, TableContainer, Table, TableHead, TableRow, TableBody, Paper, Typography } from "@mui/material";

import { motion, type Variants } from "framer-motion";
import TableCell from '@mui/material/TableCell';

const MotionTableCell = motion(TableCell);

const cellVariants: Variants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: (i: number) => ({
    rotateY: 0,
    opacity: 1,
    transition: {
      delay: i * 0.35,
      type: "spring",
      stiffness: 300,
      damping: 20,
    },
  }),
};

const cellColor = (a: any, b: any, isArray = false) => {
  if (isArray) {
    const common = a.some((x: string) => b.includes(x));
    if (common) {
      if (a.length === b.length && a.every((x: string) => b.includes(x))) return "green";
      else return "orange";
    }
    return "red";
  }
  return a === b ? "green" : "red";
};

const formatFollowers = (num: number): string => {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return num.toString();
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const VtuberLoader: React.FC = () => {
  const [vtubers, setVtubers] = useState<Vtuber[]>([]);
  const [currentlySelected, setCurrentlySelected] = useState<Vtuber | null>(null);
  const [randomSelected, setRandomSelected] = useState<Vtuber | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [comparisonList, setComparisonList] = useState<Vtuber[]>([]);
  const [hasWon, setHasWon] = useState(false);

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
    if (randomSelected && currentlySelected && !hasWon) {
      if (randomSelected.id === currentlySelected.id) {
        setHasWon(true);
      }
    }
  }, [currentlySelected, randomSelected, hasWon]);

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const fetchVtuberData = async () => {
    try {
      const response = await fetch("/Vtube_bdd.csv");
      const csvText = await response.text();
      const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
      const data: Vtuber[] = parsed.data.map((row: any, index: number) => {
        const firstName = capitalizeFirstLetter(row.first_name.toLowerCase() ?? "");
        const lastName = capitalizeFirstLetter(row.last_name.toLowerCase() ?? "");
        const portraitName =
          firstName && lastName
            ? `${firstName}_${lastName}_Portrait.webp`
            : `${firstName || lastName}_Portrait.webp`;
        return {
          id: Number(row.Id ?? index),
          first_name: firstName,
          last_name: lastName,
          colour: row.colour ?? "",
          gender: row.gender ?? "",
          status: (row.status as StatusTypes) ?? StatusTypes.ACTIF,
          speciality: row.speciality ? row.speciality.split(",") : [],
          nb_followers: Number(row.nb_followers ?? 0),
          debut_date: row.debut_date ?? "",
          height: Number(row.height ?? 0),
          seiso_meter: Number(row.seiso_meter ?? 0),
          portrait: `/assets/portrait/${portraitName}`,
          is_selected: row.is_selected === "true",
        };
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

  const renderValueWithHint = (displayValue: string | number, compareValue?: number, numericValue?: number) => {
  if (compareValue === undefined || numericValue === undefined || numericValue === compareValue) {
    return <div style={{ textAlign: "center" }}>{displayValue}</div>;
  }
  return (
    <div style={{ position: "relative", width: "100%", textAlign: "center" }}>
      {displayValue}
      <img
        src={numericValue < compareValue ? "/assets/hints/up.png" : "/assets/hints/down.png"}
        alt={numericValue < compareValue ? "up" : "down"}
        style={{
          width: 16,
          height: 16,
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
};


  return (
    <div style={{ position: "relative" }}>
      <h2>Liste des VTubers</h2>

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
        <Paper
          sx={{
            position: 'absolute',
            zIndex: (theme) => theme.zIndex.modal + 1,
            width: '100%',
            maxHeight: 300,
            overflowY: 'auto',
            mt: 1,
          }}
          elevation={4}
        >
          <List>
            {filteredVtubers.map((vt) => (
              <ListItem key={vt.id} disablePadding>
                <ListItemButton
                  selected={currentlySelected?.id === vt.id}
                  onClick={() => handleSelect(vt)}
                >
                  <ListItemAvatar>
                    <Avatar alt={`${vt.first_name} ${vt.last_name}`} src={vt.portrait} />
                  </ListItemAvatar>
                  <ListItemText primary={`${vt.first_name} ${vt.last_name}`} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <p></p>
      )}

      {currentlySelected && hasWon && (
        <Typography variant="h6" color="success.main">Victoire</Typography>
      )}

      <h3>Comparaison des VTubers sélectionnés</h3>
      <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: "auto" }}>
        <Table
          stickyHeader
          size="small"
          aria-label="table comparaison VTubers"
          sx={{ borderCollapse: "collapse" }}
        >
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f0f0f0" }}>
              <TableCell sx={{ border: "1px solid #ccc" }}>Portrait</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>Couleur</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>Followers</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>Début</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>Taille (cm)</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>Genre</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>Spécialités</TableCell>
              <TableCell sx={{ border: "1px solid #ccc" }}>Statut</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {comparisonList.map((vt) => {
              const colourBg = cellColor(vt.colour, randomSelected?.colour);
              const followersBg = cellColor(vt.nb_followers, randomSelected?.nb_followers);
              const debutBg = cellColor(vt.debut_date, randomSelected?.debut_date);
              const heightBg = cellColor(vt.height, randomSelected?.height);
              const genderBg = cellColor(vt.gender, randomSelected?.gender);
              const statusBg = cellColor(vt.status, randomSelected?.status);
              const specBg = cellColor(vt.speciality, randomSelected?.speciality, true);

              return (
                <TableRow key={vt.id} hover>
                  <TableCell sx={{ border: "1px solid #ddd" }}>
                    {/* Portrait n’est pas animé */}
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
                    {renderValueWithHint(formatFollowers(vt.nb_followers), randomSelected?.nb_followers, vt.nb_followers)}
                  </MotionTableCell>

                  <MotionTableCell
                    initial="hidden"
                    animate="visible"
                    custom={2}
                    variants={cellVariants}
                    sx={{ border: "1px solid #ddd", backgroundColor: debutBg }}
                  >
                    {formatDate(vt.debut_date)}
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
  );
};

export default VtuberLoader;
