const Dungeon = require('../models/Dungeon');
const User = require('../models/User');
const Kingdom = require('../models/Kingdom');
const Unit = require('../models/Unit');
const Region = require('../models/Region');
const { uploadFile } = require('../utils/storage');
const { handleError } = require('../utils/errorHandler');
const fs = require('fs');
const path = require('path');
const { getUnlockedRegionsAndDungeons } = require('../utils/dungeonProgression');


// Controller for getting all dungeons (admin only)
const getAllDungeons = async (req, res) => {
  try {
    const dungeons = await Dungeon.find().populate('region');
    res.json(dungeons);
  } catch (err) {
    handleError(res, error);
  }
};

// Controller for creating a new dungeon (admin only)
const createDungeon = async (req, res) => {
  const { name, level, boss, reward, regionId } = req.body;

  try {
    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(400).json({ message: 'Invalid region' });
    }
    const regionName = region.name.toLowerCase().replace(/\s+/g, '_');

    let dungeonImageUrl = '';
    let bossImageUrl = '';

    if (req.files['dungeonImage']) {
      const dungeonImageFile = req.files['dungeonImage'][0];
      const dungeonImageDestination = `${dungeonImageFile.filename}${path.extname(
        dungeonImageFile.originalname
      )}`;
      dungeonImageUrl = await uploadFile(
        dungeonImageFile.path,
        dungeonImageDestination,
        regionName
      );
      fs.unlink(dungeonImageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary dungeon image file:', err);
      });
    }

    if (req.files['bossImage']) {
      const bossImageFile = req.files['bossImage'][0];
      const bossImageDestination = `${bossImageFile.filename}${path.extname(
        bossImageFile.originalname
      )}`;
      bossImageUrl = await uploadFile(
        bossImageFile.path,
        bossImageDestination,
        regionName
      );
      fs.unlink(bossImageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary boss image file:', err);
      });
    }

    const bossWithImage = { ...boss, image: bossImageUrl };

    const newDungeon = new Dungeon({
      name,
      level,
      boss: bossWithImage,
      reward,
      region: regionId,
      image: dungeonImageUrl,
    });

    await newDungeon.save();

    res.status(201).json(newDungeon);
  } catch (err) {
    handleError(res, error);
  }
};

const getEligibleRegionsAndDungeons = async (req, res) => {
  try {
    console.log("Fetching user...");
    const user = await User.findById(req.user.id);
    console.log("User found:", user);

    const regions = await Region.find();
    console.log("Regions fetched:", regions);

    const dungeons = await Dungeon.find();
    console.log("Dungeons fetched:", dungeons);

    const { unlockedRegions, unlockedDungeons } = getUnlockedRegionsAndDungeons(user, regions, dungeons);
    console.log("Unlocked regions:", unlockedRegions);
    console.log("Unlocked dungeons:", unlockedDungeons);

    res.json({ unlockedRegions, unlockedDungeons });
  } catch (error) {
    console.error("Error fetching regions and dungeons:", error); // Log the actual error
    res.status(500).json({ message: 'Failed to fetch regions and dungeons.', error: error.message });
  }
};


// Controller for getting dungeons the user is eligible to see
const getEligibleDungeons = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const highestRegionCompleted = user.highestRegionCompleted;
    let accessibleRegions;

    if (!highestRegionCompleted) {
      accessibleRegions = await Region.find().sort({ level: 1 }).limit(1);
    } else {
      const highestRegion = await Region.findById(highestRegionCompleted);
      accessibleRegions = await Region.find({
        level: { $lte: highestRegion.level },
      }).sort({ level: 1 });
    }

    const accessibleRegionIds = accessibleRegions.map((region) => region._id);

    let dungeons = [];
    for (let regionId of accessibleRegionIds) {
      const highestDungeonInRegion = user.highestDungeonCompleted.find(
        (entry) => entry.regionId === regionId.toString()
      );
      let highestLevelInRegion = 0;
      if (highestDungeonInRegion) {
        const highestDungeon = await Dungeon.findById(
          highestDungeonInRegion.dungeonId
        );
        highestLevelInRegion = highestDungeon ? highestDungeon.level : 0;
      }

      const eligibleDungeons = await Dungeon.find({
        region: regionId,
        level: { $lte: highestLevelInRegion + 1 },
      }).populate('region');

      dungeons = dungeons.concat(eligibleDungeons);
    }

    res.json(dungeons);
  } catch (err) {
    handleError(res, error);
  }
};


// Get a specific dungeon by ID
const getDungeonById = async (req, res) => {
  try {
    const dungeon = await Dungeon.findById(req.params.id).populate('region');
    if (!dungeon) {
      return res.status(404).json({ message: 'Dungeon not found' });
    }
    res.json(dungeon);
  } catch (err) {
    handleError(res, err);
  }
};

// Update a dungeon by ID (Admin only)
const updateDungeon = async (req, res) => {
  const { name, level, boss, reward, regionId } = req.body;
  const { id } = req.params;

  try {
    const dungeon = await Dungeon.findById(id);
    if (!dungeon) {
      return res.status(404).json({ message: 'Dungeon not found' });
    }

    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(400).json({ message: 'Invalid region' });
    }

    let dungeonImageUrl = dungeon.image;
    let bossImageUrl = boss.image;

    if (req.files['dungeonImage']) {
      const dungeonImageFile = req.files['dungeonImage'][0];
      const dungeonImageDestination = `${dungeonImageFile.filename}${path.extname(dungeonImageFile.originalname)}`;
      dungeonImageUrl = await uploadFile(dungeonImageFile.path, dungeonImageDestination, region.name.toLowerCase().replace(/\s+/g, '_'));
      fs.unlink(dungeonImageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary dungeon image file:', err);
      });
    }

    if (req.files['bossImage']) {
      const bossImageFile = req.files['bossImage'][0];
      const bossImageDestination = `${bossImageFile.filename}${path.extname(bossImageFile.originalname)}`;
      bossImageUrl = await uploadFile(bossImageFile.path, bossImageDestination, region.name.toLowerCase().replace(/\s+/g, '_'));
      fs.unlink(bossImageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary boss image file:', err);
      });
    }

    const updatedBoss = { ...boss, image: bossImageUrl };

    dungeon.name = name || dungeon.name;
    dungeon.level = level || dungeon.level;
    dungeon.boss = updatedBoss;
    dungeon.reward = reward || dungeon.reward;
    dungeon.region = regionId;
    dungeon.image = dungeonImageUrl;

    await dungeon.save();

    res.json(dungeon);
  } catch (err) {
    handleError(res, err);
  }
};

// Delete a dungeon by ID (Admin only)
const deleteDungeon = async (req, res) => {
  try {
    const dungeon = await Dungeon.findById(req.params.id);
    if (!dungeon) {
      return res.status(404).json({ message: 'Dungeon not found' });
    }

    await dungeon.remove();
    res.json({ message: 'Dungeon deleted successfully' });
  } catch (err) {
    handleError(res, err);
  }
};


const MIN_DAMAGE = 1;

// Helper function to calculate battle outcome
const calculateTurnBasedBattleOutcome = (units, user, dungeon) => {
    let battleLog = [];
    let turnOrder = [];
    let accumulatedDamage = {}; // Track accumulated damage for each unit
  
    if (!dungeon || !dungeon.boss) {
      console.error('Invalid dungeon object or missing boss details:', dungeon);
      return { result: 'error', playerHealth: 0, bossHealth: 0, battleLog: ['Invalid dungeon data.'] };
    }
  
    // Add the boss to the turn order first
    turnOrder.push({
      type: 'boss',
      attack: dungeon.boss.attack,
      defense: dungeon.boss.defense,
      speed: dungeon.boss.speed,
      health: dungeon.boss.health,
    });
  
    // Include user in the turn order
    turnOrder.push({
      type: 'user',
      id: user._id,
      name: user.name,
      attack: user?.stats?.total?.attack || 0,
      defense: user?.stats?.total?.defense || 0,
      speed: user?.stats?.total?.speed || 0,
      health: user?.stats?.total?.health || 0,
    });
  
    // Add units to the turn order
    units.forEach(unit => {
      for (let i = 0; i < unit.quantity; i++) {
        turnOrder.push({
          type: 'unit',
          id: unit.unitId,
          name: unit.name,
          attack: unit.attack,
          defense: unit.defense,
          speed: unit.speed,
          health: unit.health,
        });
        accumulatedDamage[unit.unitId] = 0; // Initialize accumulated damage for each unit
      }
    });
  
    console.log('Initial turn order:', turnOrder);
  
    // Sort by speed in descending order, keeping boss first
    turnOrder.sort((a, b) => {
      if (a.speed !== b.speed) {
        return b.speed - a.speed; // Sort by speed descending
      }
      if (a.type === 'boss') return -1; // Boss always goes first
      if (b.type === 'boss') return 1;
      return Math.random() - 0.5; // Randomize among same-speed units
    });
  
    let playerHealth = turnOrder
      .filter(entity => entity.type === 'unit' || entity.type === 'user')
      .reduce((acc, entity) => acc + entity.health, 0);
    let bossHealth = dungeon.boss.health;
  
  
    let turn = 1;
    let battleEnded = false;
    let killedUnits = [];
  
    while (playerHealth > 0 && bossHealth > 0 && !battleEnded) {
      let totalUnitDamageDealt = 0;
      let totalUserDamageDealt = 0;
      let currentCasualties = []; // Track casualties for the current turn
    
      for (let i = 0; i < turnOrder.length; i++) {
        const entity = turnOrder[i];
        if (entity.health > 0 && !battleEnded) {
          if (entity.type === 'boss') {
            // Boss attack logic
            let totalDefense = turnOrder
              .filter(e => e.type === 'unit' || e.type === 'user')
              .reduce((acc, unit) => acc + unit.defense, 0);
            let damageReduction = Math.sqrt(totalDefense) / (Math.sqrt(totalDefense) + 10);
            let damage = Math.round(dungeon.boss.attack * (1 - damageReduction));
            if (damage < MIN_DAMAGE) damage = MIN_DAMAGE;
    
            playerHealth -= damage;
            if (playerHealth < 0) playerHealth = 0;
            battleLog.push(`Turn ${turn}: Boss attacks for ${damage}! Player's health is now ${playerHealth}`);
  
            if (playerHealth <= 0) {
              battleEnded = true;
              break;
            }
    
            // Determine casualties, but don't log them yet
            let remainingDamage = damage;
            const livingUnits = turnOrder.filter(entity => entity.type === 'unit' && entity.health > 0);
            while (remainingDamage > 0 && livingUnits.length > 0) {
              const randomIndex = Math.floor(Math.random() * livingUnits.length);
              const selectedUnit = livingUnits[randomIndex];
    
              // Update the accumulated damage and adjust unit health accordingly
              if (accumulatedDamage[selectedUnit.id] + remainingDamage >= selectedUnit.health) {
                remainingDamage -= (selectedUnit.health - accumulatedDamage[selectedUnit.id]);
                accumulatedDamage[selectedUnit.id] = 0;
                selectedUnit.health = 0;
                currentCasualties.push(selectedUnit); // Store casualties to log later
                livingUnits.splice(randomIndex, 1);
              } else {
                accumulatedDamage[selectedUnit.id] += remainingDamage;
                remainingDamage = 0;
              }
            }
          } else if (entity.type === 'unit' && entity.health > 0) {
            // Unit attack logic
            let damageReduction = Math.sqrt(dungeon.boss.defense) / (Math.sqrt(dungeon.boss.defense) + 10);
            let damage = Math.round(entity.attack * (1 - damageReduction));
            if (damage < MIN_DAMAGE) damage = MIN_DAMAGE;
            bossHealth -= damage;
            totalUnitDamageDealt += damage;
    
            if (bossHealth <= 0) {
              bossHealth = 0;
              battleEnded = true;
              battleLog.push(`Turn ${turn}: ${entity.name} attacks and defeats the boss!`);
              break;
            }
          } else if (entity.type === 'user' && entity.health > 0) {
            // User attack logic
            let damageReduction = Math.sqrt(dungeon.boss.defense) / (Math.sqrt(dungeon.boss.defense) + 10);
            let damage = Math.round(entity.attack * (1 - damageReduction));
            if (damage < MIN_DAMAGE) damage = MIN_DAMAGE;
            bossHealth -= damage;
            totalUserDamageDealt += damage;
    
            if (bossHealth <= 0) {
              bossHealth = 0;
              battleEnded = true;
              battleLog.push(`Turn ${turn}: ${entity.name} attacks and defeats the boss!`);
              break;
            }
          }
        }
      }
    
      // Log the player unit attacks if the battle hasn't ended
      if (!battleEnded) {
        if (totalUnitDamageDealt > 0) {
          battleLog.push(`Turn ${turn}: Player's units dealt a total of ${totalUnitDamageDealt} damage to the boss.`);
        }
        if (totalUserDamageDealt > 0) {
          battleLog.push(`Turn ${turn}: Player dealt ${totalUserDamageDealt} damage to the boss.`);
        }
        battleLog.push(`Boss's remaining health: ${bossHealth}`);
      }
    
      // Log casualties after all actions
      currentCasualties.forEach(casualty => {
        battleLog.push(`Turn ${turn}: ${casualty.name} has been killed in action!`);
        killedUnits.push(casualty);
      });
    
      turn++;
    }
    
  
    let result = 'lose';
    if (bossHealth <= 0 && playerHealth > 0) {
      result = 'win';
    } else if (playerHealth <= 0 && bossHealth <= 0) {
      result = 'draw';
    }
  
    // Ensure the final log entry is clear
    if (result === 'win') {
      battleLog.push(`Turn ${turn}: The battle is won! The boss has been defeated.`);
    } else if (result === 'lose') {
      battleLog.push(`Turn ${turn}: The battle is lost. All units have been defeated.`);
    } else if (result === 'draw') {
      battleLog.push(`Turn ${turn}: The battle ended in a draw. Both the player and the boss are defeated.`);
    }
    return { result, playerHealth, bossHealth, battleLog, killedUnits };
};

// Helper function to process casualties
const processCasualties = async (userId, killedUnits) => {
    try {
        console.log('Processing casualties for user:', userId);
        console.log('Killed units:', killedUnits);
    
        const kingdom = await Kingdom.findOne({ user: userId }).populate('army.unit');
        if (!kingdom) {
          console.error('Kingdom not found for user:', userId);
          return;
        }
    
        console.log('Kingdom found:', kingdom._id);
        console.log('Army before processing:', kingdom.army);
    
        const unitsLost = {};
    
        killedUnits.forEach(killedUnit => {
          const killedUnitId = killedUnit.id;
          console.log('Processing killed unit:', killedUnit);
    
          const unitIndex = kingdom.army.findIndex(armyUnit => armyUnit.unit._id.toString() === killedUnitId);
          console.log('Unit index in army:', unitIndex);
    
          if (unitIndex > -1) {
            const unitName = kingdom.army[unitIndex].unit.name; // Get the unit name correctly
            console.log('Unit name:', unitName);
    
            if (!unitsLost[unitName]) {
              unitsLost[unitName] = 0;
            }
            unitsLost[unitName]++; // Increment the count of units lost
            console.log(`Incremented count for ${unitName}. Current count:`, unitsLost[unitName]);
    
            kingdom.army[unitIndex].quantity--;
            console.log(`Decreased quantity for ${unitName}. New quantity:`, kingdom.army[unitIndex].quantity);
    
            if (kingdom.army[unitIndex].quantity <= 0) {
              console.log(`${unitName} quantity is 0 or less. Removing from army.`);
              kingdom.army.splice(unitIndex, 1); // Remove the unit from the army if quantity is 0 or less
            }
          } else {
            console.warn(`Killed unit ${killedUnitId} not found in army.`);
          }
        });
    
        console.log('Army after processing:', kingdom.army);
        console.log('Units lost:', unitsLost);
    
        await kingdom.save();
        console.log('Kingdom saved successfully.');
    
        return unitsLost;
      } catch (error) {
        console.error('Error processing casualties:', error);
        return {};
      }
    };

const generateRune = (tier) => {
    // Define the possible buff ranges based on the rune's tier
    const buffRanges = {
      common: { min: 10, max: 30 },
      uncommon: { min: 15, max: 60 },
      rare: { min: 25, max: 100 },
      epic: { min: 50, max: 200 },
      legendary: { min: 100, max: 500 }
    };
  
    // Define the possible number of stats that can be buffed based on the rune's tier
    const buffCountRanges = {
      common: { min: 1, max: 2 },
      uncommon: { min: 1, max: 3 },
      rare: { min: 2, max: 3 },
      epic: { min: 3, max: 4 },
      legendary: { min: 3, max: 5 }
    };
  
    // Get the buff range and count range for the given tier
    const { min, max } = buffRanges[tier] || { min: 0, max: 0 };
    const { min: buffMin, max: buffMax } = buffCountRanges[tier] || { min: 0, max: 0 };
  
    // Function to generate a controlled random buff with a bias towards balanced values
    const controlledRandomBuff = () => {
      const midpoint = (min + max) / 2;
      const variance = (max - min) / 4;
      return Math.floor(midpoint + (Math.random() * variance * 2 - variance));
    };
  
    // Randomly determine how many stats will be buffed
    const numberOfBuffs = Math.floor(Math.random() * (buffMax - buffMin + 1)) + buffMin;
  
    // Create the rune object, only applying buffs to a random subset of stats
    const stats = ['attack', 'defense', 'speed', 'health'];
    const selectedStats = [];
  
    // Randomly select stats to buff
    while (selectedStats.length < numberOfBuffs) {
      const randomStat = stats[Math.floor(Math.random() * stats.length)];
      if (!selectedStats.includes(randomStat)) {
        selectedStats.push(randomStat);
      }
    }
  
    // Initialize buffs with 0, then assign buffs to selected stats
    const buffs = { attack: 0, defense: 0, speed: 0, health: 0 };
    selectedStats.forEach(stat => {
      buffs[stat] = controlledRandomBuff();
    });
  
    const rune = {
      tier: tier,
      buffs: buffs
    };
  
    return rune;
  };
  
  const determineRuneDrop = (reward) => {
    const overallDropRate = 0.15; // 15% chance that any rune will drop
    const rand = Math.random();
  
    if (rand > overallDropRate) {
      return null; // No rune dropped
    }
  
    // If a rune is to be dropped, determine its tier
    let cumulative = 0;
    for (const [tier, rate] of Object.entries(reward.runes)) {
      cumulative += rate;
      if (rand <= cumulative) {
        return generateRune(tier); // Generate the rune if within rate
      }
    }
    return null; // Fallback: no rune dropped
  };
  
  
  const applyRune = (user, rune) => {
    if (!rune) return;
  
    // Update the user's rune collection
    user.runeCollection[rune.tier] += 1;
  
    // Apply the rune buffs to the user's stats
    user.stats.runes.attack += rune.buffs.attack;
    user.stats.runes.defense += rune.buffs.defense;
    user.stats.runes.speed += rune.buffs.speed;
    user.stats.runes.health += rune.buffs.health;
  
    // Recalculate total stats
    user.stats.total.attack = user.stats.base.attack + user.stats.runes.attack;
    user.stats.total.defense = user.stats.base.defense + user.stats.runes.defense;
    user.stats.total.speed = user.stats.base.speed + user.stats.runes.speed;
    user.stats.total.health = user.stats.base.health + user.stats.runes.health;
  };
  

// Controller function for battling a dungeon
const battleDungeon = async (req, res) => {
  const { userId, dungeonId, units } = req.body;
  try {
    const user = await User.findById(userId).populate('kingdom');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const dungeon = await Dungeon.findById(dungeonId);
    if (!dungeon) {
      return res.status(404).json({ message: 'Dungeon not found' });
    }

    if (user.kingdom.actionPoints < dungeon.actionPointCost) {
      return res.status(400).json({ message: 'Not enough action points.' });
    }

    user.kingdom.actionPoints -= dungeon.actionPointCost;

    const unitDetails = await Unit.find({ _id: { $in: Object.keys(units) } });

    const battleUnits = unitDetails.map((unitDetail) => ({
      unitId: unitDetail._id.toString(),
      name: unitDetail.name,
      attack: unitDetail.attack,
      defense: unitDetail.defense,
      speed: unitDetail.speed,
      health: unitDetail.health,
      quantity: units[unitDetail._id.toString()],
    }));

    const { result, playerHealth, bossHealth, battleLog, killedUnits } = calculateTurnBasedBattleOutcome(battleUnits, user, dungeon);

    const unitsLost = await processCasualties(user._id, killedUnits);

    if (result === 'win') {
      user.kingdom.gold += dungeon.reward.gold;

      // Updated dungeon completion logic using the new structure
      let regionProgress = user.regionProgress.find(
        (entry) => entry.regionId.toString() === dungeon.region._id.toString()
      );

      if (!regionProgress) {
        // If there's no progress in this region yet, initialize it
        regionProgress = {
          regionId: dungeon.region._id.toString(),
          completedDungeons: [{ dungeonId: dungeon._id.toString(), level: dungeon.level }],
          isRegionCompleted: false,
        };
        user.regionProgress.push(regionProgress);
      } else {
        // If this dungeon is not already completed, add it to the completed list
        if (!regionProgress.completedDungeons.find((entry) => entry.dungeonId.toString() === dungeon._id.toString())) {
          regionProgress.completedDungeons.push({ dungeonId: dungeon._id.toString(), level: dungeon.level });
        }

        // Check if all dungeons in this region are now completed
        const allDungeonsInRegion = await Dungeon.find({ region: dungeon.region._id });
        const completedDungeonIds = regionProgress.completedDungeons.map((entry) => entry.dungeonId.toString());
        regionProgress.isRegionCompleted = allDungeonsInRegion.every((dungeon) => completedDungeonIds.includes(dungeon._id.toString()));
      }

      // Determine if a rune should be rewarded
      const rune = determineRuneDrop(dungeon.reward);
      if (rune) {
        applyRune(user, rune);
      }

      await user.kingdom.save();
      await user.save();

      res.status(200).json({
        message: 'You won the battle!',
        goldEarned: dungeon.reward.gold,
        unitsLost,
        battleLog,
        rune: rune ? rune : null,
        bossHealth: bossHealth,
        playerHealth: playerHealth,
      });
    } else {
      await user.save();
      res.status(200).json({
        message: 'You lost the battle.',
        goldEarned: 0,
        unitsLost,
        battleLog,
        bossHealth: bossHealth,
        playerHealth: playerHealth,
      });
    }
  } catch (error) {
    console.error('Error processing battle:', error);
    handleError(res, error);
  }
};
  
  // Exporting all relevant functions
  module.exports = {
    createDungeon,
    getAllDungeons,
    getDungeonById,
    updateDungeon,
    deleteDungeon,
    getEligibleRegionsAndDungeons,
    getEligibleDungeons,
    battleDungeon,
    calculateTurnBasedBattleOutcome,
    processCasualties,
  };