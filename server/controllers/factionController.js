const Faction = require('../models/Faction');
const { uploadFile, deleteFile } = require('../utils/storage');
const fs = require('fs');
const path = require('path');

// Create a new faction (Admin only)
const createFaction = async (req, res) => {
  const { name, description, advantage, disadvantage } = req.body;

  try {
    let factionImageUrl = '';

    if (req.file) {
      const imageFile = req.file;
      const imageDestination = `${imageFile.filename}${path.extname(imageFile.originalname)}`;
      factionImageUrl = await uploadFile(imageFile.path, imageDestination, 'factions');
      fs.unlink(imageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary faction image file:', err);
      });
    }

    const newFaction = new Faction({
      name,
      description,
      advantage,
      disadvantage,
      image: factionImageUrl,
    });

    await newFaction.save();

    res.status(201).json(newFaction);
  } catch (err) {
    console.error('Error creating faction:', err.message);
    res.status(500).send('Server error');
  }
};

// Get all factions
const getFactions = async (req, res) => {
  try {
    const factions = await Faction.find();
    res.json(factions);
  } catch (err) {
    console.error('Error fetching factions:', err.message);
    res.status(500).send('Server error');
  }
};

// Get a specific faction by ID
const getFactionById = async (req, res) => {
  try {
    const faction = await Faction.findById(req.params.id);
    if (!faction) {
      return res.status(404).json({ msg: 'Faction not found' });
    }
    res.json(faction);
  } catch (err) {
    console.error('Error fetching faction:', err.message);
    res.status(500).send('Server error');
  }
};

// Update a faction by ID (Admin only)
const updateFaction = async (req, res) => {
  const { name, description, advantage, disadvantage } = req.body;

  try {
    const faction = await Faction.findById(req.params.id);
    if (!faction) {
      return res.status(404).json({ msg: 'Faction not found' });
    }

    let factionImageUrl = faction.image;

    if (req.file) {
      // Upload new image
      const imageFile = req.file;
      const imageDestination = `${imageFile.filename}${path.extname(imageFile.originalname)}`;
      factionImageUrl = await uploadFile(imageFile.path, imageDestination, 'factions');
      fs.unlink(imageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary faction image file:', err);
      });

      // Optionally delete the old image from storage
      if (faction.image) {
        try {
          const imageUrl = new URL(faction.image);
          const fileName = imageUrl.pathname.split('/').pop();
          await deleteFile(fileName);
        } catch (error) {
          console.error('Error deleting old faction image:', error);
        }
      }
    }

    faction.name = name || faction.name;
    faction.description = description || faction.description;
    faction.advantage = advantage || faction.advantage;
    faction.disadvantage = disadvantage || faction.disadvantage;
    faction.image = factionImageUrl;

    await faction.save();

    res.json(faction);
  } catch (err) {
    console.error('Error updating faction:', err.message);
    res.status(500).send('Server error');
  }
};

// Delete a faction by ID (Admin only)
const deleteFaction = async (req, res) => {
  try {
    const faction = await Faction.findById(req.params.id);
    if (!faction) {
      return res.status(404).json({ msg: 'Faction not found' });
    }

    // Optional: Delete associated image from storage
    if (faction.image) {
      try {
        const imageUrl = new URL(faction.image);
        const fileName = imageUrl.pathname.split('/').pop();
        await deleteFile(fileName);
        console.log(`Deleted associated image: ${fileName}`);
      } catch (error) {
        console.error('Error deleting associated image:', error);
      }
    }

    await faction.deleteOne();
    res.json({ msg: 'Faction deleted successfully' });
  } catch (err) {
    console.error('Error deleting faction:', err.message);
    res.status(500).send('Server error');
  }
};

module.exports = {
  createFaction,
  getFactions,
  getFactionById,
  updateFaction,
  deleteFaction,
};
