import React from 'react';
import './UnitSelection.css';

const UnitSelection = ({ units, selectedUnits, onUnitChange, onBattleStart, onBack }) => {
  if (!units || units.length === 0) {
    return <p>No offensive units available.</p>;
  }

  return (
    <div className="unit-selection">
      <h3>Select Units to Send</h3>
      <table className="unit-selection-table">
        <thead>
          <tr>
            <th>Unit Name</th>
            <th>Available</th>
            <th>Send</th>
          </tr>
        </thead>
        <tbody>
          {units.map((unit) => (
            <tr key={unit.unit._id}>
              <td>{unit.unit.name}</td>
              <td>{unit.quantity}</td>
              <td>
                <input
                  type="number"
                  value={selectedUnits[unit.unit._id] || 0}
                  onChange={(e) => onUnitChange(unit.unit._id, parseInt(e.target.value))}
                  min="0"
                  max={unit.quantity}
                  className="unit-input"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="unit-selection-buttons">
        <button onClick={onBattleStart}>Start Battle</button>
        <button className="back-button" onClick={onBack}>Back</button>
      </div>
    </div>
  );
};

export default UnitSelection;
