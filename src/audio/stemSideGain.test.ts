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

test('общая громкость ×0,5 одинаково для «До» и «После»', async () => {
  const { PLAYBACK_LEVEL, MASTER_PLAYBACK_GAIN } = await import('./stemCalibration');
  assert.equal(PLAYBACK_LEVEL, 0.5);
  assert.equal(MASTER_PLAYBACK_GAIN, 0.62);
});

test('громкость по типу шума: ударный и смешанный ×1/3, воздушный ×0,7, эхо ×1', async () => {
  const { groupLevel } = await import('./stemCalibration');
  assert.equal(groupLevel('impact'), 1 / 3);
  assert.equal(groupLevel('mixed'), 1 / 3);
  assert.equal(groupLevel('air'), 0.7);
  assert.equal(groupLevel('echo'), 1);
});
