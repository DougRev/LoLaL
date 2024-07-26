const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const User = require('../models/User');
const Kingdom = require('../models/Kingdom');

// Get all units
router.get('/', async (req, res) => {
    try {
      const units = await Unit.find();
      res.json(units);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Create a new unit
router.post('/', async (req, res) => {
  const { name, cost, attack, defense } = req.body;

  const unit = new Unit({
    name,
    cost,
    attack,
    defense,
  });

  try {
    const newUnit = await unit.save();
    res.status(201).json(newUnit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a unit
router.put('/:id', async (req, res) => {
  const { name, cost, attack, defense } = req.body;

  try {
    const unit = await Unit.findById(req.params.id);
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    unit.name = name;
    unit.cost = cost;
    unit.attack = attack;
    unit.defense = defense;

    const updatedUnit = await unit.save();
    res.json(updatedUnit);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a unit
router.delete('/:id', async (req, res) => {
    try {
      const result = await Unit.deleteOne({ _id: req.params.id });
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Unit not found' });
      }
  
      res.json({ message: 'Unit deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

// Purchase units
router.post('/purchase', async (req, res) => {
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
});

// Assign units to offensive or defensive
router.post('/assign', async (req, res) => {
  const { userId, unitId, assignment, quantity } = req.body;
  try {
    const user = await User.findById(userId).populate('kingdom');
    if (!user || !user.kingdom) {
      return res.status(404).json({ message: 'User or Kingdom not found' });
    }

    const kingdom = user.kingdom;
    const unitToAssign = kingdom.army.find((u) => u.unit.toString() === unitId && u.assignedTo === 'unassigned');
    if (!unitToAssign || unitToAssign.quantity < parseInt(quantity, 10)) {
      return res.status(404).json({ message: 'Unit not found in army or not enough quantity' });
    }

    unitToAssign.quantity -= parseInt(quantity, 10);
    if (unitToAssign.quantity === 0) {
      kingdom.army = kingdom.army.filter(u => !(u.unit.toString() === unitId && u.assignedTo === 'unassigned'));
    }

    const unit = await Unit.findById(unitId);
    if (assignment === 'offensive') {
      kingdom.offensiveStats += unit.attack * parseInt(quantity, 10);
    } else if (assignment === 'defensive') {
      kingdom.defensiveStats += unit.defense * parseInt(quantity, 10);
    }

    let assignedUnit = kingdom.army.find((u) => u.unit.toString() === unitId && u.assignedTo === assignment);
    if (assignedUnit) {
      assignedUnit.quantity += parseInt(quantity, 10);
    } else {
      kingdom.army.push({ unit: unitId, quantity: parseInt(quantity, 10), assignedTo: assignment });
    }

    await kingdom.save();
    res.status(200).json(kingdom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reassign units
router.post('/reassign', async (req, res) => {
    const { userId, unitId, currentAssignment, newAssignment, quantity } = req.body;
    try {
      const user = await User.findById(userId).populate('kingdom');
      if (!user || !user.kingdom) {
        return res.status(404).json({ message: 'User or Kingdom not found' });
      }
  
      const kingdom = user.kingdom;
      const unitToReassign = kingdom.army.find((u) => u.unit.toString() === unitId && u.assignedTo === currentAssignment);
      if (!unitToReassign || unitToReassign.quantity < parseInt(quantity, 10)) {
        return res.status(404).json({ message: 'Unit not found in army or not enough quantity' });
      }
  
      // Decrease the quantity from the current assignment
      unitToReassign.quantity -= parseInt(quantity, 10);
      if (unitToReassign.quantity === 0) {
        kingdom.army = kingdom.army.filter(u => !(u.unit.toString() === unitId && u.assignedTo === currentAssignment));
      }
  
      const unit = await Unit.findById(unitId);
  
      // Update kingdom stats
      if (currentAssignment === 'offensive') {
        kingdom.offensiveStats -= unit.attack * parseInt(quantity, 10);
      } else if (currentAssignment === 'defensive') {
        kingdom.defensiveStats -= unit.defense * parseInt(quantity, 10);
      }
  
      if (newAssignment === 'offensive') {
        kingdom.offensiveStats += unit.attack * parseInt(quantity, 10);
      } else if (newAssignment === 'defensive') {
        kingdom.defensiveStats += unit.defense * parseInt(quantity, 10);
      }
  
      // Add to the new assignment
      let assignedUnit = kingdom.army.find((u) => u.unit.toString() === unitId && u.assignedTo === newAssignment);
      if (assignedUnit) {
        assignedUnit.quantity += parseInt(quantity, 10);
      } else {
        kingdom.army.push({ unit: unitId, quantity: parseInt(quantity, 10), assignedTo: newAssignment });
      }
  
      await kingdom.save();
      res.status(200).json(kingdom);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


module.exports = router;
