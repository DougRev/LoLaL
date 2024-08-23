const factionModifiers = {
  'Warrior Brotherhood': {
    attackMultiplier: 1.1,
    defenseStructuresMultiplier: 0.9,
    apply: (user, kingdom) => {
      user.stats.total.attack = Math.round(user.stats.total.attack * factionModifiers['Warrior Brotherhood'].attackMultiplier);
      kingdom.offensiveStats = Math.round(kingdom.offensiveStats * factionModifiers['Warrior Brotherhood'].attackMultiplier);
      kingdom.defensiveStructures = Math.round(kingdom.defensiveStructures * factionModifiers['Warrior Brotherhood'].defenseStructuresMultiplier);
    }
  },
  'Arcane Alliance': {
    runeMultiplier: 1.1,
    armyPenalty: 0.9,
    apply: (user, kingdom) => {
      user.stats.runes.attack = Math.round(user.stats.runes.attack * factionModifiers['Arcane Alliance'].runeMultiplier);
      user.stats.runes.defense = Math.round(user.stats.runes.defense * factionModifiers['Arcane Alliance'].runeMultiplier);
      user.stats.runes.speed = Math.round(user.stats.runes.speed * factionModifiers['Arcane Alliance'].runeMultiplier);
      user.stats.runes.health = Math.round(user.stats.runes.health * factionModifiers['Arcane Alliance'].runeMultiplier);
      kingdom.offensiveStats = Math.round(kingdom.offensiveStats * factionModifiers['Arcane Alliance'].armyPenalty);
    }
  },
  'Defensive Coalition': {
    defenseMultiplier: 1.15,
    goldPenalty: 0.9,
    apply: (user, kingdom) => {
      kingdom.defensiveStructures = Math.round(kingdom.defensiveStructures * factionModifiers['Defensive Coalition'].defenseMultiplier);
      kingdom.goldProductionRate = Math.round(kingdom.goldProductionRate * factionModifiers['Defensive Coalition'].goldPenalty);
    }
  },
  'Trade Consortium': {
    goldMultiplier: 1.2,
    effectivenessPenalty: 0.9,
    apply: (user, kingdom) => {
      kingdom.goldProductionRate = Math.round(kingdom.goldProductionRate * factionModifiers['Trade Consortium'].goldMultiplier);
      kingdom.offensiveStats = Math.round(kingdom.offensiveStats * factionModifiers['Trade Consortium'].effectivenessPenalty);
      kingdom.defensiveStats = Math.round(kingdom.defensiveStats * factionModifiers['Trade Consortium'].effectivenessPenalty);
    }
  },
  'Nomadic Raiders': {
    speedMultiplier: 1.1,
    healthPenalty: 0.9,
    apply: (user, kingdom) => {
      user.stats.total.speed = Math.round(user.stats.total.speed * factionModifiers['Nomadic Raiders'].speedMultiplier);
      kingdom.gold = Math.round(kingdom.gold * 1.1); // Additional raid gold chance - example
      user.stats.total.health = Math.round(user.stats.total.health * factionModifiers['Nomadic Raiders'].healthPenalty);
      kingdom.defensiveStats = Math.round(kingdom.defensiveStats * factionModifiers['Nomadic Raiders'].healthPenalty);
    }
  }
};

const applyFactionModifiers = (user, kingdom, faction) => {
  if (factionModifiers[faction.name]) {
    factionModifiers[faction.name].apply(user, kingdom);
  }
};

module.exports = { applyFactionModifiers };
