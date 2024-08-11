const Faction = require('../models/Faction');
const { deleteFile } = require('../utils/storage'); 

const createFaction = async (req, res) => {
  const { name, description, advantage, disadvantage, image } = req.body;

  try {
    let faction = new Faction({
      name,
      description,
      advantage,
      disadvantage,
      image
    });

    await faction.save();
    res.status(201).json(faction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getFactions = async (req, res) => {
  try {
    const factions = await Faction.find();
    res.json(factions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const getFactionById = async (req, res) => {
  try {
    const faction = await Faction.findById(req.params.id);
    if (!faction) {
      return res.status(404).json({ msg: 'Faction not found' });
    }
    res.json(faction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const updateFaction = async (req, res) => {
  const { name, description, advantage, disadvantage, image } = req.body;

  try {
    const faction = await Faction.findById(req.params.id);
    if (!faction) {
      return res.status(404).json({ msg: 'Faction not found' });
    }

    faction.name = name || faction.name;
    faction.description = description || faction.description;
    faction.advantage = advantage || faction.advantage;
    faction.disadvantage = disadvantage || faction.disadvantage;
    faction.image = image || faction.image;

    await faction.save();
    res.json(faction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

const deleteFaction = async (req, res) => {
    try {
      // Find the faction by ID
      const faction = await Faction.findById(req.params.id);
  
      if (!faction) {
        console.error('Faction not found for ID:', req.params.id);
        return res.status(404).json({ msg: 'Faction not found' });
      }
  
      // Optional: If you want to delete the associated image from cloud storage
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
  
      // Remove the faction from the database
      await faction.deleteOne();
  
      console.log('Faction removed:', faction);
      res.json({ msg: 'Faction removed' });
    } catch (err) {
      console.error('Error deleting faction:', err.message);
      res.status(500).send('Server error');
    }
  };
  
  
module.exports = { createFaction, getFactions, getFactionById, updateFaction, deleteFaction };
