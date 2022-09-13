import React from "react";
import "../VizOneBoxes.css";

const Boxes = (props) => {
  return (
    <div className="card">
      <div className="px-10 py-4">
        <div className="font-bold text-xl mb-2">
          <b>{props.statistic}</b>
        </div>
        <p className="text-gray-700 text-base">{props.statisticText}</p>
      </div>
    </div>
  );
};

export default Boxes;
