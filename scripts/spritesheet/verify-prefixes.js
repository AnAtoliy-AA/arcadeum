const {
  CARD_SPRITE_MAP,
} = require('../../apps/web/src/widgets/CriticalGame/lib/constants/cards');

const keys = Object.keys(CARD_SPRITE_MAP);

for (let i = 0; i < keys.length; i++) {
  for (let j = 0; j < keys.length; j++) {
    if (i !== j && keys[j].startsWith(keys[i] + '_')) {
      console.log(`[PREFIX CLASH] ${keys[i]} is a prefix of ${keys[j]}`);
    }
  }
}
console.log('Check complete.');
