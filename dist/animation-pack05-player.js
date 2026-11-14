/** Real-frame 8x1 sprite atlas player for Animation Pack 05. No menu/background/gameplay changes. */
export class AnimationPack05Player {
  constructor(basePath = 'assets/') {
    this.basePath = basePath;
    this.clips = new Map();
  }

  async load(id) {
    const res = await fetch(this.basePath + id + '.json');
    if (!res.ok) throw new Error('Missing animation metadata: ' + id);
    const data = await res.json();
    if (data.engine !== 'component-row' || data.animation?.rows?.motion?.frames !== 8) {
      throw new Error('Invalid 8-frame component-row animation: ' + id);
    }
    const image = new Image();
    image.decoding = 'async';
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error('Missing animation atlas: ' + id));
      image.src = this.basePath + id + '.png';
    });
    this.clips.set(id, {data, image});
    return data;
  }

  draw(ctx, id, elapsedSeconds, anchorX, anchorY, scale = 1, loopOverride = null) {
    const clip = this.clips.get(id);
    if (!clip) return false;
    const {data, image} = clip;
    const anim = data.animation.rows.motion;
    const durations = anim.durations_ms;
    const total = durations.reduce((a, b) => a + b, 0);
    if (!(total > 0)) return false;
    const looping = loopOverride ?? anim.loop;
    let elapsed = Math.max(0, elapsedSeconds) * 1000;
    let remain = looping ? elapsed % total : Math.min(elapsed, total - 0.001);
    let frame = 0;
    while (frame < durations.length - 1 && remain >= durations[frame]) {
      remain -= durations[frame++];
    }
    const w = data.cell.width, h = data.cell.height;
    const sw = w * scale, sh = h * scale;
    ctx.drawImage(image, frame*w, 0, w, h, anchorX-sw/2, anchorY-sh/2, sw, sh);
    return true;
  }
}
