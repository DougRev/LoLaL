const Unit = require('../models/Unit');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');
const { uploadFile, deleteFile } = require('../utils/storage');

// Get all units
const getAllUnits = async (req, res) => {
  try {
    const units = await Unit.find();
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get unit by ID
const getUnitById = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }
    res.json(unit);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create a new unit (admin only)
const createUnit = async (req, res) => {
  const { name, tier, cost, attack, defense, health, speed } = req.body;
  console.log(name, tier, cost, attack, defense, health, speed);

  let imageUrl = '';
  if (req.file) {
    const destination = `${Date.now()}-${req.file.originalname}`; // Use a unique filename based on the current timestamp
    try {
      imageUrl = await uploadFile(req.file.buffer, destination, 'units'); // Use the buffer directly
    } catch (error) {
      console.error('Error uploading file:', error);
      return res.status(500).json({ message: 'Error uploading file' });
    }
  }

  try {
    const newUnit = new Unit({
      name,
      attack,
      defense,
      health,
      speed,
      cost,
      tier,
      image: imageUrl, // Add image URL if provided
    });

    await newUnit.save();
    res.status(201).json(newUnit);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Update a unit by ID (admin only)
const updateUnit = async (req, res) => {
  const { id } = req.params;
  const { name, attack, defense, health, speed, cost, tier } = req.body;

  try {
    const unit = await Unit.findById(id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    let imageUrl = unit.image; // Keep the existing image URL
    if (req.file) {
      const destination = `${Date.now()}-${req.file.originalname}`;
      try {
        imageUrl = await uploadFile(req.file.buffer, destination, 'units'); // Use buffer for the upload
      } catch (error) {
        console.error('Error uploading file:', error);
        return res.status(500).json({ message: 'Error uploading file' });
      }
    }

    // Update unit fields
    if (name) unit.name = name;
    if (attack) unit.attack = attack;
    if (defense) unit.defense = defense;
    if (health) unit.health = health;
    if (speed) unit.speed = speed;
    if (cost) unit.cost = cost;
    if (tier) unit.tier = tier;
    unit.image = imageUrl; // Update image URL if a new image is uploaded

    const updatedUnit = await unit.save();
    res.json(updatedUnit);
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete a unit by ID (admin only)
const deleteUnit = async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    // Delete the associated image from Google Cloud Storage if it exists
    if (unit.image) {
      try {
        // Extract the relative image path from the URL
        const imagePath = unit.image.split(`${process.env.GCS_BUCKET}/`)[1];
        if (imagePath) {
          console.log('Deleting image from storage with path:', imagePath);
          await deleteFile(imagePath);
        }
      } catch (imageDeleteError) {
        console.error('Error deleting image from Google Cloud Storage:', imageDeleteError);
        return res.status(500).json({ message: 'Failed to delete unit image from storage' });
      }
    }

    // Use the correct deletion method
    await unit.deleteOne();
    res.json({ message: 'Unit deleted successfully' });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// Purchase units
const purchaseUnit = async (req, res) => {
  const { userId, unitId, quantity } = req.body;
  try {
    const user = await User.findById(userId).populate('kingdom');
    const unit = await Unit.findById(unitId);

    if (!user || !unit || !user.kingdom) {
      return res.status(404).json({ message: 'User, Unit, or Kingdom not found' });
    }

    const kingdom = user.kingdom;
    const cost = unit.cost * parseInt(quantity, 10);
    if (kingdom.gold < cost) {
      return res.status(400).json({ message: 'Not enough gold' });
    }

    kingdom.gold -= cost;
    const existingUnit = kingdom.army.find((u) => u.unit.toString() === unitId && u.assignedTo === 'unassigned');
    if (existingUnit) {
      existingUnit.quantity += parseInt(quantity, 10);
    } else {
      kingdom.army.push({ unit: unitId, quantity: parseInt(quantity, 10), assignedTo: 'unassigned' });
    }

    await kingdom.save();
    res.status(200).json(kingdom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Assign units to offensive or defensive
const assignUnit = async (req, res) => {
  const { userId, unitId, assignment, quantity } = req.body;
  try {
    const user = await User.findById(userId).populate('kingdom');
    if (!user || !user.kingdom) {
      return res.status(404).json({ message: 'User or Kingdom not found' });
    }

    const kingdom = user.kingdom;
    const unitToAssign = kingdom.army.find((u) => u.unit.toString() === unitId && u.assignedTo === 'unassigned');

    if (!unitToAssign) {
      return res.status(404).json({ message: 'Unit not found in army or not enough quantity' });
    }

    // If the requested quantity is greater than available, use the maximum available
    const assignQuantity = Math.min(parseInt(quantity, 10), unitToAssign.quantity);

    unitToAssign.quantity -= assignQuantity;
    if (unitToAssign.quantity === 0) {
      kingdom.army = kingdom.army.filter(u => !(u.unit.toString() === unitId && u.assignedTo === 'unassigned'));
    }

    const unit = await Unit.findById(unitId);
    if (assignment === 'offensive') {
      kingdom.offensiveStats += unit.attack * assignQuantity;
    } else if (assignment === 'defensive') {
      kingdom.defensiveStats += unit.defense * assignQuantity;
    }

    let assignedUnit = kingdom.army.find((u) => u.unit.toString() === unitId && u.assignedTo === assignment);
    if (assignedUnit) {
      assignedUnit.quantity += assignQuantity;
    } else {
      kingdom.army.push({ unit: unitId, quantity: assignQuantity, assignedTo: assignment });
    }

    await kingdom.save();
    res.status(200).json(kingdom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reassign units
const reassignUnit = async (req, res) => {
  const { userId, unitId, currentAssignment, newAssignment, quantity } = req.body;
  try {
    const user = await User.findById(userId).populate('kingdom');
    if (!user || !user.kingdom) {
      return res.status(404).json({ message: 'User or Kingdom not found' });
    }

    const kingdom = user.kingdom;
    const unitToReassign = kingdom.army.find((u) => u.unit.toString() === unitId && u.assignedTo === currentAssignment);

    if (!unitToReassign) {
      return res.status(404).json({ message: 'Unit not found in army or not enough quantity' });
    }

    // If the requested quantity is greater than available, use the maximum available
    const reassignQuantity = Math.min(parseInt(quantity, 10), unitToReassign.quantity);

    // Decrease the quantity from the current assignment
    unitToReassign.quantity -= reassignQuantity;
    if (unitToReassign.quantity === 0) {
      kingdom.army = kingdom.army.filter(u => !(u.unit.toString() === unitId && u.assignedTo === currentAssignment));
    }

    const unit = await Unit.findById(unitId);

    // Update kingdom stats
    if (currentAssignment === 'offensive') {
      kingdom.offensiveStats -= unit.attack * reassignQuantity;
    } else if (currentAssignment === 'defensive') {
      kingdom.defensiveStats -= unit.defense * reassignQuantity;
    }

    if (newAssignment === 'offensive') {
      kingdom.offensiveStats += unit.attack * reassignQuantity;
    } else if (newAssignment === 'defensive') {
      kingdom.defensiveStats += unit.defense * reassignQuantity;
    }

    // Add to the new assignment
    let assignedUnit = kingdom.army.find((u) => u.unit.toString() === unitId && u.assignedTo === newAssignment);
    if (assignedUnit) {
      assignedUnit.quantity += reassignQuantity;
    } else {
      kingdom.army.push({ unit: unitId, quantity: reassignQuantity, assignedTo: newAssignment });
    }

    await kingdom.save();
    res.status(200).json(kingdom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  purchaseUnit,
  assignUnit,
  reassignUnit,
};
