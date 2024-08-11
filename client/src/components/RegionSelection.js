import React from 'react';
import './RegionSelection.css';

const RegionSelection = ({ regions, onSelectRegion, highestRegionCompleted }) => {
    const unlockedRegions = regions.filter((region) => {
        const regionId = region._id.toString();
        const highestRegionId = highestRegionCompleted ? highestRegionCompleted.toString() : null;
   
        return (
          !highestRegionCompleted ||
          regionId === highestRegionId ||
          region.level === (regions.find(r => r._id.toString() === highestRegionId)?.level + 1)
        );
      });
   
      

  return (
    <div className="region-list">
      {unlockedRegions.length > 0 ? (
        unlockedRegions.map((region) => (
          <div
            key={region._id}
            className="region-item"
            style={{ backgroundImage: `url(${region.image})` }}
            onClick={() => onSelectRegion(region._id)}
          >
            <span>{region.name}</span>
          </div>
        ))
      ) : (
        <p>No regions available.</p>
      )}
    </div>
  );
};

export default RegionSelection;
