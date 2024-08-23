const getUnlockedRegionsAndDungeons = (user, regions, dungeons) => {
    // Check if regionProgress is empty, indicating a new user
    const lastRegionProgress = user.regionProgress.length > 0
      ? user.regionProgress[user.regionProgress.length - 1]
      : null;
  
    const unlockedRegions = regions.filter(region => {
      // If the user has no region progress, unlock the first region
      if (!lastRegionProgress) {
        return region.level === 1; // Only unlock the first region if the user is new
      }
  
      // Check if the user has completed the current region
      const userRegion = user.regionProgress.find(entry => entry.regionId.toString() === region._id.toString());
      if (userRegion && userRegion.isRegionCompleted) {
        return true; // Unlock all previously completed regions
      }
  
      // Unlock the next region if the last region is fully completed
      const lastRegion = regions.find(r => r._id.toString() === lastRegionProgress.regionId.toString());
      if (lastRegionProgress.isRegionCompleted && lastRegion && region.level === lastRegion.level + 1) {
        return true;
      }
  
      // Otherwise, only unlock the current region if it’s not yet completed
      return region._id.toString() === lastRegionProgress.regionId.toString();
    });
  
    const unlockedDungeons = unlockedRegions.reduce((acc, region) => {
      const userRegion = user.regionProgress.find(entry => entry.regionId.toString() === region._id.toString());
      const completedDungeonIds = userRegion ? userRegion.completedDungeons.map(d => d.dungeonId.toString()) : [];
  
      const accessibleDungeons = dungeons.filter(dungeon => {
        return (
          dungeon.region.toString() === region._id.toString() &&
          (
            completedDungeonIds.includes(dungeon._id.toString()) || // Allow completed dungeons
            dungeon.level === completedDungeonIds.length + 1 // Unlock the next dungeon only
          )
        );
      });
  
      return [...acc, ...accessibleDungeons];
    }, []);
  
    return { unlockedRegions, unlockedDungeons };
  };
  
  module.exports = { getUnlockedRegionsAndDungeons };
  