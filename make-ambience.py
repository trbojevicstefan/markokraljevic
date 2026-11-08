"""Synthesizes the weather ambience loops: python make-ambience.py
Writes dist/assets/music/rain.ogg (storm levels) and night.ogg (night levels, the swamp)."""
import os
import numpy as np
import soundfile as sf
from scipy import signal

SR = 44100
LOOP = 12.0
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist', 'assets', 'music')
rng = np.random.default_rng(7)


def band(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], 'bandpass', fs=SR, output='sos'), x)


def low(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, 'lowpass', fs=SR, output='sos'), x)


def seamless(x, fade=1.5):
    """Render LOOP + fade seconds, then fold the tail over the head so the loop has no seam."""
    n, f = int(LOOP * SR), int(fade * SR)
    out = x[:n].copy()
    w = np.linspace(0, 1, f)[:, None] if x.ndim == 2 else np.linspace(0, 1, f)
    out[:f] = x[:f] * w + x[n:n + f] * (1 - w)
    return out


def rain():
    n = int((LOOP + 1.5) * SR)
    t = np.arange(n) / SR
    ch = []
    for side in range(2):
        hiss = band(rng.standard_normal(n), 900, 7500) * .35
        body = band(rng.standard_normal(n), 250, 1400) * .5
        swell = .75 + .25 * np.sin(2 * np.pi * (t / 6.2 + side * .3))
        x = (hiss + body) * swell
        # individual drops on leaves and stone
        drops = np.zeros(n)
        for at in rng.uniform(0, n - 2000, 2600).astype(int):
            k = rng.integers(120, 700)
            drops[at:at + k] += rng.standard_normal(k) * np.exp(-np.arange(k) / (k / 5)) * rng.uniform(.2, 1)
        x += band(drops, 1800, 9000) * .5
        x += low(rng.standard_normal(n), 120) * .9  # distant rumble of the downpour
        ch.append(x)
    x = np.stack(ch, 1)
    return seamless(x / np.abs(x).max() * .8)


def night():
    n = int((LOOP + 1.5) * SR)
    t = np.arange(n) / SR
    x = np.zeros((n, 2))
    # soft night air
    air = low(rng.standard_normal((n, 2)), 500) * .12
    x += air * (.8 + .2 * np.sin(2 * np.pi * t / 7))[:, None]
    # crickets: short pulse trains of a pure tone, each insect with its own pitch, rate and place
    for c in range(6):
        f0, pan, gain = rng.uniform(3900, 5200), rng.uniform(.15, .85), rng.uniform(.25, .6)
        period, at = rng.uniform(.55, 1.1), rng.uniform(0, .5)
        while at < LOOP + 1.4:
            pulses = rng.integers(2, 5)
            for p in range(pulses):
                s = int((at + p * .028) * SR)
                k = int(.018 * SR)
                if s + k >= n:
                    break
                env = np.sin(np.linspace(0, np.pi, k)) ** 2
                tone = np.sin(2 * np.pi * f0 * np.arange(k) / SR) * env * gain
                x[s:s + k, 0] += tone * (1 - pan)
                x[s:s + k, 1] += tone * pan
            at += period * rng.uniform(.85, 1.2)
    # a frog now and then for the swamp
    for at in rng.uniform(.5, LOOP, 5):
        s, k = int(at * SR), int(.22 * SR)
        tt = np.arange(k) / SR
        croak = np.sign(np.sin(2 * np.pi * (95 + 40 * tt) * tt)) * np.exp(-tt * 9) * (np.sin(2 * np.pi * 22 * tt) > 0)
        croak = low(croak, 900) * .35
        pan = rng.uniform(.2, .8)
        x[s:s + k, 0] += croak * (1 - pan)
        x[s:s + k, 1] += croak * pan
    return seamless(x / np.abs(x).max() * .7)


def write(name, x):
    with sf.SoundFile(os.path.join(OUT, name + '.ogg'), 'w', SR, x.shape[1], format='OGG', subtype='VORBIS') as f:
        for i in range(0, len(x), 4096):  # libsndfile's Vorbis encoder crashes on very large single writes
            f.write(x[i:i + 4096])
    print(f'{name}: {len(x) / SR:.1f}s, {os.path.getsize(os.path.join(OUT, name + ".ogg")) // 1024} KB')


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    write('rain', rain())
    write('night', night())
