import assert from 'node:assert/strict';
import test from 'node:test';
import { stemSideGain } from './stemCalibration';

test('пылесос: «До» ×0,8, «После» ×0,95; остальные звуки без поправки', () => {
  assert.equal(stemSideGain('vacuum', 'before'), 0.8);
  assert.equal(stemSideGain('vacuum', 'after'), 0.95);
  for (const id of ['music', 'stomp', 'clap', 'talk'] as const) {
    assert.equal(stemSideGain(id, 'before'), 1);
    assert.equal(stemSideGain(id, 'after'), 1);
  }
});

test('общая громкость ×0,7 одинаково для «До» и «После»', async () => {
  const { PLAYBACK_LEVEL, MASTER_PLAYBACK_GAIN } = await import('./stemCalibration');
  assert.equal(PLAYBACK_LEVEL, 0.7);
  assert.equal(MASTER_PLAYBACK_GAIN, 0.62);
});
