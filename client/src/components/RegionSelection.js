import React, { useEffect, useState } from 'react';
import './RegionSelection.css'; // Ensure the path to the CSS is correct

const RegionSelection = ({ regions, onSelectRegion, regionProgress }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!regions) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [regions]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  console.log('regionProgress:', regionProgress); // Log the user’s region progress
  console.log('regions:', regions); // Log the list of regions available

  return (
    <div className="region-selection-container">
      {regions.map(region => {

        // Logic to determine if the region is unlocked
        let isRegionUnlocked = false;

        if (region.level === 1) {
          // Always unlock the first region
          isRegionUnlocked = true;
        } else {
          const previousRegion = regions.find(r => r.level === region.level - 1);
          const previousRegionProgress = regionProgress.find(entry => entry.regionId === previousRegion._id.toString());

          // Unlock the current region if the previous region is completed
          isRegionUnlocked = previousRegionProgress && previousRegionProgress.isRegionCompleted;
        }

        console.log(`isRegionUnlocked for ${region.name}:`, isRegionUnlocked);

        return (
          <div
            key={region._id}
            className={`region-item ${isRegionUnlocked ? 'unlocked' : 'locked'}`}
            onClick={() => {
              if (isRegionUnlocked) {
                console.log(`Selected region: ${region.name}`);
                onSelectRegion(region._id);
              } else {
                console.log(`Region locked: ${region.name}`);
              }
            }}
            style={{
              cursor: isRegionUnlocked ? 'pointer' : 'not-allowed',
              backgroundImage: `url(${region.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <span>{region.name}</span>
          </div>
        );
      })}
    </div>
  );
};

export default RegionSelection;
