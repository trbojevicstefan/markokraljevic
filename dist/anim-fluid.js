// Visual-only continuity policy. The combat simulation and authored key poses do not change.
// Clips with missing or unreliable optical-flow pairs (GLATKE-ANIMACIJE-IZVESTAJ.md).
// A tiny, quickly decaying shadow of the preceding authored frame softens the abrupt jump
// without synthesising new anatomy, moving hitboxes, or blurring the contact pose.
export const WEAK_MARKO_CLIPS = new Set([
  'marko-attack', 'marko-charged', 'marko-counter', 'marko-jump',
  'marko-roll', 'marko-roll-land', 'marko-death', 'marko-plunge',
  'marko-finisher', 'marko-finisher-legs', 'marko-finisher-skull',
  'marko-finisher-stomp', 'marko-getup', 'marko-hurt-air', 'marko-ledge',
  'marko-blasted', 'marko-turn', 'marko-walljump', 'marko-combo-3',
  'marko-sablja-uvis', 'marko-sablja-tezak', 'marko-sablja-skok',
  'marko-sablja-udarac-1', 'marko-air-3', 'marko-run-stop',
  'marko-knockdown', 'marko-combo-recover', 'marko-pocinak'
]);

const LOCOMOTION = new Set([
  'marko-idle', 'marko-idle-2', 'marko-idle-3', 'marko-idle-4',
  'marko-walk', 'marko-run', 'marko-run-start', 'marko-run-stop',
  'marko-turn', 'marko-crouch', 'marko-crouch-walk', 'marko-block',
  'marko-block-walk', 'marko-wounded-walk', 'marko-teeter'
]);
const AIR = new Set([
  'marko-jump', 'marko-jump-rise', 'marko-run-jump', 'marko-fall',
  'marko-land', 'marko-walljump', 'marko-wallslide', 'marko-ledge',
  'marko-hang', 'marko-climb'
]);
const SABRE_STANCES = new Set(['marko-sablja-idle', 'marko-sablja-trci']);
const VIOLENT = /(?:attack|combo(?!-recover)|charged|counter|kick|uppercut|dash-strike|plunge|finisher|brutal|hurt|death|blasted|knockdown|roll|potres|vihor|sablja-(?!idle|trci)|mounted)/;

export function fluidEase(t) {
  const u = Math.max(0, Math.min(1, t));
  return u * u * (3 - 2 * u);
}

// The old key pose is rendered behind the new one for a very short time. A new key
// pose is always full-opacity: no input, gameplay, body scale or hit window changes.
export function fluidFadeDuration(from, to, {enabled = true, reduced = false, sharp = false, sameFace = true} = {}) {
  if (!enabled || reduced || sharp || !sameFace || from === to || !from || !to) return 0;
  if (LOCOMOTION.has(from) && LOCOMOTION.has(to)) return 0.105;
  if (AIR.has(from) && AIR.has(to)) return 0.080;
  if (SABRE_STANCES.has(from) && SABRE_STANCES.has(to)) return 0.095;
  // Fast, large silhouette changes need crisp frames, not two translucent bodies.
  if (VIOLENT.test(from) || VIOLENT.test(to)) return 0;
  // Preserve short existing fades for ordinary cast/enemy idle transitions.
  return 0.055;
}

export function fluidEchoDuration(name, from, to, {
  enabled = true, reduced = false, hasFlow = false,
  keyAt = null, frames = 0
} = {}) {
  if (!enabled || reduced || hasFlow || !WEAK_MARKO_CLIPS.has(name)) return 0;
  if (!Number.isInteger(from) || !Number.isInteger(to) || from === to || from < 0 || to < 0) return 0;
  if (frames && (from >= frames || to >= frames)) return 0;
  // Authored attack windups and the hit/contact pose must remain sharp.
  if (keyAt != null && Number.isFinite(keyAt) && frames > 0) {
    const contact = Math.floor(keyAt * frames);
    if (Math.abs(from - contact) <= 1 || Math.abs(to - contact) <= 1) return 0;
  }
  return VIOLENT.test(name) ? 0.028 : 0.042;
}

export function fluidEchoAlpha(elapsed, duration) {
  if (!(duration > 0) || elapsed < 0 || elapsed >= duration) return 0;
  return 0.16 * (1 - fluidEase(elapsed / duration));
}
