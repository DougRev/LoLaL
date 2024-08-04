const express = require('express');
const router = express.Router();
const multer = require('multer'); // For handling file uploads
const path = require('path'); // Import path module
const fs = require('fs'); // Import fs module
const Dungeon = require('../models/Dungeon');
const User = require('../models/User');
const Unit = require('../models/Unit');
const Kingdom = require('../models/Kingdom');
const Region = require('../models/Region');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminMiddleware');
const { uploadFile, deleteFile } = require('../utils/storage'); // Import fileStorage functions

// Set up multer for file upload handling
const upload = multer({ dest: 'uploads/' }); // Temporary storage

// Get all dungeons the user is eligible to see
router.get('/', auth, async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const highestDungeonCompleted = user.highestDungeonCompleted || 0;
  
      // Ensure region is populated
      const dungeons = await Dungeon.find({ level: { $lte: highestDungeonCompleted + 1 } }).populate('region');
      res.json(dungeons);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // Get all dungeons for admin
  router.get('/all', [auth, admin], async (req, res) => {
    try {
      const dungeons = await Dungeon.find().populate('region');
      res.json(dungeons);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // Get all regions
  router.get('/regions', auth, async (req, res) => {  // Removed 'admin' middleware
    try {
      const regions = await Region.find();
      res.json(regions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
// Create a new region (Admin only)
// Include multer middleware for handling image uploads
router.post('/regions', [auth, admin, upload.single('image')], async (req, res) => {
  const { name, description } = req.body;

  try {
    // Upload image to a publicly accessible location (e.g., GCS, S3, or a public directory)
    let imageUrl = '';
    if (req.file) {
      const imageFile = req.file;
      const destination = `${imageFile.filename}${path.extname(imageFile.originalname)}`;
      imageUrl = await uploadFile(imageFile.path, destination, 'regions'); // Adjust this function to handle public URLs
      
      // Delete the temporary file
      fs.unlink(imageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary image file:', err);
      });
    }

    // Create a new region with the image URL
    const newRegion = new Region({ name, description, image: imageUrl });
    await newRegion.save();
    res.status(201).json(newRegion);
  } catch (err) {
    console.error('Error creating region:', err);
    res.status(500).json({ message: err.message });
  }
});

// Update a region (Admin only)
router.put('/regions/:id', [auth, admin, upload.single('image')], async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    // Find the existing region
    const region = await Region.findById(id);
    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    // Upload new image if provided
    let imageUrl = region.image; // Keep the existing image URL if no new image is uploaded
    if (req.file) {
      const imageFile = req.file;
      const destination = `${imageFile.filename}${path.extname(imageFile.originalname)}`;
      imageUrl = await uploadFile(imageFile.path, destination, 'regions');

      // Delete the temporary file
      fs.unlink(imageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary image file:', err);
      });

      // Optionally delete the old image file from the storage (if applicable)
      // await deleteFile(region.image); // Implement deleteFile if needed
    }

    // Update region details
    region.name = name || region.name;
    region.description = description || region.description;
    region.image = imageUrl;

    // Save the updated region
    await region.save();

    res.json(region);
  } catch (err) {
    console.error('Error updating region:', err);
    res.status(500).json({ message: err.message });
  }
});


  
// Update import statement for handling multiple file uploads
const uploadFields = upload.fields([
  { name: 'dungeonImage', maxCount: 1 },
  { name: 'bossImage', maxCount: 1 }
]);

// Create a new dungeon (Admin only)
router.post('/', [auth, admin, uploadFields], async (req, res) => {
  const { name, level, boss, reward, regionId } = req.body;

  try {
    // Fetch the region to get its name
    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(400).json({ message: 'Invalid region' });
    }
    const regionName = region.name.toLowerCase().replace(/\s+/g, '_'); // Convert region name to lowercase and replace spaces with underscores

    // Upload images to GCS
    let dungeonImageUrl = '';
    let bossImageUrl = '';

    if (req.files['dungeonImage']) {
      const dungeonImageFile = req.files['dungeonImage'][0];
      const dungeonImageDestination = `${dungeonImageFile.filename}${path.extname(dungeonImageFile.originalname)}`;
      dungeonImageUrl = await uploadFile(dungeonImageFile.path, dungeonImageDestination, regionName);
      fs.unlink(dungeonImageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary dungeon image file:', err);
      });
    }

    if (req.files['bossImage']) {
      const bossImageFile = req.files['bossImage'][0];
      const bossImageDestination = `${bossImageFile.filename}${path.extname(bossImageFile.originalname)}`;
      bossImageUrl = await uploadFile(bossImageFile.path, bossImageDestination, regionName);
      fs.unlink(bossImageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary boss image file:', err);
      });
    }

    // Create new dungeon with the image URLs
    const newDungeon = new Dungeon({
      name,
      level,
      boss: { ...boss, image: bossImageUrl },
      reward,
      region: regionId,
      image: dungeonImageUrl,
    });

    await newDungeon.save();

    res.status(201).json(newDungeon);
  } catch (err) {
    console.error('Error creating dungeon:', err);
    res.status(500).json({ message: err.message });
  }
});


// Update a dungeon (Admin only)
router.put('/:id', [auth, admin, upload.single('image')], async (req, res) => {
  const { id } = req.params;
  const { name, level, boss, reward } = req.body;
  const regionId = req.body.regionId;

  try {
    if (!regionId) {
      return res.status(400).json({ message: 'Region ID is required.' });
    }

    const region = await Region.findById(regionId);
    if (!region) {
      return res.status(400).json({ message: 'Invalid region' });
    }

    const regionName = region.name.toLowerCase().replace(/\s+/g, '_');
    let imageUrl = '';

    if (req.file) {
      const destination = `${req.file.filename}${path.extname(req.file.originalname)}`;
      imageUrl = await uploadFile(req.file.path, destination, regionName);

      // Delete the temporary file
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Failed to delete temporary file:', err);
      });
    }

    const updatedFields = { name, level, boss, reward, region: region._id };
    if (imageUrl) updatedFields.image = imageUrl;

    const updatedDungeon = await Dungeon.findByIdAndUpdate(
      id,
      updatedFields,
      { new: true }
    );

    res.json(updatedDungeon);
  } catch (err) {
    console.error('Error updating dungeon:', err.message);
    res.status(500).json({ message: err.message });
  }
});


  
  // Delete a dungeon (Admin only)
  router.delete('/:id', [auth, admin], async (req, res) => {
    const { id } = req.params;
  
    try {
      await Dungeon.findByIdAndDelete(id);
      res.json({ message: 'Dungeon deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  // Get specific dungeon details
  router.get('/:id', auth, async (req, res) => {
    const { id } = req.params;
    try {
      const user = await User.findById(req.user.id);
      const dungeon = await Dungeon.findById(id).populate('region');
  
      if (!dungeon) return res.status(404).json({ message: 'Dungeon not found' });
  
      const hasCompletedDungeon = user.highestDungeonCompleted >= dungeon.level;
  
      // Send limited data if not completed
      if (!hasCompletedDungeon) {
        return res.json({
          name: `Dungeon ${dungeon.level}`,
          description: 'A mysterious place. You need to explore it to know more.',
        });
      }
  
      // Send full data if completed
      res.json(dungeon);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  

const MIN_DAMAGE = 1;

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

  console.log(`Initial Player Health: ${playerHealth}, Boss Health: ${bossHealth}`);

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


const processCasualties = async (userId, killedUnits) => {
  try {
    const kingdom = await Kingdom.findOne({ user: userId });
    if (!kingdom) {
      console.error('Kingdom not found for user:', userId);
      return;
    }

    const unitsLost = {};

    killedUnits.forEach(killedUnit => {
      const killedUnitId = killedUnit.id;
      const unitIndex = kingdom.army.findIndex(armyUnit => armyUnit.unit.toString() === killedUnitId);
      if (unitIndex > -1) {
        const unitName = kingdom.army[unitIndex].unit.name; // Get the unit name
        if (!unitsLost[unitName]) {
          unitsLost[unitName] = 0;
        }
        unitsLost[unitName]++; // Increment the count of units lost

        kingdom.army[unitIndex].quantity--;
        if (kingdom.army[unitIndex].quantity <= 0) {
          kingdom.army.splice(unitIndex, 1); // Remove the unit from the army if quantity is 0 or less
        }
      }
    });

    await kingdom.save();
    console.log('Updated kingdom army:', kingdom.army);
    return unitsLost;
  } catch (error) {
    console.error('Error processing casualties:', error);
    return {};
  }
};

const generateRune = (tier) => {
  // Define the possible buff ranges based on the rune's tier
  const buffRanges = {
    common: { min: 1, max: 3 },
    uncommon: { min: 3, max: 6 },
    rare: { min: 6, max: 10 },
    epic: { min: 10, max: 15 },
    legendary: { min: 15, max: 20 }
  };

  // Get the buff range for the given tier
  const { min, max } = buffRanges[tier] || { min: 0, max: 0 };

  // Generate random buffs within the range
  const randomBuff = () => Math.floor(Math.random() * (max - min + 1)) + min;

  // Create the rune object with random buffs
  const rune = {
    tier: tier,
    buffs: {
      attack: randomBuff(),
      defense: randomBuff(),
      speed: randomBuff(),
      health: randomBuff()
    }
  };

  return rune;
};

const determineRuneDrop = (reward) => {
  const rand = Math.random();
  let cumulative = 0;
  for (const [tier, rate] of Object.entries(reward.runes)) {
    cumulative += rate;
    if (rand <= cumulative) {
      return generateRune(tier); // Call the generateRune function
    }
  }
  return null; // No rune dropped
};

const applyRune = (user, rune) => {
  if (!rune) return;

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

router.post('/battle', async (req, res) => {
  const { userId, dungeonId, units } = req.body;

  try {
    // Fetch the user
    const user = await User.findById(userId).populate('kingdom');
    if (!user) {
        console.error(`User not found: ${userId}`);
        return res.status(404).json({ message: 'User not found' });
      }
      
    // Fetch the dungeon
    const dungeon = await Dungeon.findById(dungeonId);

    if (!user || !dungeon) {
      console.error('User or dungeon not found:', { user, dungeon });
      return res.status(404).json({ message: 'User or dungeon not found' });
    }

    // Fetch unit details
    const unitDetails = await Unit.find({ _id: { $in: Object.keys(units) } });

    // Map unit details to battle units
    const battleUnits = unitDetails.map(unitDetail => ({
      unitId: unitDetail._id.toString(),
      name: unitDetail.name,
      attack: unitDetail.attack,
      defense: unitDetail.defense,
      speed: unitDetail.speed,
      health: unitDetail.health,
      quantity: units[unitDetail._id.toString()],
    }));

    // Calculate battle outcome
    const { result, playerHealth, bossHealth, battleLog, killedUnits } = calculateTurnBasedBattleOutcome(battleUnits, user, dungeon);

    // Process casualties
    const unitsLost = await processCasualties(user._id, killedUnits);

    // Determine and apply rewards/losses based on result
    if (result === 'win') {
      user.kingdom.gold += dungeon.reward.gold;
      if (user.highestDungeonCompleted < dungeon.level) {
        user.highestDungeonCompleted = dungeon.level;
      }

      // Determine rune drop
      const rune = determineRuneDrop(dungeon.reward);
      applyRune(user, rune);

      await user.kingdom.save();
      await user.save();

      res.status(200).json({
        message: 'You won the battle!',
        goldEarned: dungeon.reward.gold,
        unitsLost,
        battleLog,
        rune: rune ? rune : null,
        bossHealth: bossHealth, // Send remaining boss health
        playerHealth: playerHealth, // Send remaining player health
      });
    } else {
      res.status(200).json({
        message: 'You lost the battle.',
        goldEarned: 0,
        unitsLost,
        battleLog,
        bossHealth: bossHealth, // Send remaining boss health
        playerHealth: playerHealth, // Send remaining player health
      });
    }
  } catch (err) {
    console.error('Error in battle:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
