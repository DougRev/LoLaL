const express = require('express');
const router = express.Router();
const multer = require('multer'); // For handling file uploads
const path = require('path'); // Import path module
const fs = require('fs'); // Import fs module
const Faction = require('../models/Faction');
const auth = require('../middleware/auth');
const admin = require('../middleware/adminMiddleware');
const { uploadFile } = require('../utils/storage'); // Import fileStorage functions
const { createFaction, getFactions, getFactionById, updateFaction, deleteFaction } = require('../controllers/factionController');

// Set up multer for file upload handling
const upload = multer({ dest: 'uploads/' }); // Temporary storage

// Route for creating a faction (Admin only)
router.post('/', [auth, admin, upload.single('image')], async (req, res) => {
  const { name, description, advantage, disadvantage } = req.body;

  try {
    // Upload image to Google Cloud Storage
    let imageUrl = '';
    if (req.file) {
      const imageFile = req.file;
      const destination = `${imageFile.filename}${path.extname(imageFile.originalname)}`;
      imageUrl = await uploadFile(imageFile.path, destination, 'factions');

      // Delete the temporary file
      fs.unlink(imageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary image file:', err);
      });
    }

    // Create a new faction with the image URL
    const newFaction = new Faction({ name, description, advantage, disadvantage, image: imageUrl });
    await newFaction.save();
    res.status(201).json(newFaction);
  } catch (err) {
    console.error('Error creating faction:', err);
    res.status(500).json({ message: err.message });
  }
});

// Route for getting all factions
router.get('/', auth, getFactions);

// Route for getting a faction by ID
router.get('/:id', auth, getFactionById);

// Route for updating a faction by ID (Admin only)
router.put('/:id', [auth, admin, upload.single('image')], async (req, res) => {
  const { id } = req.params;
  const { name, description, advantage, disadvantage } = req.body;

  try {
    // Find the existing faction
    const faction = await Faction.findById(id);
    if (!faction) {
      return res.status(404).json({ message: 'Faction not found' });
    }

    // Upload new image if provided
    let imageUrl = faction.image; // Keep the existing image URL if no new image is uploaded
    if (req.file) {
      const imageFile = req.file;
      const destination = `${imageFile.filename}${path.extname(imageFile.originalname)}`;
      imageUrl = await uploadFile(imageFile.path, destination, 'factions');

      // Delete the temporary file
      fs.unlink(imageFile.path, (err) => {
        if (err) console.error('Failed to delete temporary image file:', err);
      });
    }

    // Update faction details
    faction.name = name || faction.name;
    faction.description = description || faction.description;
    faction.advantage = advantage || faction.advantage;
    faction.disadvantage = disadvantage || faction.disadvantage;
    faction.image = imageUrl;

    // Save the updated faction
    await faction.save();

    res.json(faction);
  } catch (err) {
    console.error('Error updating faction:', err);
    res.status(500).json({ message: err.message });
  }
});

// Route for deleting a faction by ID (Admin only)
router.delete('/:id', [auth, admin], deleteFaction);

module.exports = router;
