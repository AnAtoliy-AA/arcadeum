function buildSpriteMap(variant, cardSpriteMap) {
  const prefix = variant.replace(/-/g, '_');
  const map = { 0: `${prefix}_card_back` };

  Object.entries(cardSpriteMap).forEach(([key, index]) => {
    map[index] = `${prefix}_${key}`;
  });

  return map;
}

function buildAllSpriteMaps(gameVariants, cardSpriteMap) {
  return Object.values(gameVariants).reduce((acc, variant) => {
    acc[variant] = buildSpriteMap(variant, cardSpriteMap);
    return acc;
  }, {});
}

module.exports = { buildSpriteMap, buildAllSpriteMaps };
