const upgradeFormulas = {
  barracks: (level) => ({
    cost: 100 * Math.pow(level, 2),
    bonus: 1000 * level,
    name: `Barracks Level ${level}`
  }),
  wallFortifications: (level) => ({
    cost: 200 * Math.pow(level, 2),
    bonus: 200 * level,
    name: `Wall Fortification Level ${level}`
  }),
  goldProduction: (level) => ({
    cost: 500 * Math.pow(level, 2),
    bonus: 50 * level, 
    name: `Gold Production Level ${level}`
  }),
  vault: (level) => ({
    cost: 300 * Math.pow(level, 2),
    bonus: 50000 * level, 
    name: `Vault Level ${level}`
  })
};

module.exports = upgradeFormulas;
