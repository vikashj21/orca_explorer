import { V2_CHAPTERS, V2_DIAGRAMS, V2_SOURCE_TITLE, V2_VIDEO_URL } from '../app/assembly-v2-data.ts';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const source = process.argv[2];
if (!source) throw new Error('Usage: node --experimental-strip-types scripts/extract-assembly-v2.mjs /path/to/videoplayback.mp4');
const probe = spawnSync('ffprobe', ['-v', 'quiet', '-show_format', '-show_streams', '-of', 'json', source], { encoding: 'utf8' });
if (probe.status !== 0) throw new Error(probe.stderr || 'Cannot inspect source video');
const metadata = JSON.parse(probe.stdout);
const stream = metadata.streams.find(s => s.codec_type === 'video');
if (stream.width !== 640 || stream.height !== 360 || Math.abs(Number(metadata.format.duration) - 5526.024133) > 1) throw new Error('This frame selection expects the supplied 640×360, 92:06 recording.');
mkdirSync('public/assembly/v2/frames', { recursive: true });
const images = Object.values(V2_DIAGRAMS).flat();
for (const image of images) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(image.seconds), '-i', source, '-frames:v', '1', '-q:v', '2', `public${image.src}`], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr || `Extraction failed at ${image.seconds}`);
}
writeFileSync('public/assembly/v2/source.json', JSON.stringify({
  title: V2_SOURCE_TITLE, url: V2_VIDEO_URL, filename: 'videoplayback.mp4', duration: Number(metadata.format.duration),
  width: stream.width, height: stream.height,
  sha256: createHash('sha256').update(readFileSync(source)).digest('hex'),
  method: 'Exact timestamp seeks; JPEG quality 2; full original frame; no crop, recolouring, or generated details.',
  chapters: V2_CHAPTERS.map((c, i) => ({ number: i + 1, title: c.title, start: c.start, end: c.end, frames: V2_DIAGRAMS[String(i + 1).padStart(2, '0')] })),
}, null, 2) + '\n');
console.log(`Extracted ${images.length} original-resolution stills across ${V2_CHAPTERS.length} steps.`);
