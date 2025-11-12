import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import VtuberComparisonTable from "../../components/VtuberComparaisonTable/VtuberComparaisonTable";
import VtuberRestartButton from "../../components/VtuberRestartButton/VtuberRestartButton";
import VtuberSearch from "../../components/VtuberSearch/VtuberSearch";
import type { Vtuber } from "../../models/Vtuber";
import { loadVtuberData } from "../../utils/CsvLoaderUtils";
import { selectRandomVtuber } from "../../utils/VtubeUtils";
import "./VHome.scss"

const VHome: React.FC = () => {
  const [vtubers, setVtubers] = useState<Vtuber[]>([]);
  const [currentlySelected, setCurrentlySelected] = useState<Vtuber | null>(null);
  const [randomSelected, setRandomSelected] = useState<Vtuber | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [comparisonList, setComparisonList] = useState<Vtuber[]>([]);
  const [hasWon, setHasWon] = useState(false);

  useEffect(() => {
    (async () => {
      const data = await loadVtuberData();
      setVtubers(data);
      if (data.length > 0) {
        setRandomSelected(selectRandomVtuber(data));
      }
    })();
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

  const handleRestart = () => {
    const storedData = localStorage.getItem("vtubers");
    if (storedData) {
      const parsed: Vtuber[] = JSON.parse(storedData);
      setRandomSelected(selectRandomVtuber(parsed));
    }
    setCurrentlySelected(null);
    setComparisonList([]);
    setSearchTerm("");
    setHasWon(false);
  };

  const filteredVtubers = vtubers.filter((vt) => {
    if (comparisonList.find((c) => c.id === vt.id)) return false;
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
    <div className="vtuber-loader-container">
      <h2>Devine le VTuber ou la VTubeuse</h2>
      <h3>Tape n'importe quel VTuber pour commencer</h3>

      {hasWon && <VtuberRestartButton onRestart={handleRestart} />}

      <div className="vtuber-container">
        <VtuberSearch
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredVtubers={filteredVtubers}
          currentlySelected={currentlySelected}
          handleSelect={handleSelect}
          hasWon={hasWon}
        />

        {currentlySelected && hasWon && (
          <Typography variant="h6" color="success.main">
            Victoire
          </Typography>
        )}

        <VtuberComparisonTable
          comparisonList={comparisonList}
          randomSelected={randomSelected}
        />
      </div>
    </div>
  );
};

export default VHome;
