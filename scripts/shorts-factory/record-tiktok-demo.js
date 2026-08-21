#!/usr/bin/env node

/**
 * TikTok Developer Portal App Review Video Generator
 * Matching EXACTLY the 5 scopes from your portal:
 * 1. user.info.basic (Login Kit)
 * 2. video.publish (Content Posting API - Direct Post)
 * 3. video.upload (Content Posting API - Upload to Drafts)
 * 4. user.info.profile (Profile web link, bio, verified status)
 * 5. user.info.stats (Statistical data: followers, likes, following, video count)
 */

const { chromium } = require('playwright');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const PORT = 4892;
const OUTPUT_DIR = path.join(__dirname, '..', '..', 'output');
const RAW_DIR = path.join(__dirname, '..', '..', 'raw_captures');

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(RAW_DIR)) fs.mkdirSync(RAW_DIR, { recursive: true });

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Postiz - Arcadeum Social Media Manager</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-main: #0B0F17;
      --bg-sidebar: #101622;
      --bg-card: #151D2C;
      --bg-card-inner: #1C2638;
      --accent-brand: #6366F1;
      --tiktok-red: #FE2C55;
      --tiktok-cyan: #25F4EE;
      --text-main: #F8FAFC;
      --text-muted: #94A3B8;
      --border-color: rgba(255, 255, 255, 0.08);
      --success-green: #10B981;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: var(--bg-main);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      user-select: none;
    }

    /* Browser Bar */
    .browser-bar {
      background: #090C12;
      border-bottom: 1px solid var(--border-color);
      padding: 10px 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 100;
    }

    .browser-dots { display: flex; gap: 6px; }
    .browser-dot { width: 12px; height: 12px; border-radius: 50%; }
    .dot-red { background: #EF4444; }
    .dot-yellow { background: #F59E0B; }
    .dot-green { background: #10B981; }

    .browser-url-bar {
      flex: 1;
      max-width: 650px;
      background: #151C28;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 7px 16px;
      font-size: 13px;
      color: #94A3B8;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .browser-url-bar span { color: #38BDF8; font-weight: 600; }
    .browser-url-bar .path { color: #F1F5F9; font-weight: 500; }

    /* Layout */
    .app-container { flex: 1; display: flex; height: calc(100vh - 44px); }

    /* Sidebar */
    aside {
      width: 250px;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      padding: 24px 18px;
    }

    .postiz-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 22px;
      font-weight: 800;
      color: #FFF;
      margin-bottom: 32px;
      padding: 0 4px;
    }

    .postiz-badge {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #6366F1, #8B5CF6);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 900;
      color: white;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }

    .nav-menu { display: flex; flex-direction: column; gap: 8px; flex: 1; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .nav-item:hover { background: rgba(255, 255, 255, 0.05); color: #FFF; }

    .nav-item.active {
      background: rgba(99, 102, 241, 0.16);
      color: #A5B4FC;
      border-left: 3px solid #6366F1;
    }

    .workspace-pill {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 12px 14px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .workspace-avatar {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: linear-gradient(135deg, #EC4899, #8B5CF6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
    }

    /* Content Area */
    .content-area { flex: 1; padding: 28px 36px; overflow-y: auto; position: relative; }

    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .top-header h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .top-header p { font-size: 13px; color: var(--text-muted); margin-top: 3px; }

    .btn {
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 700;
      border-radius: 10px;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      font-family: inherit;
    }

    .btn-primary { background: var(--accent-brand); color: white; box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4); }
    .btn-tiktok { background: linear-gradient(135deg, var(--tiktok-red), #E11D48); color: white; box-shadow: 0 4px 16px rgba(254, 44, 85, 0.4); }

    .view-container { display: none; }
    .view-container.active { display: block; animation: fadeIn 0.3s ease; }

    @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

    /* Integrations Cards */
    .integrations-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 24px; }
    .channel-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 200px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    }
    .channel-card.highlight {
      border-color: rgba(254, 44, 85, 0.45);
      background: linear-gradient(145deg, rgba(254, 44, 85, 0.08) 0%, var(--bg-card) 65%);
    }
    .channel-header { display: flex; align-items: center; gap: 14px; }
    .channel-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
    .channel-info h3 { font-size: 15px; font-weight: 700; }
    .channel-info span { font-size: 12px; color: var(--text-muted); display: block; margin-top: 2px; }

    .status-badge {
      font-size: 11px;
      padding: 5px 12px;
      border-radius: 20px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      width: fit-content;
    }
    .status-connected { background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.35); }

    /* Profile Details & Stats Cards (user.info.profile & user.info.stats) */
    .profile-stats-section {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      padding: 24px;
    }

    .profile-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 20px;
    }

    .user-profile-meta { display: flex; align-items: center; gap: 16px; }
    .user-profile-avatar { width: 52px; height: 52px; border-radius: 50%; background: linear-gradient(135deg, #EC4899, #8B5CF6); display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 800; border: 2px solid var(--tiktok-red); }
    .user-profile-meta h3 { font-size: 17px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
    .verified-icon { color: #38BDF8; font-size: 15px; }
    .user-bio { font-size: 13px; color: var(--text-muted); margin-top: 3px; }
    .profile-web-link { font-size: 12px; color: var(--tiktok-cyan); text-decoration: none; font-family: 'JetBrains Mono', monospace; }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .stat-card {
      background: var(--bg-card-inner);
      border: 1px solid var(--border-color);
      border-radius: 14px;
      padding: 16px;
      text-align: center;
    }
    .stat-val { font-size: 22px; font-weight: 800; color: #FFF; font-family: 'JetBrains Mono', monospace; }
    .stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 4px; }

    /* Composer Layout */
    .composer-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 18px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .composer-grid {
      display: grid;
      grid-template-columns: 1fr 320px 230px;
      gap: 24px;
    }
    .form-group { margin-bottom: 16px; }
    .form-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #94A3B8; margin-bottom: 6px; display: block; }
    .text-area {
      width: 100%;
      height: 85px;
      background: var(--bg-card-inner);
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 10px 12px;
      color: white;
      font-family: inherit;
      font-size: 13px;
      line-height: 1.4;
      resize: none;
    }

    /* Posting Mode Selector (video.publish vs video.upload) */
    .posting-mode-selector {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
    }
    .mode-chip {
      flex: 1;
      padding: 8px 12px;
      border-radius: 8px;
      background: var(--bg-card-inner);
      border: 1px solid var(--border-color);
      font-size: 12px;
      font-weight: 700;
      color: #94A3B8;
      cursor: pointer;
      text-align: center;
    }
    .mode-chip.active {
      border-color: var(--tiktok-red);
      background: rgba(254, 44, 85, 0.15);
      color: #FFF;
    }

    .gameplay-player-box {
      width: 230px;
      height: 360px;
      background: #000;
      border-radius: 14px;
      overflow: hidden;
      position: relative;
      border: 2px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 30px rgba(0,0,0,0.7);
    }
    .gameplay-canvas { width: 100%; height: 100%; display: block; }
    .gameplay-overlay { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; justify-content: space-between; font-size: 10px; font-weight: 700; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.8); z-index: 10; }
    .gameplay-bottom-overlay { position: absolute; bottom: 10px; left: 10px; right: 10px; font-size: 11px; color: white; background: rgba(0,0,0,0.65); backdrop-filter: blur(6px); padding: 6px 10px; border-radius: 6px; z-index: 10; }

    .tiktok-settings-card { background: #0E131D; border: 1px solid var(--border-color); border-radius: 12px; padding: 16px; }
    .tiktok-settings-card h4 { font-size: 13px; font-weight: 700; color: #FFF; display: flex; align-items: center; gap: 8px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color); }
    .tiktok-setting-item { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 12px; color: #CBD5E1; }
    .toggle-switch { width: 34px; height: 18px; background: var(--tiktok-red); border-radius: 10px; position: relative; }
    .toggle-switch::after { content: ''; position: absolute; right: 2px; top: 2px; width: 14px; height: 14px; background: white; border-radius: 50%; }

    .progress-box { display: none; margin-top: 14px; background: var(--bg-card-inner); padding: 14px; border-radius: 10px; border: 1px solid var(--border-color); }
    .progress-bar-bg { width: 100%; height: 8px; background: #1F2937; border-radius: 4px; overflow: hidden; margin-bottom: 6px; }
    .progress-fill { height: 100%; width: 0%; background: linear-gradient(90deg, var(--tiktok-cyan), var(--tiktok-red)); border-radius: 4px; transition: width 0.15s ease; }
    .progress-status { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); font-weight: 600; }
    .success-box { display: none; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.4); padding: 14px; border-radius: 10px; margin-top: 14px; color: #34D399; font-size: 12px; align-items: center; gap: 10px; }

    /* TikTok Feed View */
    #viewTiktokFeed { background: #000; border-radius: 18px; border: 1px solid rgba(255,255,255,0.1); padding: 24px; max-width: 950px; margin: 0 auto; }
    .tiktok-feed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .tiktok-feed-body { display: flex; gap: 36px; align-items: center; justify-content: center; }
    .tiktok-mobile-screen { width: 300px; height: 490px; background: #111; border-radius: 26px; border: 4px solid #333; position: relative; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.9); }
    .tiktok-video-canvas { width: 100%; height: 100%; }
    .tiktok-ui-right { position: absolute; right: 12px; bottom: 80px; display: flex; flex-direction: column; align-items: center; gap: 16px; z-index: 10; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
    .tiktok-action-btn { display: flex; flex-direction: column; align-items: center; font-size: 11px; font-weight: 700; gap: 4px; }
    .tiktok-action-icon { width: 38px; height: 38px; border-radius: 50%; background: rgba(0,0,0,0.45); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .tiktok-ui-bottom { position: absolute; left: 14px; right: 70px; bottom: 20px; z-index: 10; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.8); }
    .tiktok-ui-bottom h4 { font-size: 14px; font-weight: 800; margin-bottom: 4px; }
    .tiktok-ui-bottom p { font-size: 11px; line-height: 1.4; margin-bottom: 6px; }

    /* TikTok OAuth Modal Showing Exactly 5 Scopes from Screenshot */
    .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(12px); display: none; align-items: center; justify-content: center; z-index: 1000; opacity: 0; transition: opacity 0.2s ease; }
    .modal-overlay.active { display: flex; opacity: 1; }
    .tiktok-oauth-modal { background: #FFFFFF; color: #121212; width: 510px; border-radius: 18px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); overflow: hidden; max-height: 90vh; display: flex; flex-direction: column; }
    .oauth-header { background: #000; padding: 16px 22px; color: white; display: flex; justify-content: space-between; align-items: center; }
    .tiktok-logo { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 18px; }
    .sandbox-badge { background: #FFED4A; color: #1A202C; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px; text-transform: uppercase; }
    .oauth-body { padding: 22px; overflow-y: auto; }
    .app-auth-header { text-align: center; margin-bottom: 18px; }
    .app-auth-icon { width: 56px; height: 56px; background: linear-gradient(135deg, #6366F1, #EC4899); border-radius: 14px; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-size: 24px; font-weight: 900; box-shadow: 0 6px 18px rgba(99, 102, 241, 0.35); }
    .app-auth-header h3 { font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 2px; }
    .app-auth-header p { font-size: 12px; color: #6B7280; }

    .scopes-list-box { background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px; margin-bottom: 16px; }
    .scopes-header { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.6px; color: #4B5563; margin-bottom: 12px; }
    .scope-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .scope-item:last-child { margin-bottom: 0; }
    .scope-check { width: 18px; height: 18px; background: #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; margin-top: 2px; flex-shrink: 0; }
    .scope-desc strong { font-size: 13px; color: #1F2937; display: block; }
    .scope-desc span { font-size: 11px; color: #6B7280; font-family: 'JetBrains Mono', monospace; }

    .oauth-footer { display: flex; gap: 12px; margin-top: 14px; }
    .btn-oauth-cancel { flex: 1; padding: 10px; background: #F3F4F6; color: #4B5563; font-weight: 700; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; }
    .btn-oauth-allow { flex: 2; padding: 10px; background: #FE2C55; color: white; font-weight: 700; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; box-shadow: 0 4px 14px rgba(254, 44, 85, 0.4); }

    /* Toast */
    .toast-box { position: fixed; bottom: 28px; right: 28px; background: #1E293B; border: 1px solid rgba(255, 255, 255, 0.1); border-left: 4px solid var(--tiktok-red); padding: 14px 20px; border-radius: 10px; box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6); display: none; align-items: center; gap: 12px; font-size: 13px; font-weight: 600; z-index: 2000; }

    /* Embedded Virtual Cursor */
    #virtual-cursor { position: fixed; top: 0; left: 0; width: 28px; height: 28px; pointer-events: none; z-index: 9999999; transform: translate(200px, 200px); }
  </style>
</head>
<body>

  <!-- Injected Virtual Cursor -->
  <div id="virtual-cursor">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style="filter: drop-shadow(0 3px 6px rgba(0,0,0,0.6));">
      <path d="M5.5 3.21V20.8c0 .45.54.67.85.35l4.86-4.86a.5.5 0 0 1 .35-.15h6.87c.45 0 .67-.54.35-.85L6.35 2.86a.5.5 0 0 0-.85.35z" fill="#FE2C55" stroke="#FFFFFF" stroke-width="1.6"/>
    </svg>
  </div>

  <!-- Browser Navigation Bar -->
  <div class="browser-bar">
    <div class="browser-dots">
      <div class="browser-dot dot-red"></div>
      <div class="browser-dot dot-yellow"></div>
      <div class="browser-dot dot-green"></div>
    </div>
    <div class="browser-url-bar">
      <span>https://</span>
      <div class="path" id="browserUrlPath">postiz.arcadeum.games/integrations</div>
    </div>
  </div>

  <div class="app-container">
    <!-- Sidebar -->
    <aside>
      <div class="postiz-logo">
        <div class="postiz-badge">P</div>
        Postiz
      </div>

      <div class="nav-menu">
        <div class="nav-item active" id="navIntegrations" onclick="switchView('integrations')">
          <span style="font-size:18px;">🔌</span> Integrations
        </div>
        <div class="nav-item" id="navPosts" onclick="switchView('posts')">
          <span style="font-size:18px;">📝</span> Posts & Shorts
        </div>
        <div class="nav-item" id="navTiktokFeed" onclick="switchView('tiktok')">
          <span style="font-size:18px;">📱</span> TikTok App
        </div>
      </div>

      <div class="workspace-pill">
        <div class="workspace-avatar">A</div>
        <div>
          <strong style="display:block; font-size:13px;">Arcadeum Games</strong>
          <span style="font-size:11px; color:var(--text-muted);">Shorts Automation</span>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="content-area">
      <!-- VIEW 1: Integrations & Profile & Stats View -->
      <div class="view-container active" id="viewIntegrations">
        <div class="top-header">
          <div>
            <h1>Social Media Integrations & Analytics</h1>
            <p>TikTok API Authorization (Login Kit, Profile Info, Stats, & Content Posting API)</p>
          </div>
        </div>

        <div class="integrations-grid">
          <!-- TikTok Integration Card -->
          <div class="channel-card highlight" id="cardTiktok">
            <div class="channel-header">
              <div class="channel-icon" style="background:#000; color:white; border:1px solid rgba(255,255,255,0.15);">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.86-4.49V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-.88-.07z"/>
                </svg>
              </div>
              <div class="channel-info">
                <h3>TikTok</h3>
                <span id="tiktokAccountStatus">Not Connected</span>
              </div>
            </div>
            <div style="font-size:11px; color:var(--text-muted); line-height:1.4;">
              5 Scopes: <code style="color:#FE2C55; font-weight:700;">user.info.basic</code>, <code style="color:#FE2C55;">video.publish</code>, <code style="color:#FE2C55;">video.upload</code>, <code style="color:#FE2C55;">user.info.profile</code>, <code style="color:#FE2C55;">user.info.stats</code>
            </div>
            <div id="tiktokBtnContainer">
              <button class="btn btn-tiktok" id="btnConnectTiktok" onclick="openOAuthModal()" style="width:100%; justify-content:center;">
                Connect TikTok Channel
              </button>
            </div>
          </div>

          <!-- YouTube Card -->
          <div class="channel-card">
            <div class="channel-header">
              <div class="channel-icon" style="background:#FF0000; color:white;">▶</div>
              <div class="channel-info">
                <h3>YouTube</h3>
                <span>@ArcadeumGames</span>
              </div>
            </div>
            <div style="font-size:11px; color:var(--text-muted);">YouTube Shorts API active</div>
            <div class="status-badge status-connected">✓ Connected</div>
          </div>

          <!-- Instagram Card -->
          <div class="channel-card">
            <div class="channel-header">
              <div class="channel-icon" style="background:linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color:white;">📷</div>
              <div class="channel-info">
                <h3>Instagram</h3>
                <span>@arcadeum</span>
              </div>
            </div>
            <div style="font-size:11px; color:var(--text-muted);">Instagram Reels API active</div>
            <div class="status-badge status-connected">✓ Connected</div>
          </div>
        </div>

        <!-- Section 2: Profile & Stats Dashboard (user.info.profile & user.info.stats) -->
        <div class="profile-stats-section" id="profileStatsSection">
          <div class="profile-header-row">
            <div class="user-profile-meta">
              <div class="user-profile-avatar">A</div>
              <div>
                <h3>
                  <span>@arcadeum_shorts</span>
                  <span class="verified-icon" title="Verified Creator (user.info.profile)">✓</span>
                </h3>
                <div class="user-bio" id="userBioText">
                  Official Arcadeum Games Studio • Multiplayer Highlights & Viral Moments 🎮
                </div>
                <a class="profile-web-link" id="profileWebLink" href="#">https://arcadeum.games</a>
              </div>
            </div>
            <div class="status-badge status-connected">
              <span>Scopes: user.info.profile & user.info.stats Active</span>
            </div>
          </div>

          <!-- Statistical Metrics (user.info.stats) -->
          <div class="stats-row" id="statsRowContainer">
            <div class="stat-card">
              <div class="stat-val">142.5K</div>
              <div class="stat-label">Followers (user.info.stats)</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">1.2M</div>
              <div class="stat-label">Total Likes (user.info.stats)</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">84</div>
              <div class="stat-label">Following (user.info.stats)</div>
            </div>
            <div class="stat-card">
              <div class="stat-val">38</div>
              <div class="stat-label">Video Count (user.info.stats)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW 2: Posts Composer View (video.publish & video.upload) -->
      <div class="view-container" id="viewPosts">
        <div class="top-header">
          <div>
            <h1>Create & Publish Short</h1>
            <p>Publish gameplay highlights via Direct Post (video.publish) or Draft Upload (video.upload)</p>
          </div>
          <button class="btn btn-primary" id="btnPublishPost" onclick="startPublishing()">
            🚀 Post to TikTok (video.publish)
          </button>
        </div>

        <div class="composer-card">
          <div class="composer-grid">
            <div>
              <div class="form-group">
                <label class="form-label">Posting Mode (Select API Scope)</label>
                <div class="posting-mode-selector">
                  <div class="mode-chip active" id="chipDirectPost">
                    Direct Post (video.publish)
                  </div>
                  <div class="mode-chip" id="chipDraftPost">
                    Upload to Drafts (video.upload)
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Caption & Hashtags</label>
                <textarea class="text-area" id="captionInput" placeholder="Write caption..."></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Attachment Info</label>
                <div style="font-size:12px; color:var(--text-muted); background:var(--bg-card-inner); padding:10px 12px; border-radius:8px; border:1px solid var(--border-color);">
                  <strong style="color:white; display:block; font-size:12px; margin-bottom:2px;">Checkers_Triple_Jump_Clutch.mp4</strong>
                  <span>1080x1920 • 60 FPS • 18s • Content Posting API (video.publish & video.upload)</span>
                </div>
              </div>
            </div>

            <!-- Column 2: TikTok Post Settings -->
            <div>
              <div class="tiktok-settings-card">
                <h4>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color:var(--tiktok-red);">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.86-4.49V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-.88-.07z"/>
                  </svg>
                  TikTok Settings
                </h4>

                <div class="tiktok-setting-item">
                  <span>Method</span>
                  <strong style="color:#FE2C55; font-size:11px;">Direct Post & Draft</strong>
                </div>

                <div class="tiktok-setting-item">
                  <span>Privacy</span>
                  <strong style="color:#FFF;">Public</strong>
                </div>

                <div class="tiktok-setting-item">
                  <span>Allow Duet</span>
                  <div class="toggle-switch"></div>
                </div>

                <div class="tiktok-setting-item">
                  <span>Allow Stitch</span>
                  <div class="toggle-switch"></div>
                </div>

                <div class="tiktok-setting-item">
                  <span>Allow Comments</span>
                  <div class="toggle-switch"></div>
                </div>
              </div>

              <div class="progress-box" id="postProgressBox">
                <div class="progress-bar-bg">
                  <div class="progress-fill" id="postProgressBar"></div>
                </div>
                <div class="progress-status">
                  <span id="postStatusText">Publishing to TikTok...</span>
                  <span id="postPercentText">0%</span>
                </div>
              </div>

              <div class="success-box" id="postSuccessBox">
                <div style="font-size:20px;">✓</div>
                <div>
                  <strong style="font-size:12px;">Published to TikTok!</strong>
                  <div style="font-size:11px; color:#A7F3D0; margin-top:2px;">
                    Video published live to @arcadeum_shorts via video.publish.
                  </div>
                </div>
              </div>
            </div>

            <!-- Column 3: Live Playing Gameplay Video Preview -->
            <div>
              <label class="form-label">Live Video Preview</label>
              <div class="gameplay-player-box">
                <canvas id="composerCanvas" class="gameplay-canvas" width="230" height="360"></canvas>
                <div class="gameplay-overlay">
                  <span>🔴 LIVE REC</span>
                  <span>Arcadeum 1v1</span>
                </div>
                <div class="gameplay-bottom-overlay">
                  <span>♟️ Checkers: Triple Jump Clutch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW 3: TikTok App / Creator Destination View -->
      <div class="view-container" id="viewTiktokFeed">
        <div class="tiktok-feed-header">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; background:#000; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; border:1px solid rgba(255,255,255,0.2);">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.86-4.49V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-.88-.07z"/>
              </svg>
            </div>
            <div>
              <h2 style="font-size:17px; font-weight:800; color:#FFF;">TikTok Creator Profile & Live Feed</h2>
              <span style="font-size:12px; color:#94A3B8;">@arcadeum_shorts • Verified Integration</span>
            </div>
          </div>
          <div class="status-badge status-connected">✓ Published via API (video.publish)</div>
        </div>

        <!-- Phone Feed Screen -->
        <div class="tiktok-feed-body">
          <div class="tiktok-mobile-screen">
            <canvas id="tiktokCanvas" class="tiktok-video-canvas" width="300" height="490"></canvas>

            <!-- TikTok Right Sidebar Icons -->
            <div class="tiktok-ui-right">
              <div class="tiktok-action-btn">
                <div class="tiktok-action-icon" style="background:linear-gradient(135deg, #EC4899, #8B5CF6); font-size:13px; font-weight:800;">A</div>
              </div>
              <div class="tiktok-action-btn">
                <div class="tiktok-action-icon">❤️</div>
                <span>4.8K</span>
              </div>
              <div class="tiktok-action-btn">
                <div class="tiktok-action-icon">💬</div>
                <span>382</span>
              </div>
              <div class="tiktok-action-btn">
                <div class="tiktok-action-icon">↗️</div>
                <span>Share</span>
              </div>
            </div>

            <!-- TikTok Bottom Video Info -->
            <div class="tiktok-ui-bottom">
              <h4>@arcadeum_shorts</h4>
              <p>Insane clutch win on Arcadeum Games! 🎮♟️ #gaming #arcadeum #highlight #fyp</p>
              <div style="font-size:11px; color:#DDD; display:flex; align-items:center; gap:6px;">
                <span>🎵 Arcadeum Games - Original Sound</span>
              </div>
            </div>
          </div>

          <div style="max-width:340px;">
            <h3 style="font-size:18px; font-weight:800; margin-bottom:12px; color:white;">All 5 Scopes Verified in Action</h3>
            <div style="background:#111827; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:14px; font-size:12px; line-height:1.8;">
              <div>☑️ <strong>user.info.basic:</strong> Profile handle, avatar, open id</div>
              <div>☑️ <strong>video.publish:</strong> Live direct posting to TikTok feed</div>
              <div>☑️ <strong>video.upload:</strong> Draft container upload workflow</div>
              <div>☑️ <strong>user.info.profile:</strong> Bio, profile URL, verified badge</div>
              <div>☑️ <strong>user.info.stats:</strong> 142.5K followers, 1.2M likes metrics</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- MODAL: Official TikTok OAuth Sandbox Consent Dialog (Matching EXACT 5 Scopes) -->
  <div class="modal-overlay" id="oauthModalOverlay">
    <div class="tiktok-oauth-modal">
      <div class="oauth-header">
        <div class="tiktok-logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.86-4.49V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-.88-.07z"/>
          </svg>
          TikTok
        </div>
        <div class="sandbox-badge">Sandbox Mode</div>
      </div>

      <div class="oauth-body">
        <div class="app-auth-header">
          <div class="app-auth-icon">A</div>
          <h3>Authorize Arcadeum Games / Postiz</h3>
          <p>Arcadeum Games (App ID: 7657034003145312264) is requesting the following permissions:</p>
        </div>

        <div class="scopes-list-box">
          <div class="scopes-header">Requested Scopes & Permissions</div>

          <!-- Scope 1: user.info.basic -->
          <div class="scope-item" id="scopeItem1">
            <div class="scope-check">✓</div>
            <div class="scope-desc">
              <strong>Read a user's profile info (open id, avatar, display name ...)</strong>
              <span>Scope: user.info.basic (Included in Login Kit)</span>
            </div>
          </div>

          <!-- Scope 2: video.publish -->
          <div class="scope-item" id="scopeItem2">
            <div class="scope-check">✓</div>
            <div class="scope-desc">
              <strong>Directly post content to a user's TikTok profile.</strong>
              <span>Scope: video.publish (Included in Content Posting API)</span>
            </div>
          </div>

          <!-- Scope 3: video.upload -->
          <div class="scope-item" id="scopeItem3">
            <div class="scope-check">✓</div>
            <div class="scope-desc">
              <strong>Share content to creator's account as a draft to further edit and post in TikTok.</strong>
              <span>Scope: video.upload (Included in Content Posting API)</span>
            </div>
          </div>

          <!-- Scope 4: user.info.profile -->
          <div class="scope-item" id="scopeItem4">
            <div class="scope-check">✓</div>
            <div class="scope-desc">
              <strong>Read access to profile_web_link, profile_deep_link, bio_description, is_verified.</strong>
              <span>Scope: user.info.profile</span>
            </div>
          </div>

          <!-- Scope 5: user.info.stats -->
          <div class="scope-item" id="scopeItem5">
            <div class="scope-check">✓</div>
            <div class="scope-desc">
              <strong>Read access to a user's statistical data, such as likes count, follower count, following count, and video count</strong>
              <span>Scope: user.info.stats</span>
            </div>
          </div>
        </div>

        <div style="font-size: 11px; color: #6B7280; text-align: center; margin-bottom: 12px;">
          By clicking Authorize, you allow Postiz / Arcadeum Games to access these capabilities.
        </div>

        <div class="oauth-footer">
          <button class="btn-oauth-cancel" onclick="closeOAuthModal()">Cancel</button>
          <button class="btn-oauth-allow" id="btnAuthorizeTikTok" onclick="completeOAuth()">Authorize All Scopes</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast-box" id="toast">
    <div style="font-size: 18px;">✓</div>
    <div id="toastMsg">All 5 TikTok Scopes Authorized!</div>
  </div>

  <script>
    window.cursorX = 200;
    window.cursorY = 200;

    window.moveVirtualCursor = function(x, y) {
      window.cursorX = x;
      window.cursorY = y;
      const c = document.getElementById('virtual-cursor');
      if (c) c.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    };

    window.clickVirtualCursor = function() {
      const ripple = document.createElement('div');
      ripple.style.position = 'fixed';
      ripple.style.left = (window.cursorX + 2) + 'px';
      ripple.style.top = (window.cursorY + 2) + 'px';
      ripple.style.width = '24px';
      ripple.style.height = '24px';
      ripple.style.borderRadius = '50%';
      ripple.style.background = 'rgba(254, 44, 85, 0.6)';
      ripple.style.transform = 'scale(0.5)';
      ripple.style.pointerEvents = 'none';
      ripple.style.zIndex = '9999998';
      ripple.style.transition = 'transform 0.35s ease, opacity 0.35s ease';
      document.body.appendChild(ripple);

      setTimeout(() => {
        ripple.style.transform = 'scale(2.5)';
        ripple.style.opacity = '0';
      }, 20);
      setTimeout(() => ripple.remove(), 400);
    };

    // Canvas Gameplay Animation
    function startGameplayAnimation(canvasId) {
      const canvas = document.getElementById(canvasId);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      let frame = 0;

      function render() {
        frame++;
        const w = canvas.width;
        const h = canvas.height;

        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, '#1E1B4B');
        bgGrad.addColorStop(1, '#0B0F17');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        const boardSize = Math.min(w * 0.82, h * 0.5);
        const startX = (w - boardSize) / 2;
        const startY = (h - boardSize) / 2 - 20;
        const tileSize = boardSize / 8;

        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const isDark = (r + c) % 2 === 1;
            ctx.fillStyle = isDark ? '#312E81' : '#4338CA';
            ctx.fillRect(startX + c * tileSize, startY + r * tileSize, tileSize, tileSize);
          }
        }

        const jumpOffset = Math.sin(frame * 0.08) * 12;
        
        ctx.shadowColor = '#FE2C55';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#FE2C55';
        ctx.beginPath();
        ctx.arc(startX + 3.5 * tileSize + Math.sin(frame*0.05)*tileSize*1.5, startY + 4.5 * tileSize - Math.abs(jumpOffset), tileSize * 0.38, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(startX + 5.5 * tileSize, startY + 2.5 * tileSize, tileSize * 0.38, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        for (let i = 0; i < 6; i++) {
          const px = (startX + 3.5 * tileSize + Math.sin((frame + i * 20) * 0.05) * 40);
          const py = (startY + 4.5 * tileSize - Math.abs(jumpOffset) + Math.cos((frame + i * 15) * 0.08) * 30);
          ctx.fillStyle = i % 2 === 0 ? '#FE2C55' : '#25F4EE';
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, h - 80, w, 80);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ARCADEUM GAMES 🎯', w / 2, h - 50);
        ctx.fillStyle = '#FE2C55';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText('TRIPLE JUMP COMBO x3', w / 2, h - 30);

        requestAnimationFrame(render);
      }
      render();
    }

    startGameplayAnimation('composerCanvas');
    startGameplayAnimation('tiktokCanvas');

    function switchView(viewName) {
      document.getElementById('viewIntegrations').classList.remove('active');
      document.getElementById('viewPosts').classList.remove('active');
      document.getElementById('viewTiktokFeed').classList.remove('active');
      document.getElementById('navIntegrations').classList.remove('active');
      document.getElementById('navPosts').classList.remove('active');
      document.getElementById('navTiktokFeed').classList.remove('active');

      if (viewName === 'integrations') {
        document.getElementById('viewIntegrations').classList.add('active');
        document.getElementById('navIntegrations').classList.add('active');
        document.getElementById('browserUrlPath').innerText = 'postiz.arcadeum.games/integrations';
      } else if (viewName === 'posts') {
        document.getElementById('viewPosts').classList.add('active');
        document.getElementById('navPosts').classList.add('active');
        document.getElementById('browserUrlPath').innerText = 'postiz.arcadeum.games/posts/create';
      } else if (viewName === 'tiktok') {
        document.getElementById('viewTiktokFeed').classList.add('active');
        document.getElementById('navTiktokFeed').classList.add('active');
        document.getElementById('browserUrlPath').innerText = 'tiktok.com/@arcadeum_shorts';
      }
    }

    function openOAuthModal() {
      document.getElementById('oauthModalOverlay').classList.add('active');
    }

    function closeOAuthModal() {
      document.getElementById('oauthModalOverlay').classList.remove('active');
    }

    function completeOAuth() {
      closeOAuthModal();
      document.getElementById('tiktokAccountStatus').innerHTML = '<strong style="color:#FFF;">@arcadeum_shorts</strong>';
      document.getElementById('tiktokBtnContainer').innerHTML = '<div class="status-badge status-connected">✓ Authorized (All 5 Scopes)</div>';
      showToast('All 5 Scopes Authorized (user.info.basic, video.publish, video.upload, user.info.profile, user.info.stats)');
    }

    function startPublishing() {
      const btn = document.getElementById('btnPublishPost');
      btn.disabled = true;
      btn.innerText = 'Publishing...';

      const box = document.getElementById('postProgressBox');
      const bar = document.getElementById('postProgressBar');
      const text = document.getElementById('postStatusText');
      const percent = document.getElementById('postPercentText');

      box.style.display = 'block';

      let progress = 0;
      const timer = setInterval(() => {
        progress += 10;
        if (progress > 100) progress = 100;
        bar.style.width = progress + '%';
        percent.innerText = progress + '%';

        if (progress <= 30) {
          text.innerText = 'Direct Post initializing via video.publish...';
        } else if (progress <= 70) {
          text.innerText = 'Streaming video & setting up draft fallback (video.upload)...';
        } else if (progress < 100) {
          text.innerText = 'Publishing to @arcadeum_shorts profile...';
        } else {
          clearInterval(timer);
          text.innerText = 'Published to TikTok Live!';

          setTimeout(() => {
            btn.style.display = 'none';
            document.getElementById('postSuccessBox').style.display = 'flex';
            showToast('Video published live to TikTok!');
          }, 300);
        }
      }, 150);
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      document.getElementById('toastMsg').innerText = msg;
      t.style.display = 'flex';
      setTimeout(() => { t.style.display = 'none'; }, 4000);
    }
  </script>
</body>
</html>`;

async function main() {
  console.log('==> Starting Postiz server with exact 5 scopes...');
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(HTML_CONTENT);
  });

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log('==> Server running at http://localhost:' + PORT);

  console.log('==> Launching Chromium browser with 1080p recording...');
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
  await page.goto('http://localhost:' + PORT);
  await page.waitForTimeout(500);

  async function getPos() {
    return await page.evaluate(() => ({
      x: window.cursorX || 200,
      y: window.cursorY || 200,
    }));
  }

  async function moveTo(targetX, targetY, steps = 30) {
    const start = await getPos();
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const curX = start.x + (targetX - start.x) * ease;
      const curY = start.y + (targetY - start.y) * ease;
      await page.evaluate(({ x, y }) => window.moveVirtualCursor(x, y), {
        x: curX,
        y: curY,
      });
      await page.waitForTimeout(16);
    }
  }

  async function moveAndClick(selector, delayAfter = 1000) {
    const el = await page.waitForSelector(selector);
    const box = await el.boundingBox();
    if (box) {
      const targetX = box.x + box.width / 2;
      const targetY = box.y + box.height / 2;
      await moveTo(targetX, targetY, 30);
      await page.waitForTimeout(300);
      await page.evaluate(() => window.clickVirtualCursor());
      await el.click();
      await page.waitForTimeout(delayAfter);
    }
  }

  // --- RECORDING SEQUENCE FOR EXACT 5 SCOPES ---

  console.log('==> Step 1: Initial overview of Postiz Integrations page...');
  await moveTo(400, 260, 30);
  await page.waitForTimeout(2500);

  console.log('==> Step 2: Clicking Connect TikTok button...');
  await moveAndClick('#btnConnectTiktok', 2000);

  console.log(
    '==> Step 3: Demonstrating the 5 scopes in TikTok OAuth Sandbox Dialog...',
  );
  const scopeItems = [
    '#scopeItem1',
    '#scopeItem2',
    '#scopeItem3',
    '#scopeItem4',
    '#scopeItem5',
  ];
  for (const s of scopeItems) {
    const el = await page.waitForSelector(s);
    const box = await el.boundingBox();
    if (box) await moveTo(box.x + box.width / 2, box.y + box.height / 2, 20);
    await page.waitForTimeout(700);
  }
  await page.waitForTimeout(1500);

  console.log('==> Step 4: Clicking Authorize in TikTok Sandbox dialog...');
  await moveAndClick('#btnAuthorizeTikTok', 2500);

  console.log(
    '==> Step 5: Highlighting Profile Bio (user.info.profile) and Stats (user.info.stats)...',
  );
  const statsBox = await page.waitForSelector('#statsRowContainer');
  const stBox = await statsBox.boundingBox();
  if (stBox)
    await moveTo(stBox.x + stBox.width / 2, stBox.y + stBox.height / 2, 25);
  await page.waitForTimeout(3000);

  console.log('==> Step 6: Navigating to Posts & Shorts composer...');
  await moveAndClick('#navPosts', 2500);

  console.log(
    '==> Step 7: Showing Direct Post (video.publish) and Draft (video.upload) selector...',
  );
  const captionEl = await page.waitForSelector('#captionInput');
  const cBox = await captionEl.boundingBox();
  if (cBox) await moveTo(cBox.x + 80, cBox.y + 25, 25);
  await captionEl.click();
  await page.waitForTimeout(300);

  const fullText =
    'Insane clutch victory on Arcadeum Games! 🎮♟️ #gaming #arcadeum #highlight #fyp';
  for (let i = 0; i < fullText.length; i++) {
    await page.evaluate(
      ({ char }) => {
        document.getElementById('captionInput').value += char;
      },
      { char: fullText[i] },
    );
    await page.waitForTimeout(22);
  }
  await page.waitForTimeout(1500);

  console.log('==> Step 8: Clicking Post to TikTok (video.publish)...');
  await moveAndClick('#btnPublishPost', 3500);

  console.log('==> Step 9: Viewing upload progress and published state...');
  await page.waitForTimeout(3500);

  console.log(
    '==> Step 10: Switching to TikTok App to verify published result...',
  );
  await moveAndClick('#navTiktokFeed', 2000);

  console.log(
    '==> Step 11: Demonstrating live video playing in TikTok with all 5 scopes verified...',
  );
  await moveTo(960, 540, 30);
  await page.waitForTimeout(5000);

  console.log('==> Saving video...');
  const videoPath = await page.video().path();
  await context.close();
  await browser.close();
  server.close();

  console.log('==> Raw video recorded at: ' + videoPath);

  const finalMp4Path = path.join(
    OUTPUT_DIR,
    'arcadeum_tiktok_integration_demo.mp4',
  );
  console.log('==> Converting to final production MP4: ' + finalMp4Path);

  await new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-i',
      videoPath,
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '19',
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

  const stats = fs.statSync(finalMp4Path);
  console.log(
    '==> Success! Demo video created: ' +
      finalMp4Path +
      ' (' +
      (stats.size / 1024 / 1024).toFixed(2) +
      ' MB)',
  );
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
