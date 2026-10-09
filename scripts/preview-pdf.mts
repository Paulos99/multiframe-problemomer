/**
 * Writes a sample acoustic-profile HTML (same as PDF pages) for visual QA.
 * Usage: npx tsx scripts/preview-pdf.mts
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInitialSession, withDerived } from '../src/state/session.ts';
import { buildAcousticProfileHtml } from '../src/state/reportPdf.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../tmp');
const outFile = resolve(outDir, 'pdf-preview.html');

const base = createInitialSession();
const session = withDerived({
  ...base,
  step: 'result',
  answers: {
    ...base.answers,
    room: {
      ...base.answers.room,
      slabType: 'hollow',
      slabThickness: 'about_160_200',
      floorAbove: 'ordinary',
      houseType: 'panel',
      objectStage: 'renovation',
      plannedCeiling: 'stretch_planned',
      noisyNeighbors: 'sometimes_noisy',
      roomType: 'bedroom',
      ceilingAreaM2: 16,
      roomWish: 'from_above',
    },
  },
});

const html = await buildAcousticProfileHtml(session);
mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, html, 'utf8');
console.log(outFile);
