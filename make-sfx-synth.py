"""Synthesises the sound effects the free packs lack (no external services):
gusle, the eagle's cry, wing beats, fire catching, bones, the cannon and a splash.

    python make-sfx-synth.py

Writes dist/assets/sfx/<name>.ogg and lists each one in dist/assets/sfx/sfx.json.
(make-sfx-eleven.py can replace any of them with ElevenLabs sounds when there are credits.)
"""
import json, os
import numpy as np
import soundfile as sf
from scipy import signal

SR = 44100
ROOT = os.path.dirname(os.path.abspath(__file__))
SFX = os.path.join(ROOT, 'dist', 'assets', 'sfx')
rng = np.random.default_rng(11)


def t_(sec):
    return np.arange(int(sec * SR)) / SR


def env(n, a, r, curve=2.0):
    e = np.ones(n)
    a = max(1, int(a * SR)); r = max(1, int(r * SR))
    e[:a] = np.linspace(0, 1, a)
    e[-r:] *= np.linspace(1, 0, r) ** curve
    return e


def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band')
    return signal.lfilter(b, a, x)


def lp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2))
    return signal.lfilter(b, a, x)


def hp(x, f, order=2):
    b, a = signal.butter(order, f / (SR / 2), 'high')
    return signal.lfilter(b, a, x)


def reverb(x, sec=1.2, mix=.25, damp=3000):
    n = int(sec * SR)
    ir = rng.standard_normal(n) * np.exp(-np.linspace(0, 7, n))
    ir = lp(ir, damp)
    wet = np.zeros(len(x) + n); c = signal.fftconvolve(x, ir)[:len(x) + n]; wet[:len(c)] = c
    out = np.zeros(len(x) + n); out[:len(x)] += x
    return out * (1 - mix) + wet / (np.abs(wet).max() + 1e-9) * np.abs(x).max() * mix


def norm(x, peak=.89):
    return x / (np.abs(x).max() + 1e-9) * peak


def gusle(notes, seed):
    """A bowed one-string fiddle: a saw with a nasal formant, slow vibrato, slides between notes, bow noise."""
    r = np.random.default_rng(seed)
    parts = []
    prev = notes[0][0]
    for midi, dur in notes:
        n = int(dur * SR); tt = np.arange(n) / SR
        slide = np.clip(tt / .07, 0, 1)
        f0 = 440 * 2 ** ((prev + (midi - prev) * slide - 69) / 12)
        vib = 1 + .012 * np.sin(2 * np.pi * (5.2 + r.random()) * tt) * np.clip(tt / .25, 0, 1)
        f = f0 * vib
        ph = np.cumsum(f) / SR
        x = np.zeros(n)
        for k in range(1, 28):
            x += np.sin(2 * np.pi * k * ph) / k ** 1.1
        bow = .5 + .5 * np.clip(tt / .05, 0, 1)
        e = env(n, .03, .06, 1) * (0.85 + .15 * np.sin(2 * np.pi * 3 * tt))
        parts.append(x * e * bow)
        prev = midi
    x = np.concatenate(parts)
    # the nasal, rasping body of the gusle: two formants and horsehair bow noise
    y = bp(x, 700, 1300) * 1.4 + bp(x, 2200, 3400) * .8 + lp(x, 500) * .5
    y += bp(rng.standard_normal(len(x)), 2500, 6000) * .05 * np.abs(x)
    return norm(reverb(y, 1.4, .22))


def eagle(seed, calls=1):
    r = np.random.default_rng(seed)
    out = []
    for c in range(calls):
        d = .55 + r.random() * .2; tt = t_(d); n = len(tt)
        f = 2900 + 500 * np.sin(np.pi * tt / d) - 1200 * (tt / d) ** 2
        f *= 1 + .02 * np.sin(2 * np.pi * 38 * tt)  # the rough flutter of the screech
        ph = np.cumsum(f) / SR
        x = np.sin(2 * np.pi * ph) + .45 * np.sin(4 * np.pi * ph) + .2 * np.sin(6 * np.pi * ph)
        x *= (1 + .5 * bp(r.standard_normal(n), 30, 90) / 3)
        x += bp(r.standard_normal(n), 2500, 5000) * .25
        out.append(x * env(n, .02, .3, 1.5))
        out.append(np.zeros(int(.12 * SR)))
    return norm(reverb(np.concatenate(out), 1.6, .3, 5000))


def wings():
    tt = t_(1.1); n = len(tt)
    beats = np.zeros(n)
    for k, at in enumerate([.0, .28, .52]):
        i = int(at * SR); m = int(.22 * SR)
        beats[i:i + m] += np.hanning(m) * (1 - k * .2)
    x = lp(rng.standard_normal(n), 900) * beats * 2.5
    swoosh = bp(rng.standard_normal(n), 300, 2500) * np.exp(-((tt - .75) / .18) ** 2)
    return norm(x + swoosh * .9)


def fire(seed):
    r = np.random.default_rng(seed)
    tt = t_(2.4); n = len(tt)
    whoosh = lp(r.standard_normal(n), 700) * np.exp(-((tt - .25) / .2) ** 2) * 3
    roar = lp(r.standard_normal(n), 1200) * np.clip(tt / .3, 0, 1) * .5
    crack = np.zeros(n)
    for _ in range(38):
        i = r.integers(int(.15 * SR), n - 2000); m = r.integers(80, 600)
        crack[i:i + m] += r.standard_normal(m) * np.exp(-np.linspace(0, 6, m)) * (0.5 + r.random())
    crack = hp(crack, 1500)
    return norm((whoosh + roar + crack * 1.4) * env(n, .01, .5))


def bones(seed):
    r = np.random.default_rng(seed)
    n = int(1.4 * SR); x = np.zeros(n)
    at = 0.0
    for k in range(9):
        at += r.uniform(.03, .16) * (1 + k * .15)
        i = int(at * SR)
        if i > n - 4000: break
        m = int(.045 * SR); tt = np.arange(m) / SR
        f = r.uniform(900, 2100)
        hit = (np.sin(2 * np.pi * f * tt) + .6 * np.sin(2 * np.pi * f * 2.7 * tt)) * np.exp(-tt * r.uniform(60, 110))
        hit += r.standard_normal(m) * np.exp(-tt * 200) * .4
        x[i:i + m] += hit * (1 - k * .08)
    return norm(reverb(bp(x, 400, 7000), .5, .15))


def cannon(seed):
    r = np.random.default_rng(seed)
    tt = t_(2.6); n = len(tt)
    thump = np.sin(2 * np.pi * np.cumsum(70 * np.exp(-tt * 6) + 32) / SR) * np.exp(-tt * 5)
    blast = lp(r.standard_normal(n), 1400) * np.exp(-tt * 9) * 1.4
    crack = hp(r.standard_normal(n), 2000) * np.exp(-tt * 40) * .6
    rumble = lp(r.standard_normal(n), 160) * np.exp(-tt * 1.6) * 1.8
    x = thump * 1.6 + blast + crack + rumble
    return norm(reverb(x, 2.2, .35, 1800))


def splash():
    tt = t_(1.5); n = len(tt)
    burst = bp(rng.standard_normal(n), 400, 6000) * np.exp(-tt * 7) * 1.5
    body = lp(rng.standard_normal(n), 500) * np.exp(-tt * 10) * 1.2
    bub = np.zeros(n)
    for _ in range(14):
        i = rng.integers(int(.1 * SR), n - 3000); m = 1600; s = np.arange(m) / SR
        f = rng.uniform(500, 1400) * (1 + s * 8)
        bub[i:i + m] += np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-s * 40) * .25
    return norm(burst + body + bub)


# a short modal tune for each, narrow and wailing like an epic singer's line
G1 = [(62, .5), (63, .35), (62, .35), (60, .55), (62, .9), (63, .4), (65, .5), (63, .4), (62, 1.3)]
G2 = [(60, .45), (62, .45), (63, .7), (62, .35), (60, .35), (58, .6), (60, 1.0), (62, .5), (60, 1.4)]
SOUNDS = {
    'gusle_0': ('gusle', lambda: gusle(G1, 1)),
    'gusle_1': ('gusle', lambda: gusle(G2, 2)),
    'orao_0': ('orao', lambda: eagle(3, 1)),
    'orao_1': ('orao', lambda: eagle(4, 2)),
    'wings_0': ('wings', wings),
    'fire_0': ('fire', lambda: fire(5)),
    'fire_1': ('fire', lambda: fire(6)),
    'bones_0': ('bones', lambda: bones(7)),
    'bones_1': ('bones', lambda: bones(8)),
    'cannon_0': ('cannon', lambda: cannon(9)),
    'cannon_1': ('cannon', lambda: cannon(10)),
    'splash_0': ('splash', splash),
}


def main():
    path = os.path.join(SFX, 'sfx.json')
    manifest = json.load(open(path, encoding='utf8'))
    for name, (group, make) in SOUNDS.items():
        x = make().astype(np.float32)
        sf.write(os.path.join(SFX, name + '.ogg'), x, SR, format='OGG', subtype='VORBIS')
        manifest.setdefault(group, [])
        if name not in manifest[group]:
            manifest[group].append(name)
        print('ok', name, f'{len(x) / SR:.1f}s')
    json.dump(manifest, open(path, 'w', encoding='utf8'), indent=1)


if __name__ == '__main__':
    main()
