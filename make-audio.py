"""Composes the soundtrack and synthesises extra sound effects (no external services).

    python make-audio.py [path-to-extracted-kenney-packs]

Writes dist/assets/music/{drum,megdan}.ogg (seamless loops) and dist/assets/sfx/*.ogg.
If a folder with the extracted Kenney CC0 packs (impact-sounds, rpg-audio) is given,
the chosen impact/footstep/blade samples are copied into dist/assets/sfx as well.
"""
import os, sys, glob, shutil
import numpy as np
import soundfile as sf
from scipy import signal

SR = 44100
ROOT = os.path.dirname(os.path.abspath(__file__))
MUSIC = os.path.join(ROOT, 'dist', 'assets', 'music')
SFX = os.path.join(ROOT, 'dist', 'assets', 'sfx')
rng = np.random.default_rng(7)


def mtof(m):
    return 440.0 * 2 ** ((np.asarray(m, float) - 69) / 12)


def adsr(n, a=.01, d=.1, s=.7, r=.2):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    e = np.full(n, s, float)
    a = min(a, n); e[:a] = np.linspace(0, 1, a, endpoint=False)
    d2 = min(d, max(0, n - a)); e[a:a + d2] = np.linspace(1, s, d2, endpoint=False)
    r = min(r, n); e[n - r:] *= np.linspace(1, 0, r)
    return e


def saw(freq, kmax=40):
    phase = np.cumsum(freq) / SR
    out = np.zeros_like(freq)
    K = int(max(1, min(kmax, SR * .45 / max(1., freq.max()))))
    for k in range(1, K + 1):
        out += np.sin(2 * np.pi * k * phase) / k
    return out * .6


def sos(kind, f, order=2):
    return signal.butter(order, f, kind, fs=SR, output='sos')


def lp(x, f, order=2): return signal.sosfilt(sos('lowpass', f, order), x)
def hp(x, f, order=2): return signal.sosfilt(sos('highpass', f, order), x)
def bp(x, lo, hi, order=2): return signal.sosfilt(sos('bandpass', [lo, hi], order), x)


def formants(x, peaks):
    out = np.zeros_like(x)
    for f, q, g in peaks:
        b, a = signal.iirpeak(f, q, fs=SR)
        out += g * signal.lfilter(b, a, x)
    return out


def noise(n): return rng.standard_normal(n)


class Mix:
    def __init__(self, seconds):
        self.n = int(seconds * SR)
        self.dry = np.zeros((2, self.n))
        self.wet = np.zeros((2, self.n))

    def add(self, t, x, pan=0., gain=1., rev=.25):
        i = int(t * SR)
        if i >= self.n: return
        x = x[:self.n - i] * gain
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        self.dry[0, i:i + len(x)] += x * l * (1 - rev * .5)
        self.dry[1, i:i + len(x)] += x * r * (1 - rev * .5)
        self.wet[0, i:i + len(x)] += x * l * rev
        self.wet[1, i:i + len(x)] += x * r * rev

    def render(self, loop_len=None, rt=2.6):
        ln = int(rt * SR)
        t = np.arange(ln) / SR
        ir = np.stack([noise(ln), noise(ln)]) * np.exp(-6.9 * t / rt)
        ir = np.stack([lp(ch, 5200) for ch in ir])
        ir[:, :int(.012 * SR)] *= np.linspace(0, 1, int(.012 * SR))
        ir /= np.sqrt((ir ** 2).sum(1, keepdims=True))
        wet = np.stack([signal.fftconvolve(self.wet[c], ir[c])[:self.n] for c in range(2)]) * .55
        out = self.dry + wet
        if loop_len:
            L = int(loop_len * SR)
            out[:, :self.n - L] += out[:, L:]
            out = out[:, :L]
        out = np.stack([hp(c, 28) for c in out])
        out /= np.percentile(np.abs(out), 99.9) * 1.25
        out = np.tanh(out * 1.15) / np.tanh(1.15)
        return (out * .84).T


# ---------------- instruments ----------------

def gusle(midi, dur, slide_from=None, ornament=False):
    n = int(dur * SR)
    f = np.full(n, mtof(midi))
    if slide_from is not None:
        s = min(n, int(.07 * SR)); f[:s] = np.linspace(mtof(slide_from), mtof(midi), s)
    if ornament and dur > .35:
        g = int(.06 * SR); f[:g] = mtof(midi + 1); f[g:2 * g] = mtof(midi)
    t = np.arange(n) / SR
    depth = np.clip((t - .12) / .3, 0, 1) * .0065
    f *= 1 + depth * np.sin(2 * np.pi * 5.7 * t + rng.uniform(0, 6))
    x = saw(f, 30) + .5 * saw(f * 1.004, 30)
    x += noise(n) * .05 * (1 + np.sin(2 * np.pi * 9 * t))
    x = formants(hp(x, 220), [(560, 4, 1.1), (1350, 5, .9), (2900, 6, .55), (4200, 7, .25)])
    return lp(x, 6500) * adsr(n, .04, .1, .85, min(.12, dur * .4))


def voice(midi, dur, vowel='a', detune=(-7, 0, 7)):
    n = int(dur * SR)
    t = np.arange(n) / SR
    peaks = {'a': [(730, 6, 1), (1090, 7, .6), (2440, 8, .3)], 'o': [(570, 6, 1), (840, 7, .6), (2410, 8, .2)]}[vowel]
    x = np.zeros(n)
    for c in detune:
        f = mtof(midi) * 2 ** (c / 1200) * (1 + .004 * np.sin(2 * np.pi * (4.6 + rng.uniform(0, .8)) * t + rng.uniform(0, 6)))
        x += saw(f, 14)
    x = formants(lp(x, 3400), peaks) + lp(x, 900) * .15
    return x * adsr(n, .45, .3, .9, .9) / len(detune)


def strings(midi, dur, short=True):
    n = int(dur * SR)
    f = mtof(midi) * np.ones(n)
    x = saw(f, 25) + saw(f * 1.003, 25)
    x = lp(x, 2600 if short else 1800)
    return x * (adsr(n, .008, dur * .6, .15, .05) if short else adsr(n, .3, .2, .85, .5)) * .5


def horn(midi, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = mtof(midi) * (1 + .003 * np.sin(2 * np.pi * 5 * t))
    x = saw(f, 30) + saw(f * 1.002, 30) + .6 * saw(f / 2, 30)
    env = adsr(n, .35, .2, .9, .4)
    # brassy: cutoff follows the envelope
    out = np.zeros(n); blk = 2048
    for i in range(0, n, blk):
        seg = x[max(0, i - 256):i + blk]
        y = lp(seg, 300 + 1700 * env[i])
        out[i:i + blk] = y[-len(out[i:i + blk]):]
    return out * env * .35


def drone(midi, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = saw(mtof(midi) * np.ones(n), 20) + .7 * saw(mtof(midi + 7) * np.ones(n), 20) + .5 * saw(mtof(midi - 12) * np.ones(n), 20)
    x = lp(x, 520) * (1 + .15 * np.sin(2 * np.pi * .23 * t))
    return x * adsr(n, 1.2, .1, 1, 1.2) * .5


def tapan(big=1.):
    n = int(1.1 * SR)
    t = np.arange(n) / SR
    f = 46 + 70 * np.exp(-t * 28)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (4.2 / big))
    click = lp(noise(n), 2200) * np.exp(-t * 60) * .5
    skin = bp(noise(n), 150, 600) * np.exp(-t * 18) * .4
    return (body + click + skin) * big


def slap():
    n = int(.25 * SR)
    t = np.arange(n) / SR
    return (bp(noise(n), 1800, 7000) * np.exp(-t * 55) + np.sin(2 * np.pi * 380 * t) * np.exp(-t * 40) * .4) * .7


def tek():
    n = int(.12 * SR)
    t = np.arange(n) / SR
    return bp(noise(n), 900, 3500) * np.exp(-t * 70) * .5


def taiko():
    n = int(2.2 * SR)
    t = np.arange(n) / SR
    f = 33 + 45 * np.exp(-t * 14)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) + lp(noise(n), 900) * np.exp(-t * 25) * .5) * 1.4


def swell(dur):
    n = int(dur * SR)
    return hp(noise(n), 4500) * np.linspace(0, 1, n) ** 3 * .35


# ---------------- compositions ----------------

def drum_theme():
    bpm = 92; beat = 60 / bpm; bar = 4 * beat
    bars = 36
    m = Mix(bars * bar + 5)
    prog = [(50, [50, 57, 62, 65]), (48, [48, 55, 60, 64]), (46, [46, 53, 58, 62]), (45, [45, 52, 57, 61])]  # Dm C Bb A
    def chord(b): return prog[(b // 2) % 4]
    theme_a = [[(69, 1.5), (70, .5), (69, 1), (67, .5), (65, .5)], [(64, 1), (65, 1), (62, 2)],
               [(67, 1.5), (69, .5), (67, 1), (65, .5), (64, .5)], [(64, 1), (67, 1), (72, 2)],
               [(74, 1.5), (72, .5), (70, 1), (69, 1)], [(67, 1), (70, 1), (65, 2)],
               [(64, 1), (65, .5), (67, .5), (69, 1), (70, .5), (73, .5)], [(76, 2), (73, 1), (69, 1)]]
    theme_b = [[(74, 2), (77, 1), (76, 1)], [(74, 1), (73, .5), (74, .5), (69, 2)],
               [(72, 1.5), (74, .5), (76, 1), (72, 1)], [(67, 1), (72, 1), (76, 2)],
               [(77, 1.5), (76, .5), (74, 1), (70, 1)], [(74, 1), (77, 1), (74, 2)],
               [(73, 1), (74, .5), (76, .5), (77, 1), (76, 1)], [(73, 2), (69, 2)]]

    def play_theme(start_bar, theme, octave=0, inst='gusle', gain=.5, pan=.15):
        prev = None
        for i, notes in enumerate(theme):
            t = (start_bar + i) * bar
            for midi, d in notes:
                midi += octave
                if inst == 'gusle':
                    x = gusle(midi, d * beat * 1.02, slide_from=prev if prev and abs(prev - midi) > 2 else None, ornament=d >= 1.5)
                    m.add(t, x, pan, gain, .3)
                else:
                    m.add(t, horn(midi, d * beat * 1.05), -pan, gain, .35)
                prev = midi
                t += d * beat

    # drone through intro, bridge and outro
    for b0, nb in [(0, 4), (20, 4), (32, 4)]:
        m.add(b0 * bar, drone(38, nb * bar + .5), 0, .45, .2)
    # intro: solo gusle, distant drum on the one
    play_theme(0, theme_a[:4], 0, 'gusle', .42, .1)
    for b in range(4): m.add(b * bar, tapan(.8), -.1, .5, .45)
    # sections
    for b in range(4, 32):
        root, ch = chord(b - 4)
        section = 'A' if b < 12 else 'B' if b < 20 else 'bridge' if b < 24 else 'climax'
        t0 = b * bar
        # low strings / bass
        if (b - 4) % 2 == 0:
            m.add(t0, strings(root - 12, 2 * bar, short=False), 0, .5 if section != 'bridge' else .3, .2)
        # ostinato
        if section in ('A', 'B', 'climax'):
            pat = [ch[2], ch[2] + 7, ch[3], ch[2] + 7, ch[2] + 12, ch[2] + 7, ch[3], ch[2] + 7]
            for k, p in enumerate(pat):
                m.add(t0 + k * beat / 2, strings(p, beat / 2 * .9), .35 * (1 if k % 2 else -1), .16 if section == 'A' else .2, .2)
        # choir
        if section in ('B', 'bridge', 'climax') and (b - 4) % 2 == 0:
            for k, p in enumerate(ch):
                m.add(t0, voice(p, 2 * bar + .4, 'a' if section != 'bridge' else 'o'), (k - 1.5) * .3, .32, .45)
        # horns swell on chord changes
        if section in ('B', 'climax') and (b - 4) % 2 == 0:
            for p in (ch[1], ch[2]):
                m.add(t0, horn(p, bar * 1.6), .2, .22, .4)
        # drums
        if section == 'bridge':
            for k in (0, 2.5): m.add(t0 + k * beat, tapan(.9), 0, .55, .35)
        else:
            big = 1.15 if section == 'climax' else 1.
            for k in (0, 1.5, 2): m.add(t0 + k * beat, tapan(big), -.05, .62, .3)
            for k in (1, 3): m.add(t0 + k * beat, slap(), .2, .5, .25)
            for k in (.5, 2.5, 3.5): m.add(t0 + k * beat, tek(), -.3, .35, .2)
            if section != 'A':
                for k in np.arange(0, 4, .5): m.add(t0 + (k + .25) * beat, tek(), .4, .18, .2)
            if (b - 3) % 4 == 0:  # fill into the next phrase
                for k in np.arange(3, 4, .25): m.add(t0 + k * beat, tek(), .3, .4, .2)
                m.add(t0 + 3.5 * beat, tapan(), .1, .5, .3)
            if section == 'climax' and (b - 4) % 4 == 0:
                m.add(t0, taiko(), 0, .7, .4)
            if (b - 3) % 4 == 0 and section in ('B', 'climax'):
                m.add(t0 + 2 * beat, swell(2 * beat), 0, .5, .5)
    # melodies
    play_theme(4, theme_a, 0, 'gusle', .5)
    play_theme(12, theme_b, 0, 'gusle', .48)
    play_theme(24, theme_a, 0, 'horn', .38, .2)
    play_theme(24, theme_b, 0, 'gusle', .4, .25)
    # outro gusle returns to the opening phrase so the loop is seamless
    play_theme(32, theme_a[4:], -12, 'gusle', .4, .1)
    for b in range(32, 36): m.add(b * bar, tapan(.8), -.1, .45, .45)
    return m.render(loop_len=bars * bar)


def megdan_theme():
    bpm = 124; beat = 60 / bpm; bar = 4 * beat
    bars = 32
    m = Mix(bars * bar + 5)
    # D Phrygian dominant: D Eb F# G A Bb C
    riff = [38, 38, 39, 38, 36, 38, 39, 41]
    melody = [[(74, 1), (75, .5), (74, .5), (72, 1), (70, 1)], [(69, 1.5), (70, .5), (69, 1), (66, 1)],
              [(67, 1), (69, .5), (70, .5), (72, 1), (70, .5), (69, .5)], [(66, 1), (67, 1), (62, 2)]]
    for b in range(bars):
        t0 = b * bar
        sec = 'intro' if b < 4 else 'A' if b < 12 else 'B' if b < 20 else 'break' if b < 24 else 'climax'
        # driving low string riff in 8ths
        if sec != 'break':
            for k, p in enumerate(riff):
                m.add(t0 + k * beat / 2, strings(p + 12, beat / 2 * .85), -.2 if k % 2 else .2, .28, .15)
                m.add(t0 + k * beat / 2, strings(p, beat / 2 * .85), 0, .25, .1)
        else:
            m.add(t0, drone(38, bar + .3), 0, .5, .25)
        # drums
        if sec == 'break':
            for k in (0, 1, 2, 3): m.add(t0 + k * beat, tapan(.9), 0, .5, .35)
            if b % 2 == 1: m.add(t0 + 2 * beat, taiko(), 0, .6, .4)
        else:
            for k in (0, .75, 1.5, 2, 2.75, 3.5): m.add(t0 + k * beat, tapan(1.05), -.05, .58, .28)
            for k in (1, 3): m.add(t0 + k * beat, slap(), .2, .55, .25)
            for k in np.arange(0, 4, .25):
                m.add(t0 + k * beat, tek(), .35 if int(k * 4) % 2 else -.35, .16 + .1 * (k % 1 == .5), .18)
            if b % 4 == 0 and sec != 'intro': m.add(t0, taiko(), 0, .75, .4)
            if b % 4 == 3: m.add(t0 + 2 * beat, swell(2 * beat), 0, .55, .5)
        # choir stabs and sustained chords
        if sec in ('A', 'climax'):
            for k in (0, 1.5, 3):
                for p in (50, 57, 62, 66):
                    m.add(t0 + k * beat, voice(p, beat * .7, 'a'), (p - 57) * .05, .26, .4)
        if sec in ('B', 'break', 'climax') and b % 2 == 0:
            ch = [50, 57, 62, 66] if (b // 2) % 2 == 0 else [51, 58, 63, 67]
            for k, p in enumerate(ch):
                m.add(t0, voice(p, 2 * bar + .3, 'o'), (k - 1.5) * .3, .3, .45)
        # brass hits
        if sec in ('B', 'climax') and b % 2 == 0:
            for p in (50, 57, 62):
                m.add(t0, horn(p, bar * .9), .15, .3, .35)
        # gusle / horn melody
        if sec in ('A', 'B', 'climax'):
            phrase = melody[b % 4]
            t = t0
            prev = None
            for midi, d in phrase:
                if sec == 'climax':
                    m.add(t, horn(midi - 12, d * beat * 1.05), -.2, .3, .35)
                m.add(t, gusle(midi, d * beat * 1.02, slide_from=prev if prev and abs(prev - midi) > 2 else None, ornament=d >= 1), .2, .48, .3)
                prev = midi; t += d * beat
    return m.render(loop_len=bars * bar)


# ---------------- sound effects ----------------

def fx_whoosh(dur=.32, lo=300, hi=2400, heavy=False):
    n = int(dur * SR); t = np.arange(n) / SR
    x = noise(n)
    out = np.zeros(n); blk = 512
    for i in range(0, n, blk):
        c = lo + (hi - lo) * (i / n) ** .7
        seg = x[max(0, i - 128):i + blk]
        out[i:i + blk] = bp(seg, c * .6, c * 1.6)[-len(out[i:i + blk]):]
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    if heavy: out += lp(noise(n), 300) * env * .8
    return out * env


def fx_bow():
    n = int(.6 * SR); t = np.arange(n) / SR
    f0 = 98; L = int(SR / f0)
    buf = noise(L) * .5; y = np.zeros(n)
    for i in range(n):  # Karplus-Strong pluck
        y[i] = buf[i % L]
        buf[i % L] = .996 * .5 * (buf[i % L] + buf[(i + 1) % L])
    w = fx_whoosh(.25, 1500, 5000); s = int(.02 * SR)
    w = np.pad(w, (s, max(0, n - s - len(w))))[:n]
    return lp(y, 2500) * np.exp(-t * 7) + w * .6


def fx_chimes(notes, dur=1.4, spread=.5):
    n = int(dur * SR); out = np.zeros(n)
    for i, m in enumerate(notes):
        s = int(rng.uniform(0, spread) * SR) if spread else int(i * .07 * SR)
        k = n - s; t = np.arange(k) / SR
        f = mtof(m)
        tone = np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + .2 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 9)
        out[s:] += tone * np.exp(-t * 3.2) * .25
    return out


def fx_thunder():
    n = int(3.2 * SR); t = np.arange(n) / SR
    crack = hp(noise(n), 1500) * np.exp(-t * 14) * .6
    rumble = lp(noise(n), 160, 4) * (1 - np.exp(-t * 6)) * np.exp(-t * 1.1) * 3
    return crack + rumble


def fx_boom():
    n = int(1.6 * SR); t = np.arange(n) / SR
    f = 28 + 60 * np.exp(-t * 9)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.4) * 1.2 + lp(noise(n), 700) * np.exp(-t * 9) * .7


def fx_hoof():
    n = int(.18 * SR); t = np.arange(n) / SR
    f = 75 + 120 * np.exp(-t * 60)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 26) + bp(noise(n), 1500, 5000) * np.exp(-t * 90) * .5


def fx_gulp():
    n = int(.9 * SR); out = np.zeros(n)
    for s in (.05, .42):
        i = int(s * SR); k = int(.22 * SR); t = np.arange(k) / SR
        f = 260 - 140 * t / .22
        out[i:i + k] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / .22) * .6 + lp(noise(k), 600) * np.exp(-t * 20) * .3
    return out


def fx_horn_call():
    m = Mix(3.2)
    m.add(0, horn(62, .5), 0, 1, .35); m.add(.45, horn(69, 1.6), 0, 1, .35); m.add(.45, horn(62, 1.6), 0, .5, .35)
    return m.render()[:, 0]


def write(name, x, folder=SFX, stereo=False):
    x = np.asarray(x, float)
    if not stereo:
        x = x / (np.abs(x).max() + 1e-9) * .9
    ch = 1 if x.ndim == 1 else x.shape[1]
    with sf.SoundFile(os.path.join(folder, name + '.ogg'), 'w', SR, ch, format='OGG', subtype='VORBIS') as f:
        for i in range(0, len(x), 4096):  # libsndfile's Vorbis encoder crashes on very large single writes
            f.write(x[i:i + 4096])


KENNEY = {
    'hit_body': ['impactPunch_heavy_000', 'impactPunch_heavy_001', 'impactPunch_heavy_002', 'impactPunch_heavy_003'],
    'hit_armor': ['impactPlate_light_000', 'impactPlate_light_001', 'impactPlate_light_002', 'impactPlate_medium_000'],
    'hit_heavy': ['impactPlate_heavy_000', 'impactPlate_heavy_001', 'impactPlate_heavy_002'],
    'clang': ['impactMetal_heavy_000', 'impactMetal_heavy_001', 'impactMetal_heavy_002', 'impactMetal_heavy_003'],
    'ring': ['impactBell_heavy_000', 'impactBell_heavy_001'],
    'shield': ['impactWood_heavy_000', 'impactWood_heavy_001', 'impactWood_heavy_002'],
    'step': ['footstep_grass_000', 'footstep_grass_001', 'footstep_grass_002', 'footstep_grass_003', 'footstep_grass_004'],
    'land': ['impactSoft_heavy_000', 'impactSoft_heavy_001'],
    'fall': ['impactSoft_medium_000', 'impactSoft_medium_001', 'impactSoft_medium_002'],
    'rock': ['impactMining_000', 'impactMining_001', 'impactMining_002'],
    'draw': ['drawKnife1', 'drawKnife2', 'drawKnife3'],
    'cloth': ['cloth1', 'cloth2', 'cloth3', 'cloth4'],
    'coins': ['handleCoins', 'handleCoins2'],
    'leather': ['handleSmallLeather', 'handleSmallLeather2', 'dropLeather'],
    'gate': ['doorOpen_1', 'creak1'],
}

if __name__ == '__main__':
    os.makedirs(MUSIC, exist_ok=True); os.makedirs(SFX, exist_ok=True)
    manifest = {}
    music_only = '--music' in sys.argv
    sys.argv = [a for a in sys.argv if a != '--music']
    if len(sys.argv) > 1 and not music_only:
        found = {os.path.splitext(os.path.basename(p))[0]: p for p in glob.glob(os.path.join(sys.argv[1], '**', '*.ogg'), recursive=True)}
        for group, names in KENNEY.items():
            manifest[group] = []
            for i, nm in enumerate(names):
                if nm in found:
                    dst = f'{group}_{i}'
                    shutil.copyfile(found[nm], os.path.join(SFX, dst + '.ogg'))
                    manifest[group].append(dst)
        for lic in glob.glob(os.path.join(sys.argv[1], '**', 'License.txt'), recursive=True)[:1]:
            shutil.copyfile(lic, os.path.join(SFX, 'KENNEY-LICENSE.txt'))
    synth = {} if music_only else {
        'whoosh': [fx_whoosh(.28), fx_whoosh(.24, 500, 3200)],
        'whoosh_heavy': [fx_whoosh(.42, 180, 1600, True)],
        'bow': [fx_bow()],
        'arrow': [fx_whoosh(.35, 2500, 7000)],
        'magic': [fx_chimes([86, 90, 93, 98, 102], 1.6), fx_chimes([81, 85, 88, 93, 97], 1.6)],
        'magic_big': [fx_chimes([74, 78, 81, 86, 90, 93, 98, 102], 2.2, 0)],
        'pickup': [fx_chimes([86, 93], .8, 0)],
        'thunder': [fx_thunder()],
        'boom': [fx_boom()],
        'hoof': [fx_hoof()],
        'gulp': [fx_gulp()],
        'horn_call': [fx_horn_call()],
    }
    for group, takes in synth.items():
        manifest[group] = []
        for i, x in enumerate(takes):
            write(f'{group}_{i}', x); manifest[group].append(f'{group}_{i}')
    import json
    if not music_only:
        with open(os.path.join(SFX, 'sfx.json'), 'w') as f:
            json.dump(manifest, f, indent=1)
    print('sfx:', sum(len(v) for v in manifest.values()), 'files')
    for name, fn in [('drum', drum_theme), ('megdan', megdan_theme)]:
        audio = fn()
        write(name, audio, MUSIC, stereo=True)
        print(f'music {name}: {len(audio) / SR:.1f}s, {os.path.getsize(os.path.join(MUSIC, name + ".ogg")) // 1024} KB')
