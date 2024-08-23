const Region = require('../models/Region');
const User = require('../models/User');
const Dungeon = require('../models/Dungeon');
const fs = require('fs');
const { uploadFile } = require('../utils/storage');
const { getUnlockedRegionsAndDungeons } = require('../utils/dungeonProgression');

// Get all regions (Admin only)
const getAllRegions = async (req, res) => {
  try {
    const regions = await Region.find().sort({ level: 1 });
    res.json(regions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get regions accessible to the user
const getAccessibleRegions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const regions = await Region.find().sort({ level: 1 });
    const dungeons = await Dungeon.find();
    
    const { unlockedRegions } = getUnlockedRegionsAndDungeons(user, regions, dungeons);
    res.json(unlockedRegions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// Get dungeons for a specific region
const getRegionDungeons = async (req, res) => {
  try {
    const { regionId } = req.params;
    const dungeons = await Dungeon.find({ region: regionId });
    res.json(dungeons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new region (Admin only)
const createRegion = async (req, res) => {
  const { name, description, level } = req.body;

  try {
    let imageUrl = '';
    if (req.file) {
      const imageFile = req.file;
      const destination = `${imageFile.filename}${path.extname(imageFile.originalname)}`;
      imageUrl = await uploadFile(imageFile.path, destination, 'regions');

      // Delete the temporary file
      fs.unlink(imageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary image file:', err);
      });
    }

    const newRegion = new Region({ name, description, image: imageUrl, level });
    await newRegion.save();
    res.status(201).json(newRegion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a region (Admin only)
const updateRegion = async (req, res) => {
  const { id } = req.params;
  const { name, description, level } = req.body;

  try {
    const region = await Region.findById(id);
    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    let imageUrl = region.image;
    if (req.file) {
      const imageFile = req.file;
      const destination = `${imageFile.filename}${path.extname(imageFile.originalname)}`;
      imageUrl = await uploadFile(imageFile.path, destination, 'regions');

      fs.unlink(imageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary image file:', err);
      });
    }

    region.name = name || region.name;
    region.description = description || region.description;
    region.level = level !== undefined ? level : region.level;
    region.image = imageUrl;

    await region.save();
    res.json(region);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a region (Admin only)
const deleteRegion = async (req, res) => {
  const { id } = req.params;

  try {
    await Region.findByIdAndDelete(id);
    res.json({ message: 'Region deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllRegions, getAccessibleRegions, getRegionDungeons, createRegion, updateRegion, deleteRegion }
