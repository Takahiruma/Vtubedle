import React from "react";
import "./RenderValueWithHint.scss"

interface Props {
  displayValue: string | number;
  compareValue?: number;
  numericValue?: number;
}

const RenderValueWithHint: React.FC<Props> = ({ displayValue, compareValue, numericValue }) => {
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
        src={numericValue < compareValue ? "/assets/hints/up.png" : "/assets/hints/down.png"}
        alt={numericValue < compareValue ? "up" : "down"}
        className="hint-icon"
      />
    </div>
  );
};

export default RenderValueWithHint;
