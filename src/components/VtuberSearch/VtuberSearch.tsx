import React from "react";
import {
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Paper,
} from "@mui/material";
import type { Vtuber } from "../../models/Vtuber";
import "./VtuberSearch.scss"

interface Props {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filteredVtubers: Vtuber[];
  currentlySelected: Vtuber | null;
  handleSelect: (vtuber: Vtuber) => void;
  hasWon: boolean;
}

const VtuberSearch: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  filteredVtubers,
  currentlySelected,
  handleSelect,
  hasWon,
}) => (
  <div className="textfield-wrapper">
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
                <ListItemText primary={`${vt.first_name} ${vt.last_name}`} 
                secondary={
                      vt.nickname  && vt.nickname.length > 0 ? `Alias : ${vt.nickname}` : undefined
                }/>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>
    ) : (
      <p className="placeholder-empty"></p>
    )}
  </div>
);

export default VtuberSearch;
