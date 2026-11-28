'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  LENGTH_CLASSES,
  FORMAT_LENGTHS,
  HOOK_MAX_SEC,
  allowedLengths,
  defaultLength,
  lengthRange,
  classifyDuration,
  isWithinClass,
  planBeats,
  hookSpeechSec,
  spokenHook,
  applyLength,
} = require('..');
const { FORMATS } = require('../../scenarios/constants');
const { buildScenario, buildPool } = require('../../scenarios/library');
const { validateScenario } = require('../../scenarios/schema');

test('length classes cover short, medium, long and the weekly feature', () => {
  assert.deepEqual(lengthRange('short'), {
    minSec: 15,
    maxSec: 25,
    targetSec: 20,
  });
  assert.equal(lengthRange('medium').minSec, 35);
  assert.equal(lengthRange('medium').maxSec, 50);
  assert.equal(lengthRange('long').minSec, 60);
  assert.equal(lengthRange('long').maxSec, 90);
  assert.equal(lengthRange('feature').minSec, 120);
  assert.equal(lengthRange('feature').maxSec, 180);
  assert.throws(() => lengthRange('huge'));
  for (const c of Object.values(LENGTH_CLASSES)) {
    assert.ok(c.targetSec >= c.minSec && c.targetSec <= c.maxSec, c.id);
  }
});

test('per-format defaults: guess_the_move stays short, richer formats go longer', () => {
  assert.deepEqual(allowedLengths('guess_the_move'), ['short']);
  assert.ok(allowedLengths('puzzle').includes('medium'));
  assert.ok(allowedLengths('puzzle').includes('long'));
  assert.ok(!allowedLengths('comeback').includes('short'));
  assert.ok(!allowedLengths('replay_highlight').includes('short'));
  assert.equal(defaultLength('comeback'), 'medium');
  assert.deepEqual(allowedLengths('feature_story'), ['feature']);
  assert.deepEqual(allowedLengths('unknown_format'), ['short']);
  for (const f of FORMATS) assert.ok(FORMAT_LENGTHS[f], `${f} has lengths`);
});

test('classifyDuration and isWithinClass use the class ranges', () => {
  assert.equal(classifyDuration(20), 'short');
  assert.equal(classifyDuration(42), 'medium');
  assert.equal(classifyDuration(75), 'long');
  assert.equal(classifyDuration(150), 'feature');
  assert.equal(classifyDuration(30), null);
  assert.equal(classifyDuration(NaN), null);
  assert.equal(isWithinClass(42, 'medium'), true);
  assert.equal(isWithinClass(42, 'short'), false);
  assert.equal(isWithinClass(42, 'nope'), false);
});

test('beats have a real structure: hook by 1.5s, contiguous, CTA last', () => {
  for (const id of Object.keys(LENGTH_CLASSES)) {
    const total = LENGTH_CLASSES[id].targetSec;
    const beats = planBeats(id, total);
    assert.equal(beats[0].id, 'hook');
    assert.equal(beats[0].startSec, 0);
    assert.ok(beats[0].endSec <= HOOK_MAX_SEC);
    assert.equal(beats[beats.length - 1].id, 'cta');
    assert.equal(beats[beats.length - 1].endSec, total);
    for (let i = 1; i < beats.length; i++) {
      assert.ok(Math.abs(beats[i].startSec - beats[i - 1].endSec) < 0.01);
    }
    if (id !== 'short') {
      const ids = beats.map((b) => b.id);
      for (const need of ['setup', 'build_up', 'reveal']) {
        assert.ok(ids.includes(need), `${id} has ${need}`);
      }
      assert.ok(ids.indexOf('build_up') < ids.indexOf('reveal'));
    }
  }
  assert.ok(planBeats('feature').some((b) => b.id === 'resolution'));
});

test('spoken hook fits in 1.5s and has no em dash', () => {
  assert.ok(
    hookSpeechSec(
      spokenHook('Chess: Can you find the winning move right now?'),
    ) <= HOOK_MAX_SEC,
  );
  assert.ok(spokenHook('Short one').length > 0);
  for (const s of buildPool({ replay: true, puzzle: true })) {
    if (s.spokenHook)
      assert.ok(hookSpeechSec(s.spokenHook) <= HOOK_MAX_SEC, s.id);
  }
});

test('longer classes carry more distinct content, not repeated padding', () => {
  const wordCount = (s) => s.voiceScript.split(/\s+/).length;
  for (const format of [
    'puzzle',
    'comeback',
    'replay_highlight',
    'bot_match',
  ]) {
    const medium = buildScenario('chess', format, 'default', 'medium');
    assert.equal(medium.lengthClass, 'medium');
    const sentences = medium.voiceScript.split(/(?<=[.!?])\s+/);
    assert.equal(
      new Set(sentences).size,
      sentences.length,
      `${format} repeats a line`,
    );
    assert.ok(!/—/.test(medium.voiceScript));
    if (allowedLengths(format).includes('long')) {
      const long = buildScenario('chess', format, 'default', 'long');
      assert.ok(wordCount(long) > wordCount(medium), format);
      assert.ok(long.beats.filter((b) => b.lines.length).length >= 4, format);
    }
  }
  const feature = buildScenario('chess', 'feature_story', 'default', 'feature');
  assert.equal(feature.lengthClass, 'feature');
  assert.ok(feature.beats.some((b) => b.id === 'resolution' && b.lines.length));
});

test('short keeps the legacy one line voice', () => {
  const s = buildScenario('chess', 'guess_the_move', 'default');
  assert.equal(s.lengthClass, 'short');
  assert.equal(s.spokenHook, undefined);
  assert.match(s.voiceScript, /guess the best move/i);
});

test('applyLength falls back to the format default for a disallowed class', () => {
  const base = buildScenario('chess', 'guess_the_move', 'default');
  assert.equal(applyLength(base, 'long').lengthClass, 'short');
  const c = buildScenario('chess', 'comeback', 'default', 'short');
  assert.equal(c.lengthClass, 'medium');
});

test('every format x allowed class builds a valid scenario', () => {
  for (const format of FORMATS) {
    for (const cls of allowedLengths(format)) {
      const s = { ...buildScenario('chess', format, 'default', cls), seed: 1 };
      assert.deepEqual(validateScenario(s).errors, [], `${format}/${cls}`);
      assert.equal(s.lengthClass, cls);
      assert.ok(isWithinClass(s.durationSec, cls));
    }
  }
});

test('schema rejects bad length data', () => {
  const good = () => ({
    ...buildScenario('chess', 'puzzle', 'default', 'medium'),
    seed: 1,
  });
  assert.equal(validateScenario(good()).valid, true);
  assert.equal(
    validateScenario({ ...good(), lengthClass: 'epic' }).valid,
    false,
  );
  const noLen = good();
  delete noLen.lengthClass;
  assert.equal(validateScenario(noLen).valid, false);
  const guess = {
    ...buildScenario('chess', 'guess_the_move', 'default'),
    seed: 1,
  };
  assert.match(
    validateScenario({ ...guess, lengthClass: 'long' }).errors.join(),
    /not allowed/,
  );
  assert.match(
    validateScenario({ ...good(), durationSec: 20 }).errors.join(),
    /outside medium/,
  );
  const slowHook = good();
  slowHook.beats = slowHook.beats.map((b, i) =>
    i === 0 ? { ...b, endSec: 2.4 } : b,
  );
  assert.match(
    validateScenario(slowHook).errors.join(),
    /hook beat must end within 1.5s/,
  );
  assert.match(
    validateScenario({
      ...good(),
      spokenHook: 'one two three four five six seven',
    }).errors.join(),
    /spokenHook/,
  );
  assert.match(
    validateScenario({
      ...good(),
      voiceScript: 'word '.repeat(150).trim(),
    }).errors.join(),
    /exceeds 700|too long/,
  );
});
