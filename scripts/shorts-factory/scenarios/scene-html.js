'use strict';

const { GLYPHS, parseFen, applyUci, sq } = require('./chess-board');
const { messageOf } = require('./replay-source');
const { puzzleTiming, replayTiming } = require('./timing');

/**
 * Self contained HTML scenes rendered at 1080x1920. Content is present at the
 * very first frame (no loading screen, no empty state). Each scene exposes:
 *   window.__sceneStarted (ms epoch), window.__sceneMarkerMs (when the dramatic
 *   moment lands, relative to start), window.__sceneDone (true when finished).
 */

const PALETTES = {
  default: {
    bg: '#080c18',
    light: '#e8dcc2',
    dark: '#7a5c3b',
    accent: '#8b5cf6',
    accent2: '#3b82f6',
  },
  cyberpunk: {
    bg: '#0a0618',
    light: '#3b2a6b',
    dark: '#1b1038',
    accent: '#ff2bd6',
    accent2: '#00f0ff',
  },
  underwater: {
    bg: '#04141f',
    light: '#6fb7c9',
    dark: '#1f6a85',
    accent: '#22d3ee',
    accent2: '#0ea5e9',
  },
  galaxy: {
    bg: '#05030f',
    light: '#6d5fb0',
    dark: '#2a1f5e',
    accent: '#a78bfa',
    accent2: '#f472b6',
  },
  fantasy: {
    bg: '#10091a',
    light: '#d8c3f0',
    dark: '#6b4aa0',
    accent: '#c084fc',
    accent2: '#fbbf24',
  },
  steampunk: {
    bg: '#140d07',
    light: '#d9b27a',
    dark: '#6b4423',
    accent: '#f59e0b',
    accent2: '#b45309',
  },
  zen: {
    bg: '#0b1410',
    light: '#d6e5cf',
    dark: '#6b8f71',
    accent: '#34d399',
    accent2: '#a3e635',
  },
};

function esc(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
}

/** JSON safe to embed inside an inline script tag. */
function safeJson(v) {
  return JSON.stringify(v)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function baseCss(p) {
  return `
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:1080px;height:1920px;background:${p.bg};overflow:hidden;font-family:-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:#fff}
  body{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:48px;padding:120px 60px;
    background:radial-gradient(circle at 50% 30%,${p.accent}33,transparent 60%),${p.bg}}
  .hook{font-size:84px;font-weight:900;line-height:1.05;text-align:center;letter-spacing:-1px;max-width:960px;
    background:linear-gradient(135deg,${p.accent},${p.accent2});-webkit-background-clip:text;background-clip:text;color:transparent;
    filter:drop-shadow(0 6px 24px ${p.accent}88)}
  .sub{font-size:44px;font-weight:700;opacity:.9;text-align:center;min-height:56px}
  .cta{font-size:40px;font-weight:800;padding:22px 44px;border-radius:999px;background:linear-gradient(135deg,${p.accent},${p.accent2});box-shadow:0 10px 40px ${p.accent}66}
  .count{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:420px;font-weight:900;opacity:0;text-shadow:0 0 80px ${p.accent};pointer-events:none}
  .pulse{animation:pulse .9s ease-out}
  @keyframes pulse{0%{opacity:.95;transform:translate(-50%,-50%) scale(.6)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.5)}}
  `;
}

/**
 * Chess puzzle / guess-the-move scene.
 * timeline (ms): countdown 5s -> reveal. Opponent replies fast-forward, the
 * solver's key move plays in slow motion with a zoom on the destination.
 */
function puzzleScene({ scenario, puzzle }) {
  const p = PALETTES[scenario.theme] || PALETTES.default;
  const { board, turn } = parseFen(puzzle.fen);
  const flipped = turn === 'b';
  const states = [board];
  for (const m of puzzle.solution)
    states.push(applyUci(states[states.length - 1], m));
  const moves = puzzle.solution.map((uci) => ({
    from: sq(uci.slice(0, 2)),
    to: sq(uci.slice(2, 4)),
  }));
  const isGuess = scenario.format === 'guess_the_move';
  const T = puzzleTiming(scenario);
  const cells = [];
  for (let vr = 0; vr < 8; vr++) {
    for (let vc = 0; vc < 8; vc++) {
      const r = flipped ? 7 - vr : vr;
      const c = flipped ? 7 - vc : vc;
      cells.push(
        `<div class="cell ${(r + c) % 2 === 0 ? 'l' : 'd'}" data-r="${r}" data-c="${c}"></div>`,
      );
    }
  }
  const css = `${baseCss(p)}
  .wrap{width:960px;height:960px;position:relative;border-radius:28px;overflow:hidden;box-shadow:0 30px 90px #000a,0 0 0 6px ${p.accent}66}
  .grid{transition:transform 1.2s cubic-bezier(.2,.8,.2,1);display:grid;grid-template-columns:repeat(8,120px);grid-template-rows:repeat(8,120px)}
  .cell{display:flex;align-items:center;justify-content:center;font-size:104px;line-height:1;position:relative}
  .l{background:${p.light}}.d{background:${p.dark}}
  .cell.hl::after{content:"";position:absolute;inset:0;background:${p.accent2}aa;mix-blend-mode:multiply}
  .cell.key::after{content:"";position:absolute;inset:6px;border:8px solid #facc15;border-radius:20px;box-shadow:0 0 40px #facc15}
  .piece{text-shadow:0 3px 6px #0006}
  .w{color:#fff;-webkit-text-stroke:2px #1a1a1a}.b{color:#111;-webkit-text-stroke:2px #e5e7eb}
  `;
  const script = `
  const states=${safeJson(states)};const moves=${safeJson(moves)};
  const GL=${safeJson(GLYPHS)};const isGuess=${isGuess};const T=${safeJson(T)};
  const grid=document.getElementById('grid');const wrap=document.getElementById('wrap');
  const sub=document.getElementById('sub');const count=document.getElementById('count');
  function draw(b,hl,key){document.querySelectorAll('.cell').forEach(el=>{
    const r=+el.dataset.r,c=+el.dataset.c,p=b[r][c];
    el.className='cell '+((r+c)%2===0?'l':'d');
    el.innerHTML=p?'<span class="piece '+(p===p.toUpperCase()?'w':'b')+'">'+GL[p]+'</span>':'';
    if(hl&&((hl.from.r===r&&hl.from.c===c)||(hl.to.r===r&&hl.to.c===c)))el.classList.add('hl');
    if(key&&hl&&hl.to.r===r&&hl.to.c===c)el.classList.add('key');});}
  function zoomTo(m){const x=(flip?7-m.to.c:m.to.c)*120+60,y=(flip?7-m.to.r:m.to.r)*120+60;
    grid.style.transformOrigin=x+'px '+y+'px';grid.style.transform='scale(1.35)';}
  const flip=${flipped};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  async function run(){
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    window.__sceneStarted=Date.now();draw(states[0]);
    sub.textContent=${safeJson(turn === 'w' ? 'WHITE TO MOVE' : 'BLACK TO MOVE')};
    if(T.setupMs>0)await sleep(T.setupMs);
    const H=T.hints.length;
    for(let n=T.count;n>=1;n--){
      const e=T.count-n;const hi=Math.floor(e*H/T.count);
      if(H&&(e===0||hi!==Math.floor((e-1)*H/T.count)))sub.textContent=T.hints[hi];
      count.textContent=n;count.classList.remove('pulse');void count.offsetWidth;count.classList.add('pulse');await sleep(1000);}
    sub.textContent=isGuess?'THE REVEAL':'THE ANSWER';
    window.__sceneMarkerMs=Date.now()-window.__sceneStarted;
    for(let i=0;i<moves.length;i++){
      const mine=i%2===0;const slow=mine&&i===0;
      draw(states[i+1],moves[i],mine);
      if(slow){zoomTo(moves[i]);sub.textContent='FIND THIS MOVE';await sleep(T.slowMs);grid.style.transform='scale(1)';await sleep(900);}
      else await sleep(mine?900:350);
    }
    sub.textContent='Play free on arcadeum.games';
    await sleep(T.endMs);window.__sceneDone=true;}
  run();`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=1080"><style>${css}</style></head><body>
  <div class="hook">${esc(scenario.hook)}</div>
  <div class="wrap" id="wrap"><div class="grid" id="grid">${cells.join('')}</div></div>
  <div class="sub" id="sub">&nbsp;</div><div class="cta">arcadeum.games</div><div class="count" id="count"></div>
  <script>${script}</script></body></html>`;
}

/**
 * Replay highlight scene: fast-forward the action feed up to the dramatic
 * step, then slow-motion + zoom on that moment, then the result.
 */
function replayScene({ scenario, replay, moment }) {
  const p = PALETTES[scenario.theme] || PALETTES.default;
  const names = Object.fromEntries(
    (replay.players || []).map((pl) => [pl.id, pl.displayName]),
  );
  const T = replayTiming(scenario);
  const winnerId =
    replay.result && replay.result.winnerIds && replay.result.winnerIds[0];
  const actions = replay.actions.map((a) => ({
    who: names[a.userId] || 'Player',
    msg: messageOf(a).slice(0, 90),
  }));
  const css = `${baseCss(p)}
  .feed{width:960px;height:900px;display:flex;flex-direction:column;justify-content:flex-end;gap:16px;overflow:hidden;transition:transform 1.2s cubic-bezier(.2,.8,.2,1)}
  .row{background:#ffffff14;border-radius:24px;padding:26px 34px;font-size:40px;line-height:1.2;border-left:10px solid ${p.accent2}}
  .row b{display:block;font-size:30px;opacity:.7;margin-bottom:6px}
  .row.key{background:${p.accent}55;border-left-color:#facc15;font-size:52px;box-shadow:0 0 60px ${p.accent}99}
  .bar{width:960px;height:14px;border-radius:7px;background:#ffffff22}.bar i{display:block;height:100%;width:0;border-radius:7px;background:linear-gradient(90deg,${p.accent},${p.accent2})}
  `;
  const script = `
  const A=${safeJson(actions)};const KEY=${moment.step};const T=${safeJson(T)};const W=${safeJson(winnerId ? names[winnerId] || 'Player' : '')};
  const feed=document.getElementById('feed'),bar=document.getElementById('bar'),sub=document.getElementById('sub');
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  function add(i,key){const d=document.createElement('div');d.className='row'+(key?' key':'');
    d.innerHTML='<b></b><span></span>';d.firstChild.textContent=(i+1)+'. '+A[i].who;d.lastChild.textContent=A[i].msg;
    feed.appendChild(d);while(feed.children.length>5)feed.removeChild(feed.firstChild);bar.style.width=((i+1)/A.length*100)+'%';}
  async function run(){
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    window.__sceneStarted=Date.now();
    const from=Math.max(0,KEY-T.lead);add(from,false);sub.textContent='Real match, move '+(from+1)+' of '+A.length;
    await sleep(T.introMs);
    const steps=Math.max(1,KEY-from-1);const stepMs=Math.min(2500,Math.max(180,T.buildMs/steps));
    for(let i=from+1;i<KEY;i++){add(i,false);
      sub.textContent=T.hints.length?T.hints[Math.floor((i-from-1)*T.hints.length/steps)]:'Fast forward... '+(i+1)+'/'+A.length;await sleep(stepMs);}
    sub.textContent='WATCH THIS';await sleep(700);
    window.__sceneMarkerMs=Date.now()-window.__sceneStarted;
    add(KEY,true);feed.style.transformOrigin='50% 90%';feed.style.transform='scale(1.15)';await sleep(T.keyMs);feed.style.transform='scale(1)';
    for(let i=KEY+1;i<A.length;i++){add(i,false);await sleep(T.afterMs);}
    sub.textContent=W?W+' wins!':'Game over';await sleep(1800);
    sub.textContent='Play free on arcadeum.games';await sleep(T.endMs);window.__sceneDone=true;}
  run();`;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=1080"><style>${css}</style></head><body>
  <div class="hook">${esc(scenario.hook)}</div>
  <div class="feed" id="feed"></div><div class="bar"><i id="bar"></i></div>
  <div class="sub" id="sub">&nbsp;</div><div class="cta">arcadeum.games</div>
  <script>${script}</script></body></html>`;
}

module.exports = { puzzleScene, replayScene, PALETTES, esc };
