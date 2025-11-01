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
import { TextField, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Typography } from "@mui/material";

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

      {currentlySelected ? (
        <div>
          {hasWon && (
            <Typography variant="h6" color="success.main">Victoire</Typography>
          )}
        </div>
      ) : (
        <p></p>
      )}

      <h3>Comparaison des VTubers sélectionnés</h3>
      <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: "auto" }}>
        <Table stickyHeader size="small" aria-label="table comparaison VTubers">
          <TableHead>
            <TableRow>
              <TableCell>Portrait</TableCell>
              <TableCell>Couleur</TableCell>
              <TableCell>Followers</TableCell>
              <TableCell>Début</TableCell>
              <TableCell>Taille (cm)</TableCell>
              <TableCell>Genre</TableCell>
              <TableCell>Statut</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comparisonList.map(vt => (
              <TableRow key={vt.id} hover>
                <TableCell><Avatar alt={`${vt.first_name} ${vt.last_name}`} src={vt.portrait} /></TableCell>
                <TableCell>{vt.colour}</TableCell>
                <TableCell>{vt.nb_followers.toLocaleString()}</TableCell>
                <TableCell>{vt.debut_date}</TableCell>
                <TableCell>{vt.height}</TableCell>
                <TableCell>{vt.gender}</TableCell>
                <TableCell>{vt.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default VtuberLoader;
