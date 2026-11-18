"""A theme for (almost) every pohod (Stefan, 18. 11. 2026: „napiši nove muzike za skoro svaki nivo”).

    python make-level-music.py [nivo ...]      ->  dist/assets/music/nivo-<id>.ogg

Every theme is composed here, note by note from a few rules, with no outside service: its own mode, tempo, metre (the kolo
in 7/8, the 9/8 of the fields), its own lead (frula, kaval, gajde, tambura, gusle, choir, horns) and accompaniment, and a
form a player can follow: intro, A, A', B, A'' and back to the start without a seam (the tail is folded onto the head).
The instruments of make-audio.py (gusle, voice, horn, strings, drone, tapan …) are borrowed; the new ones are below.
The boss themes and the story's gusle stay as they are; Urvina and San keep the guslar.
"""
import os, sys, importlib.util
import numpy as np
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location('mk', os.path.join(HERE, 'make-audio.py'))
mk = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mk)
SR, Mix, mtof, adsr, saw, lp, hp, bp, formants, noise = mk.SR, mk.Mix, mk.mtof, mk.adsr, mk.saw, mk.lp, mk.hp, mk.bp, mk.formants, mk.noise
gusle, voice, horn, strings, drone, tapan, slap, tek, taiko, swell = mk.gusle, mk.voice, mk.horn, mk.strings, mk.drone, mk.tapan, mk.slap, mk.tek, mk.taiko, mk.swell
rng = np.random.default_rng(5)

# ---------------- new instruments ----------------


def frula(midi, dur, low=False):
    """The shepherd's flute (or, low, the kaval): a breathy near-sine, a scoop up into the note, vibrato that comes late."""
    n = int(dur * SR); t = np.arange(n) / SR
    f = mtof(midi) * np.ones(n)
    s = min(n, int(.05 * SR)); f[:s] *= np.linspace(2 ** (-.6 / 12), 1, s)
    f *= 1 + np.clip((t - .25) / .4, 0, 1) * .006 * np.sin(2 * np.pi * 5.2 * t + rng.uniform(0, 6))
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) + (.32 if low else .18) * np.sin(2 * ph) + (.12 if low else .07) * np.sin(3 * ph)
    fc = float(mtof(midi))
    breath = bp(noise(n), fc * .7, min(fc * 1.6, SR * .45)) * (.22 if low else .14) + hp(noise(n), 4000) * .025
    return (x + breath) * adsr(n, .07 if low else .05, .1, .85, min(.15, dur * .4)) * .55


def pluck(midi, dur, bright=.5, decay=.996):
    """A tambura string: Karplus-Strong through one IIR filter (y[n] = x[n] + g/2 (y[n-N] + y[n-N-1]))."""
    n = int(max(dur, .4) * SR); N = max(2, int(SR / float(mtof(midi))))
    burst = np.zeros(n); k = min(N, n)
    burst[:k] = lp(noise(k), 1500 + 6000 * bright)
    a = np.zeros(N + 2); a[0] = 1; a[N] = -decay / 2; a[N + 1] = -decay / 2
    y = signal.lfilter([1.], a, burst)
    y = hp(y, 90) * np.exp(-np.arange(n) / SR * 1.2)
    y[-int(.03 * SR):] *= np.linspace(1, 0, int(.03 * SR))
    return y * .9


def tambura(midi, dur, trem=False, bright=.55):
    """A plucked note; long notes on the lead are played as tremolo, the way a prim tambura sings."""
    if not trem or dur < .3:
        return pluck(midi, dur + .25, bright)
    n = int(dur * SR); out = np.zeros(n + int(.4 * SR)); step = .07
    for i, t in enumerate(np.arange(0, dur, step)):
        x = pluck(midi, step + .3, bright * (.85 if i % 2 else 1)) * (.75 if i % 2 else 1)
        j = int(t * SR); out[j:j + len(x)] += x[:len(out) - j]
    return out * .6


def zvono(midi, dur=4., big=1.):
    """A church bell: inharmonic partials, each with its own decay (the hum lasts, the strike dies fast)."""
    n = int(dur * SR); t = np.arange(n) / SR; f0 = float(mtof(midi))
    parts = [(.5, 1., .5), (1., .8, .9), (1.19, .55, 1.3), (1.5, .4, 1.6), (2., .35, 2.), (2.74, .2, 3.), (3.76, .12, 4.), (4.07, .1, 5.)]
    x = sum(g * np.sin(2 * np.pi * f0 * r * t + rng.uniform(0, 6)) * np.exp(-t * d / big) for r, g, d in parts)
    x += bp(noise(n), 2000, 7000) * np.exp(-t * 40) * .3
    return x * .35


def gajde(midi, dur, grace=None):
    """The bagpipe chanter: a narrow pulse, nasal; a grace note snaps in before the note as pipers do."""
    n = int(dur * SR); t = np.arange(n) / SR
    f = mtof(midi) * np.ones(n)
    if grace is not None:
        g = min(n // 3, int(.045 * SR)); f[:g] = mtof(grace)
    s0 = saw(f, 30); x = s0 - np.roll(s0, int(SR / float(mtof(midi)) * .3))   # two saws a third of a period apart: a narrow pulse
    x = formants(hp(x, 300), [(950, 4, 1.), (1800, 5, .7), (3100, 6, .35)])
    return lp(x, 5200) * adsr(n, .015, .05, .95, .03) * .5


def gajde_drone(midi, dur):
    n = int(dur * SR); t = np.arange(n) / SR
    x = saw(mtof(midi) * np.ones(n), 18) + .5 * saw(mtof(midi + 7) * np.ones(n), 18)
    x = formants(lp(x, 1400), [(500, 3, 1.), (1300, 4, .4)]) * (1 + .05 * np.sin(2 * np.pi * .3 * t))
    return x * adsr(n, .3, .1, 1, .4) * .3


def def_drum(open_=False):
    """A frame drum with jingles (def): a soft low thump and a shimmer of small cymbals."""
    n = int(.6 * SR); t = np.arange(n) / SR
    f = 95 + 60 * np.exp(-t * 35)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * (9 if not open_ else 5)) * .9
    jing = hp(noise(n), 5200) * np.exp(-t * (16 if open_ else 30)) * (1 + .5 * np.sin(2 * np.pi * 38 * t)) * .45
    return body + jing


def kapi():
    """A drop of water in a cave: a short high sine falling a little."""
    n = int(.5 * SR); t = np.arange(n) / SR; f0 = rng.uniform(1300, 2100)
    f = f0 * (1 + .25 * np.exp(-t * 60))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 14) * .4


def chime(midi, dur=1.6):
    n = int(dur * SR); t = np.arange(n) / SR; f0 = float(mtof(midi))
    return sum(g * np.sin(2 * np.pi * f0 * r * t) * np.exp(-t * d) for r, g, d in [(1, 1, 3), (2.76, .4, 6), (5.4, .2, 9)]) * .3


# ---------------- composition ----------------
MODES = dict(mk.MODES, mixolyd=[0, 2, 4, 5, 7, 9, 10], aeol=[0, 2, 3, 5, 7, 8, 10], lydian=[0, 2, 4, 6, 7, 9, 11])


class Song:
    def __init__(s, root, mode, bpm8, groups, seed):
        s.root, s.sc, s.e8, s.groups = root, MODES[mode], 60 / bpm8, groups
        s.E = sum(groups); s.bar = s.E * s.e8
        s.r = np.random.default_rng(seed)
        s.accents = list(np.cumsum([0] + groups[:-1]))

    def deg(s, d): return s.root + 12 * (d // 7) + s.sc[d % 7]

    def rhythm(s, busy):
        """One bar of durations in eighths: notes start on the groups (the beats of the metre), some groups split in two."""
        out = []
        for g in s.groups:
            r = s.r.random()
            if g == 2: out += [1, 1] if r < busy else [2]
            elif g == 3: out += ([1, 1, 1] if r < busy * .5 else [2, 1] if r < busy else [3])
            else: out += [1] * g if r < busy * .4 else [2] * (g // 2) + ([g % 2] if g % 2 else []) if r < busy else [g]
        return out

    def phrase(s, chords, start, lo, hi, busy, cadence):
        """Four bars of melody over the given chords (degrees of their roots), shaped the way a folk tune is: a motif in bar 1,
        an answer in bar 2, bar 1 again a step or two higher in bar 3 (a sequence), and a long note on the cadence degree in
        bar 4. The line moves in arcs (a direction that holds, then turns), rarely repeats a note, and lands on a chord tone
        on every strong beat."""
        notes, d, dirn = [], start, 1 if s.r.random() < .6 else -1
        rh = [s.rhythm(busy), s.rhythm(busy)]
        bar0 = []
        shift = int(s.r.choice([1, 2, 2, -1]))
        for b in range(4):
            ch = chords[b]; tones = [(ch + k) % 7 for k in (0, 2, 4)]
            if b < 3: cells = rh[b % 2]
            else: cells = [s.groups[0], s.E - s.groups[0]] if s.r.random() < .6 else [s.E]
            pos = 0
            for i, du in enumerate(cells):
                last = b == 3 and i == len(cells) - 1
                if last:
                    d = min(range(lo, hi + 1), key=lambda x: (abs(x - d) if x % 7 == cadence % 7 else 99))
                elif b == 2 and i < len(bar0):
                    d = int(np.clip(bar0[i] + shift, lo, hi))
                elif pos in s.accents:
                    cand = [x for x in range(lo, hi + 1) if x % 7 in tones and x != d]
                    aim = d + dirn * 2
                    d = min(cand, key=lambda x: abs(x - aim) + s.r.random() * 1.5)
                else:
                    if s.r.random() < .22: dirn = -dirn
                    d += dirn * (1 if s.r.random() < .78 else 2)
                if d >= hi: d, dirn = hi, -1
                if d <= lo: d, dirn = lo, 1
                if b == 0: bar0.append(d)
                notes.append((b, pos, du, d)); pos += du
        return notes


def play_melody(m, S, notes, bar0, inst, gain, pan=.15, rev=.3, oct_=0):
    prev = None
    for b, pos, du, d in notes:
        t = (bar0 + b) * S.bar + pos * S.e8; midi = S.deg(d) + oct_; dur = du * S.e8
        if inst == 'frula': x = frula(midi, dur * 1.02)
        elif inst == 'kaval': x = frula(midi, dur * 1.02, low=True)
        elif inst == 'gusle': x = gusle(midi, dur * 1.02, slide_from=prev if prev and abs(prev - midi) > 2 else None, ornament=du >= 3)
        elif inst == 'voice': x = voice(midi, dur * 1.1 + .1, 'a')
        elif inst == 'voiceo': x = voice(midi, dur * 1.1 + .1, 'o')
        elif inst == 'horn': x = horn(midi, dur * 1.05)
        elif inst == 'tambura': x = tambura(midi, dur, trem=du >= 3)
        elif inst == 'gajde': x = gajde(midi, dur * 1.01, grace=midi + 2 if du >= 2 and prev != midi else None)
        else: raise ValueError(inst)
        m.add(t, x, pan, gain, rev); prev = midi


def theme(cfg):
    S = Song(cfg['root'], cfg['mode'], cfg['bpm8'], cfg['groups'], cfg['seed'])
    prog = cfg['prog']                     # chord roots (scale degrees), one per bar, 8 bars, the A section
    progB = cfg.get('progB', prog[4:] + prog[:4])
    form = ['intro'] * 4 + ['A'] * 8 + ['A2'] * 8 + ['B'] * 8 + ['A3'] * 8 + ['out'] * 4
    bars = len(form)
    m = Mix(bars * S.bar + 6)
    lo, hi = cfg.get('range', (7, 16))
    A = S.phrase(prog[:4], 9, lo, hi, cfg['busy'], 4) + [(b + 4, p, d, x) for b, p, d, x in S.phrase(prog[4:], 11, lo, hi, cfg['busy'], 0)]
    B = S.phrase(progB[:4], 11, lo + 2, hi + 2, cfg['busy'] * .8, 4) + [(b + 4, p, d, x) for b, p, d, x in S.phrase(progB[4:], 12, lo + 2, hi + 2, cfg['busy'], 0)]
    lead, lead2 = cfg['lead'], cfg.get('lead2', cfg['lead'])
    L = lambda inst: (cfg.get('gain', {}).get(inst, .5))
    # melodies
    play_melody(m, S, A[:len(A) // 2], 0, lead, L(lead) * .7)   # the intro: the first half of the tune, quietly
    play_melody(m, S, A, 4, lead, L(lead))
    play_melody(m, S, A, 12, lead2, L(lead2), pan=-.15)
    if cfg.get('answer'): play_melody(m, S, A, 12, cfg['answer'], L(cfg['answer']) * .55, pan=.3, oct_=-12 if cfg['answer'] in ('voiceo', 'horn') else 0)
    play_melody(m, S, B, 20, cfg.get('leadB', lead), L(cfg.get('leadB', lead)))
    play_melody(m, S, A, 28, lead, L(lead))
    if cfg.get('answer'): play_melody(m, S, A, 28, cfg['answer'], L(cfg['answer']) * .6, pan=-.3, oct_=-12 if cfg['answer'] in ('voiceo', 'horn') else 0)
    play_melody(m, S, A[:len(A) // 2], 36, lead, L(lead) * .8)
    # accompaniment and drums, bar by bar
    for b, sec in enumerate(form):
        t0 = b * S.bar
        ch = (progB if sec == 'B' else prog)[(b - 4) % 8] if sec not in ('intro', 'out') else prog[0]
        root = S.deg(ch) - 12
        full = sec in ('A2', 'A3')
        for kind in cfg['acc']:
            if kind == 'drone' and (b % 4 == 0):
                m.add(t0, drone(S.root - 12, 4 * S.bar + .5), 0, .32, .25)
            elif kind == 'gdrone' and (b % 4 == 0):
                m.add(t0, gajde_drone(S.root - 12, 4 * S.bar + .3), 0, .3, .2)
            elif kind == 'bass':
                for a in S.accents[::2] if len(S.accents) > 2 else S.accents[:1]:
                    m.add(t0 + a * S.e8, strings(root - 12, S.e8 * 2.2, short=True), 0, .5, .1)
            elif kind == 'pad' and b % 2 == 0 and sec != 'intro':
                for k in (0, 2, 4):
                    m.add(t0, strings(S.deg(ch + k), 2 * S.bar + .4, short=False), (k - 2) * .15, .14 if not full else .2, .4)
            elif kind == 'choir' and b % 2 == 0 and sec in ('A2', 'B', 'A3'):
                for k in (0, 2, 4):
                    m.add(t0, voice(S.deg(ch + k), 2 * S.bar + .5, 'o' if sec == 'B' else 'a'), (k - 2) * .2, .2, .5)
            elif kind == 'strum':      # tambura chords on the groups (the brač and the bugarija)
                for i, a in enumerate(S.accents):
                    for k, off in ((0, 0), (2, .012), (4, .024)):
                        m.add(t0 + a * S.e8 + off, pluck(S.deg(ch + k), .5, .4), -.25 + k * .05, .16 if i else .2, .15)
            elif kind == 'arp':        # a flowing arpeggio on every eighth
                seq = [0, 2, 4, 7, 4, 2]
                for i in range(S.E):
                    m.add(t0 + i * S.e8, pluck(S.deg(ch + seq[i % len(seq)]), .6, .5), .3 if i % 2 else -.1, .15, .25)
            elif kind == 'bells' and b % 4 == 0 and sec != 'out':
                m.add(t0, zvono(S.root, 6., 1.2), -.3, .45, .55)
                if full: m.add(t0 + 2 * S.bar, zvono(S.root + 7, 5., 1.), .3, .3, .55)
            elif kind == 'chimes' and sec != 'intro':
                for i in range(2):
                    if S.r.random() < .5: m.add(t0 + S.r.integers(0, S.E) * S.e8, chime(S.deg(ch + int(S.r.choice([0, 2, 4]))) + 12), S.r.uniform(-.6, .6), .18, .6)
            elif kind == 'drops':
                for i in range(int(S.r.integers(1, 4))):
                    m.add(t0 + S.r.uniform(0, S.bar), kapi(), S.r.uniform(-.8, .8), .3, .6)
            elif kind == 'horncall' and b % 8 == 4:
                for k, (dg, du) in enumerate([(4, 1.5), (7, .5), (7, 3)]):
                    m.add(t0 + sum(x for _, x in [(4, 1.5), (7, .5), (7, 3)][:k]) * S.e8 * 2, horn(S.deg(dg), du * S.e8 * 2), .5, .28, .6)
        drums = cfg['drums']
        if sec == 'intro' and drums != 'none':
            m.add(t0, tapan(.7), 0, .35, .4)
        elif drums == 'kolo':          # the accent on every group, the def between
            for i, a in enumerate(S.accents):
                m.add(t0 + a * S.e8, tapan(1. if i == 0 else .8), -.05, .55 if i == 0 else .4, .28)
            for i in range(S.E):
                if i not in S.accents: m.add(t0 + i * S.e8, def_drum(), .25, .28, .2)
            if full and b % 4 == 3: m.add(t0 + (S.E - 1) * S.e8, def_drum(True), .2, .5, .3)
        elif drums == 'def':
            for i in range(S.E):
                m.add(t0 + i * S.e8, def_drum(i in S.accents), .2, .32 if i in S.accents else .18, .25)
            m.add(t0, tapan(.75), 0, .38, .3)
        elif drums == 'march':
            for k in (0, S.E // 2): m.add(t0 + k * S.e8, tapan(1.0), 0, .55, .3)
            for i in range(S.E * 2): m.add(t0 + i * S.e8 / 2, tek(), .35 if i % 2 else -.35, .1 + (.12 if i % 4 == 0 else 0), .15)
            if full and b % 4 == 0: m.add(t0, taiko(), 0, .55, .4)
        elif drums == 'heart':
            m.add(t0, taiko(), 0, .45, .45); m.add(t0 + 1.2 * S.e8, tapan(.6), 0, .3, .35)
        elif drums == 'soft':
            m.add(t0, tapan(.65), 0, .32, .4)
            if full: m.add(t0 + S.accents[len(S.accents) // 2] * S.e8, tapan(.5), .1, .22, .4)
        elif drums == 'anvil':         # the mine: hammers on iron, out of step with each other
            for i, a in enumerate(S.accents):
                m.add(t0 + a * S.e8, tapan(.9), 0, .45, .3)
                m.add(t0 + a * S.e8 + S.e8, chime(S.root + 31 + (i % 2) * 2, .5), .5 - i * .3, .15, .3)
        if drums not in ('none', 'heart', 'soft') and sec in ('A2', 'A3') and b % 8 == 7:
            m.add(t0 + S.bar / 2, swell(S.bar / 2), 0, .35, .5)
    return m.render(loop_len=bars * S.bar, rt=cfg.get('rt', 2.6))


# One theme per pohod. bpm8 = eighths per minute; groups = the metre in eighths (2+2+3 is the kolo's 7/8).
LEVELS = {
    'selo':     dict(root=62, mode='mixolyd', bpm8=300, groups=[3, 2, 2], seed=101, lead='frula', lead2='tambura', leadB='frula', answer='tambura',
                     prog=[0, 0, 6, 0, 3, 4, 6, 0], acc=['bass', 'strum'], drums='kolo', busy=.55, gain={'frula': .5, 'tambura': .42}),
    'suma':     dict(root=62, mode='dorian', bpm8=150, groups=[2, 2, 2, 2], seed=102, lead='frula', lead2='kaval', leadB='voiceo', answer='frula',
                     prog=[0, 3, 0, 6, 0, 3, 4, 0], acc=['drone', 'arp', 'chimes', 'pad'], drums='soft', busy=.45, rt=3.4, gain={'frula': .48, 'kaval': .5, 'voiceo': .4}),
    'manastir': dict(root=57, mode='phryg', bpm8=120, groups=[2, 2, 2, 2], seed=103, lead='voice', lead2='gusle', leadB='voiceo', answer='voiceo',
                     prog=[0, 0, 6, 0, 2, 1, 0, 0], acc=['drone', 'bells', 'pad'], drums='none', busy=.3, rt=4.2, range=(5, 12), gain={'voice': .5, 'voiceo': .45, 'gusle': .42}),
    'oranje':   dict(root=60, mode='mixolyd', bpm8=330, groups=[2, 2, 2, 3], seed=104, lead='gajde', lead2='frula', leadB='tambura', answer='tambura',
                     prog=[0, 0, 6, 6, 3, 3, 4, 0], acc=['gdrone', 'bass', 'strum'], drums='def', busy=.5, gain={'gajde': .4, 'frula': .48, 'tambura': .42}),
    'tvrdjava': dict(root=50, mode='harmminor', bpm8=208, groups=[2, 2, 2, 2], seed=105, lead='horn', lead2='gusle', leadB='horn', answer='voice',
                     prog=[0, 0, 5, 4, 0, 3, 4, 0], acc=['bass', 'pad', 'choir', 'horncall'], drums='march', busy=.4, gain={'horn': .5, 'gusle': .45, 'voice': .35}),
    'podrum':   dict(root=50, mode='phryg', bpm8=140, groups=[2, 2, 2, 2], seed=106, lead='kaval', lead2='gusle', leadB='kaval', answer=None,
                     prog=[0, 1, 0, 6, 0, 1, 6, 0], acc=['drone', 'drops', 'bass'], drums='heart', busy=.3, rt=3.6, gain={'kaval': .55, 'gusle': .4}),
    'mocvara':  dict(root=52, mode='hijaz', bpm8=140, groups=[3, 3, 2], seed=107, lead='frula', lead2='voiceo', leadB='kaval', answer='voiceo',
                     prog=[0, 0, 1, 0, 3, 1, 0, 0], acc=['drone', 'pad', 'chimes'], drums='heart', busy=.35, rt=4., gain={'frula': .45, 'voiceo': .4, 'kaval': .5}),
    'pecina':   dict(root=48, mode='aeol', bpm8=124, groups=[2, 2, 2, 2], seed=108, lead='kaval', lead2='voiceo', leadB='frula', answer=None,
                     prog=[0, 5, 3, 4, 0, 5, 6, 0], acc=['drone', 'drops', 'chimes', 'pad'], drums='none', busy=.3, rt=4.6, gain={'kaval': .55, 'voiceo': .4, 'frula': .45}),
    'prevoj':   dict(root=55, mode='dorian', bpm8=176, groups=[2, 2, 2, 2], seed=109, lead='frula', lead2='horn', leadB='gusle', answer='horn',
                     prog=[0, 3, 0, 6, 3, 0, 4, 0], acc=['drone', 'pad', 'horncall', 'bass'], drums='soft', busy=.45, rt=3.4, gain={'frula': .5, 'horn': .45, 'gusle': .45}),
    'klisura':  dict(root=52, mode='phrygdom', bpm8=240, groups=[2, 2, 2, 2], seed=110, lead='gusle', lead2='gusle', leadB='horn', answer='horn',
                     prog=[0, 1, 0, 1, 6, 5, 1, 0], acc=['bass', 'drone', 'pad'], drums='march', busy=.55, gain={'gusle': .5, 'horn': .45}),
    'rusevine': dict(root=57, mode='harmminor', bpm8=136, groups=[2, 2, 2, 2], seed=111, lead='gusle', lead2='voice', leadB='kaval', answer='voiceo',
                     prog=[0, 3, 4, 0, 5, 3, 4, 0], acc=['drone', 'pad', 'choir'], drums='soft', busy=.35, rt=3.8, gain={'gusle': .5, 'voice': .45, 'kaval': .5, 'voiceo': .35}),
    'rudnik':   dict(root=50, mode='aeol', bpm8=200, groups=[3, 3, 2], seed=112, lead='tambura', lead2='kaval', leadB='gusle', answer='kaval',
                     prog=[0, 0, 6, 6, 5, 5, 4, 4], acc=['bass', 'drone'], drums='anvil', busy=.5, gain={'tambura': .45, 'kaval': .5, 'gusle': .45}),
    'reka':     dict(root=60, mode='major', bpm8=228, groups=[3, 3], seed=113, lead='frula', lead2='tambura', leadB='kaval', answer='tambura',
                     prog=[0, 4, 5, 3, 0, 4, 3, 0], acc=['arp', 'bass', 'pad'], drums='soft', busy=.5, rt=3.2, gain={'frula': .5, 'tambura': .45, 'kaval': .5}),
    'vracara':  dict(root=51, mode='hijaz', bpm8=168, groups=[2, 2, 3], seed=114, lead='voiceo', lead2='gusle', leadB='kaval', answer='gusle',
                     prog=[0, 1, 0, 6, 0, 1, 4, 0], acc=['drone', 'chimes', 'pad', 'bass'], drums='kolo', busy=.35, rt=3.6, gain={'voiceo': .45, 'gusle': .45, 'kaval': .5}),
}

if __name__ == '__main__':
    only = sys.argv[1:]
    for lvl, cfg in LEVELS.items():
        if only and lvl not in only:
            continue
        audio = theme(cfg)
        import soundfile as sf   # a little more Vorbis compression than make-audio's default: ~90 kbit/s, the music comes one pohod at a time
        with sf.SoundFile(os.path.join(mk.MUSIC, 'nivo-' + lvl + '.ogg'), 'w', SR, 2, format='OGG', subtype='VORBIS', compression_level=.72) as f:
            for i in range(0, len(audio), 4096):
                f.write(audio[i:i + 4096])
        print(f'nivo-{lvl}: {len(audio) / SR:.1f}s, {os.path.getsize(os.path.join(mk.MUSIC, "nivo-" + lvl + ".ogg")) // 1024} KB', flush=True)
