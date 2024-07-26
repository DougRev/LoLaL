const upgrades = {
  barracks: [
    { level: 1, name: 'Barracks Level 1', cost: 100, bonus: 10 },
    { level: 2, name: 'Barracks Level 2', cost: 200, bonus: 20 },
    { level: 3, name: 'Barracks Level 3', cost: 300, bonus: 30 },
    { level: 4, name: 'Barracks Level 4', cost: 400, bonus: 40 },
    { level: 5, name: 'Barracks Level 5', cost: 500, bonus: 50 }
  ],
  wallFortifications: [
    { level: 1, name: 'Wooden Palisade', cost: 100, bonus: 10 },
    { level: 2, name: 'Stone Wall', cost: 500, bonus: 50 },
    { level: 3, name: 'Fortress Wall', cost: 1000, bonus: 100 },
    { level: 4, name: 'Fortress Wall 2', cost: 2000, bonus: 200 },
    { level: 5, name: 'Fortress Wall 3', cost: 3000, bonus: 300 }
  ],
  goldProduction: [
    { level: 1, name: 'Gold Mine Level 1', cost: 500, bonus: 5 },
    { level: 2, name: 'Gold Mine Level 2', cost: 1000, bonus: 10 },
    { level: 3, name: 'Gold Mine Level 3', cost: 2000, bonus: 20 }
  ]
};

module.exports = upgrades;
