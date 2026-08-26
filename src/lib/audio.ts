let ctx: AudioContext | null = null;

function context(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  return ctx;
}

export function playPaperShuffle(enabled: boolean): void {
  if (!enabled) return;
  const audio = context();
  if (!audio) return;
  void audio.resume();
  const duration = 0.18;
  const buffer = audio.createBuffer(1, audio.sampleRate * duration, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) * 0.22;
  }
  const source = audio.createBufferSource();
  source.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 0.7;
  const gain = audio.createGain();
  gain.gain.value = 0.35;
  source.connect(filter);
  filter.connect(gain);
  gain.connect(audio.destination);
  source.start();
}
