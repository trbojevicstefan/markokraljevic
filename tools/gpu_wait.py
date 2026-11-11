"""Wait until the RX 9060 XT is free (no other job holding its memory), then run a command.

    python tools/gpu_wait.py [--free-gb 3] [--poll 30] -- <command ...>

Only one GPU job may run at a time on this machine (another project trains/renders TTS on the same card), so every
generation run goes through this: it polls the Windows counter "GPU Adapter Memory / Dedicated Usage" of the
busiest adapter and starts the command once usage stays below --free-gb for two polls in a row.
"""
import subprocess, sys, time

PS = ("(Get-Counter '\\GPU Adapter Memory(*)\\Dedicated Usage').CounterSamples | "
      "Measure-Object -Property CookedValue -Maximum | ForEach-Object { $_.Maximum }")


def used_gb():
    try:
        out = subprocess.run(['powershell', '-NoProfile', '-Command', PS], capture_output=True, text=True, timeout=60)
        return float(out.stdout.strip().splitlines()[-1]) / 2 ** 30
    except Exception:
        return 99.0


def main():
    a = sys.argv[1:]
    free, poll = 3.0, 30
    if '--free-gb' in a:
        i = a.index('--free-gb'); free = float(a[i + 1]); del a[i:i + 2]
    if '--poll' in a:
        i = a.index('--poll'); poll = int(a[i + 1]); del a[i:i + 2]
    cmd = a[a.index('--') + 1:]
    ok, t0, last = 0, time.time(), 0
    while ok < 2:
        u = used_gb()
        ok = ok + 1 if u < free else 0
        if ok < 2:
            if time.time() - last > 600:
                print(time.strftime('%H:%M:%S'), f'waiting for the GPU: {u:.1f} GB in use', flush=True)
                last = time.time()
            time.sleep(poll)
    print(time.strftime('%H:%M:%S'), f'GPU free after {time.time() - t0:.0f}s, starting', flush=True)
    sys.exit(subprocess.call(cmd))


if __name__ == '__main__':
    main()
