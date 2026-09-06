#!/usr/bin/env node

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const OUTPUT_DIR = path.join(__dirname, '..', '..', 'output');
const RAW_DIR = path.join(__dirname, '..', '..', 'raw_captures');
const SHORT_VIDEO_PATH = path.join(OUTPUT_DIR, 'gameplay-short-1787391709329.mp4');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: RAW_DIR,
      size: { width: 1920, height: 1080 },
    },
  });

  const page = await context.newPage();

  async function naturalType(locator, text) {
    await locator.click();
    await page.waitForTimeout(200);
    for (const char of text) {
      await locator.pressSequentially(char, { delay: 35 });
    }
    await page.waitForTimeout(300);
  }

  // Scene 1: Arcadeum Platform (https://arcadeum.games)
  await page.goto('https://arcadeum.games');
  await page.waitForTimeout(2000);

  await page.evaluate(() => window.scrollBy({ top: 550, behavior: 'smooth' }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollBy({ top: 550, behavior: 'smooth' }));
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await page.waitForTimeout(1500);

  // Scene 2: Postiz Dashboard Login (https://postiz.arcadeum.games/auth/login)
  await page.goto('https://postiz.arcadeum.games/auth/login');
  await page.waitForTimeout(1500);

  const reviewerEmail = process.env.TIKTOK_REVIEWER_EMAIL;
  const reviewerPassword = process.env.TIKTOK_REVIEWER_PASSWORD;

  if (!reviewerEmail || !reviewerPassword) {
    throw new Error('TIKTOK_REVIEWER_EMAIL and TIKTOK_REVIEWER_PASSWORD environment variables are required');
  }

  const emailInput = page.locator('input[type="email"], input[name="email"]').first();
  await naturalType(emailInput, reviewerEmail);

  const passwordInput = page.locator('input[type="password"]').first();
  await naturalType(passwordInput, reviewerPassword);

  const submitBtn = page.locator('button[type="submit"]').first();
  await submitBtn.click();
  await page.waitForURL('**/launches**', { timeout: 15000 });
  await page.waitForTimeout(2500);

  // Scene 3: TikTok OAuth Integration Flow
  const addChannelBtn = page.locator('text=Add Channel').first();
  await addChannelBtn.click();
  await page.waitForTimeout(1800);

  const tiktokBtn = page.locator('text=Tiktok').first();
  await tiktokBtn.click();
  await page.waitForTimeout(4500);

  // Pause on the official TikTok OAuth URL with client_key and scopes in address bar
  await page.waitForTimeout(4000);

  // Navigate back to Postiz Calendar
  await page.goto('https://postiz.arcadeum.games/launches');
  await page.waitForTimeout(2500);

  // Scene 4: Analytics Dashboard (user.info.profile & user.info.stats)
  const analyticsNav = page.locator('text=Analytics').first();
  await analyticsNav.click();
  await page.waitForTimeout(3500);

  const tiktokChannelItem = page.locator('text=Arcadeum.games').first();
  if (await tiktokChannelItem.count() > 0) {
    await tiktokChannelItem.click();
    await page.waitForTimeout(4000);
  }

  // Scene 5: Create Post & Content Posting API (video.publish & video.upload)
  const calendarNav = page.locator('text=Calendar').first();
  await calendarNav.click();
  await page.waitForTimeout(2500);

  const createPostBtn = page.locator('text=Create Post').first();
  await createPostBtn.click();
  await page.waitForTimeout(2000);

  // Select TikTok Channel
  const channelBtns = await page.locator('button:has(img), div:has(> img)').all();
  if (channelBtns.length > 1) {
    await channelBtns[1].click();
    await page.waitForTimeout(1200);
  }

  // Type caption
  const editor = page.locator('div[contenteditable="true"], textarea').first();
  if (await editor.count() > 0) {
    await naturalType(editor, 'Clutch victory in Checkers on Arcadeum Games! 🎮♟️ #arcadeum #gaming #fyp');
  }

  // Attach video file
  if (fs.existsSync(SHORT_VIDEO_PATH)) {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(SHORT_VIDEO_PATH);
    await page.waitForTimeout(4000);
  }

  // Open TikTok Settings
  const settingsBtn = page.locator('text=Settings').first();
  await settingsBtn.click();
  await page.waitForTimeout(1500);

  // Demonstrate Content Posting Methods (video.publish & video.upload)
  const selects = await page.locator('select').all();
  if (selects.length > 1) {
    await selects[1].selectOption({ label: 'Upload content to TikTok without posting it' });
    await page.waitForTimeout(2000);
    await selects[1].selectOption({ label: 'Post content directly to TikTok' });
    await page.waitForTimeout(2000);
  }

  await page.waitForTimeout(2000);

  // Save as draft
  const saveDraftBtn = page.locator('text=Save as draft').first();
  if (await saveDraftBtn.count() > 0) {
    await saveDraftBtn.click();
    await page.waitForTimeout(4000);
  }

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  const finalMp4Path = path.join(OUTPUT_DIR, 'arcadeum_tiktok_integration_demo.mp4');
  const submissionPath = path.join(__dirname, '..', '..', 'tiktok_submission_demo.mp4');

  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-i',
      videoPath,
      '-c:v',
      'libx264',
      '-preset',
      'medium',
      '-crf',
      '22',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      finalMp4Path,
    ]);

    ffmpeg.stderr.on('data', (d) => process.stderr.write(d));
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error('ffmpeg exited with code ' + code));
    });
  });

  fs.copyFileSync(finalMp4Path, submissionPath);

  const stats = fs.statSync(finalMp4Path);
  console.log('Demo video recorded successfully: ' + finalMp4Path + ' (' + (stats.size / 1024 / 1024).toFixed(2) + ' MB)');
  console.log('Updated submission file: ' + submissionPath);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
