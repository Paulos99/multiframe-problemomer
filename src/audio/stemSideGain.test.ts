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
