import { Supervisor } from './supervisor';
import type { Pipeline } from './pipeline';

function fakePipeline() {
  const director = {
    inGame: false,
    onDrained: null as (() => void) | null,
    requestStopAfterGame: jest.fn(),
    cancelStopAfterGame: jest.fn(),
    skipCurrent: jest.fn(),
    restartBrowser: jest.fn(() => Promise.resolve()),
  };
  const p = {
    director,
    start: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
    markFfmpegDirty: jest.fn(),
  };
  return p as unknown as Pipeline & typeof p;
}

function setup(killedRef = { v: false }) {
  const pipelines: ReturnType<typeof fakePipeline>[] = [];
  const health = { update: jest.fn() };
  const alert = jest.fn(() => Promise.resolve(true));
  const sup = new Supervisor({
    config: {
      ops: {
        killFile: 'x',
        killEnv: false,
        killPollMs: 1,
        statusFile: '',
        statusPort: 0,
        alertUrl: '',
        alertCooldownMs: 1,
      },
    },
    log: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
    health,
    alert,
    createPipeline: () => {
      const p = fakePipeline();
      pipelines.push(p);
      return p;
    },
    killed: () => killedRef.v,
  });
  return { sup, pipelines, health, alert, killedRef };
}

describe('Supervisor', () => {
  it('starts when enabled and not killed', async () => {
    const { sup, pipelines } = setup();
    await sup.tick();
    expect(pipelines).toHaveLength(1);
    expect(pipelines[0].start).toHaveBeenCalled();
  });

  it('does not start when the remote setting says stopped', async () => {
    const { sup, pipelines, health } = setup();
    sup.setRemote(false, false);
    await sup.tick();
    expect(pipelines).toHaveLength(0);
    expect(health.update).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'stopped' }),
    );
  });

  it('remote stop (not graceful) stops the pipeline now; start resumes', async () => {
    const { sup, pipelines } = setup();
    await sup.tick();
    sup.setRemote(false, false);
    await sup.tick();
    expect(pipelines[0].stop).toHaveBeenCalled();
    expect(sup.pipeline).toBeNull();
    sup.setRemote(true, false);
    await sup.tick();
    expect(pipelines).toHaveLength(2);
  });

  it('graceful stop waits for the running game, then stops', async () => {
    const { sup, pipelines } = setup();
    await sup.tick();
    const p = pipelines[0];
    p.director.inGame = true;
    sup.setRemote(false, true);
    await sup.tick();
    expect(p.director.requestStopAfterGame).toHaveBeenCalled();
    expect(p.stop).not.toHaveBeenCalled();
    p.director.onDrained?.();
    await new Promise((r) => setImmediate(r));
    expect(p.stop).toHaveBeenCalled();
  });

  it('graceful stop with no game running stops immediately', async () => {
    const { sup, pipelines } = setup();
    await sup.tick();
    sup.setRemote(false, true);
    await sup.tick();
    expect(pipelines[0].stop).toHaveBeenCalled();
  });

  it('re-enabling during a graceful stop cancels it', async () => {
    const { sup, pipelines } = setup();
    await sup.tick();
    pipelines[0].director.inGame = true;
    sup.setRemote(false, true);
    await sup.tick();
    sup.setRemote(true, false);
    await sup.tick();
    expect(pipelines[0].director.cancelStopAfterGame).toHaveBeenCalled();
  });

  it('the local kill switch always wins, even when the backend says enabled', async () => {
    const { sup, pipelines, alert, killedRef, health } = setup();
    await sup.tick();
    killedRef.v = true;
    sup.setRemote(true, false);
    await sup.tick();
    expect(pipelines[0].stop).toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith('kill-switch', expect.any(String));
    expect(health.update).toHaveBeenCalledWith(
      expect.objectContaining({ state: 'killed' }),
    );
    killedRef.v = false;
    await sup.tick();
    expect(pipelines).toHaveLength(2);
  });

  it('skip only works while a game is running', async () => {
    const { sup, pipelines } = setup();
    expect(sup.skip()).toBe(false);
    await sup.tick();
    expect(sup.skip()).toBe(false);
    pipelines[0].director.inGame = true;
    expect(sup.skip()).toBe(true);
    expect(pipelines[0].director.skipCurrent).toHaveBeenCalled();
  });

  it('restartBrowser needs a running pipeline', async () => {
    const { sup } = setup();
    expect(await sup.restartBrowser()).toBe(false);
    await sup.tick();
    expect(await sup.restartBrowser()).toBe(true);
  });
});
