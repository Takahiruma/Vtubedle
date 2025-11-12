import React from "react";
import "./VtuberRestartButton.scss"

interface Props {
  onRestart: () => void;
}

const VtuberRestartButton: React.FC<Props> = ({ onRestart }) => (
  <button className="restart-button" onClick={onRestart}>
    Recommencer
  </button>
);

export default VtuberRestartButton;
