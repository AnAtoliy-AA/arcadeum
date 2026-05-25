const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, '../assets/shop');
const AVATARS_DIR = path.join(__dirname, '../apps/web/public/shop/avatars');
const BADGES_DIR = path.join(__dirname, '../apps/web/public/shop/badges');

// Mapping of pristine relative source assets to target public paths
const ASSET_MAPPING = [
  {
    src: path.join(SOURCE_DIR, 'default_avatar_dark_bg.png'),
    dest: path.join(AVATARS_DIR, 'default-01.png')
  },
  {
    src: path.join(SOURCE_DIR, 'fox_avatar_dark_bg.png'),
    dest: path.join(AVATARS_DIR, 'fox-01.png')
  },
  {
    src: path.join(SOURCE_DIR, 'cat_avatar_dark_bg.png'),
    dest: path.join(AVATARS_DIR, 'cat-01.png')
  },
  {
    src: path.join(SOURCE_DIR, 'dragon_avatar_dark_bg.png'),
    dest: path.join(AVATARS_DIR, 'dragon-01.png')
  },
  {
    src: path.join(SOURCE_DIR, 'phoenix_avatar_dark_bg.png'),
    dest: path.join(AVATARS_DIR, 'phoenix-01.png')
  },
  {
    src: path.join(SOURCE_DIR, 'cosmic_avatar_dark_bg.png'),
    dest: path.join(AVATARS_DIR, 'cosmic-01.png')
  },
  {
    src: path.join(SOURCE_DIR, 'wolf_avatar_dark_bg.png'),
    dest: path.join(AVATARS_DIR, 'wolf-01.png')
  },
  {
    src: path.join(SOURCE_DIR, 'panther_avatar_dark_bg.png'),
    dest: path.join(AVATARS_DIR, 'panther-01.png')
  },
  {
    src: path.join(SOURCE_DIR, 'newcomer_badge_dark_bg.png'),
    dest: path.join(BADGES_DIR, 'newcomer.png')
  },
  {
    src: path.join(SOURCE_DIR, 'veteran_badge_dark_bg.png'),
    dest: path.join(BADGES_DIR, 'veteran.png')
  },
  {
    src: path.join(SOURCE_DIR, 'champion_badge_dark_bg.png'),
    dest: path.join(BADGES_DIR, 'champion.png')
  },
  {
    src: path.join(SOURCE_DIR, 'legend_badge_dark_bg.png'),
    dest: path.join(BADGES_DIR, 'legend.png')
  },
  {
    src: path.join(SOURCE_DIR, 'elite_badge_dark_bg.png'),
    dest: path.join(BADGES_DIR, 'elite.png')
  },
  {
    src: path.join(SOURCE_DIR, 'mythic_badge_dark_bg.png'),
    dest: path.join(BADGES_DIR, 'mythic.png')
  }
];

async function removeBackgroundBFS(srcPath, destPath) {
  console.log(`Processing: ${srcPath} -> ${destPath}`);
  const image = await Jimp.read(srcPath);
  const width = image.bitmap.width;
  const height = image.bitmap.height;

  // Track visited pixels to avoid cycles
  const visited = new Uint8Array(width * height);
  const queue = [];

  function enqueue(x, y) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
      const idx = y * width + x;
      if (!visited[idx]) {
        visited[idx] = 1;
        queue.push({ x, y });
      }
    }
  }

  // Initialize BFS queue with all boundary pixels (the 4 edges)
  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  // BFS loop to find and clear outer connected dark background
  let head = 0;
  while (head < queue.length) {
    const { x, y } = queue[head++];
    const idx = (y * width + x) * 4;

    const r = image.bitmap.data[idx + 0];
    const g = image.bitmap.data[idx + 1];
    const b = image.bitmap.data[idx + 2];

    const maxVal = Math.max(r, g, b);

    // If pixel is sufficiently dark, it's part of the background propagation
    if (maxVal < 60) {
      // Clear or fade transparency based on darkness
      if (r < 15 && g < 15 && b < 15) {
        image.bitmap.data[idx + 3] = 0; // Pure background
      } else {
        // Feather transition around glow boundaries
        const factor = (maxVal - 15) / (60 - 15);
        image.bitmap.data[idx + 3] = Math.min(255, Math.max(0, Math.round(image.bitmap.data[idx + 3] * factor)));
      }

      // Propagate to 4-connected neighbors
      enqueue(x - 1, y);
      enqueue(x + 1, y);
      enqueue(x, y - 1);
      enqueue(x, y + 1);
    }
  }

  // Ensure output directory exists
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  await image.writeAsync(destPath);
  console.log(`Successfully saved processed transparent asset: ${destPath}`);
}

async function run() {
  for (const { src, dest } of ASSET_MAPPING) {
    if (fs.existsSync(src)) {
      await removeBackgroundBFS(src, dest);
    } else {
      console.warn(`Pristine source not found: ${src}`);
    }
  }
  console.log('BFS Flood-fill background removal completed successfully!');
}

run().catch(err => {
  console.error('Error running BFS background removal:', err);
  process.exit(1);
});
