import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ────────────────────────────────────────────────────
// Ambient Sound sources — dùng Web Audio API synth
// Không cần file âm thanh ngoài, tự tổng hợp bằng oscillators
// ────────────────────────────────────────────────────

type SoundPreset = {
  id: string;
  label: string;
  emoji: string;
  description: string;
};

const PRESETS: SoundPreset[] = [
  { id: 'rain',   label: 'Mưa nhẹ',      emoji: '🌧',  description: 'Tiếng mưa rơi nhẹ nhàng' },
  { id: 'wind',   label: 'Gió sáng',      emoji: '🌿',  description: 'Tiếng gió qua cửa sổ' },
  { id: 'river',  label: 'Suối chảy',     emoji: '💧',  description: 'Tiếng nước suối êm đềm' },
  { id: 'forest', label: 'Rừng sáng',     emoji: '🌲',  description: 'Tiếng chim buổi sớm' },
];

// ── Tổng hợp tiếng mưa bằng Web Audio API ──
function createRainNode(ctx: AudioContext): AudioNode {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1200;
  filter.Q.value = 0.3;
  
  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'lowpass';
  filter2.frequency.value = 3500;
  
  source.connect(filter);
  filter.connect(filter2);
  source.start();
  return filter2;
}

// ── Tổng hợp tiếng gió ──
function createWindNode(ctx: AudioContext): AudioNode {
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastSample = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    lastSample = (lastSample + 0.02 * white) / 1.02;
    data[i] = lastSample * 8;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 400;
  filter.Q.value = 0.8;

  // LFO cho hiệu ứng gió thổi thay đổi cường độ
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 200;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);
  lfo.start();
  
  source.connect(filter);
  source.start();
  return filter;
}

// ── Tổng hợp tiếng suối ──
function createRiverNode(ctx: AudioContext): AudioNode {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 600;
  filter.Q.value = 0.5;
  
  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'highpass';
  filter2.frequency.value = 300;
  
  source.connect(filter);
  filter.connect(filter2);
  source.start();
  return filter2;
}

// ── Tổng hợp tiếng rừng / chim ──
function createForestNode(ctx: AudioContext): AudioNode {
  const merger = ctx.createChannelMerger(2);

  // Tiếng lá xào xạc (noise nhẹ)
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
  const leafSource = ctx.createBufferSource();
  leafSource.buffer = buffer;
  leafSource.loop = true;
  
  const leafFilter = ctx.createBiquadFilter();
  leafFilter.type = 'highpass';
  leafFilter.frequency.value = 2000;
  leafSource.connect(leafFilter);
  leafSource.start();

  // Tiếng chim (oscillator với envelope)
  function scheduleBirdCall(delay: number) {
    const osc = ctx.createOscillator();
    const envGain = ctx.createGain();
    osc.frequency.value = 2400 + Math.random() * 800;
    osc.type = 'sine';
    envGain.gain.setValueAtTime(0, ctx.currentTime + delay);
    envGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + delay + 0.05);
    envGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.3);
    osc.connect(envGain);
    envGain.connect(merger);
    osc.start(ctx.currentTime + delay);
    osc.stop(ctx.currentTime + delay + 0.4);
    // Lên lịch chim tiếp theo
    const next = 2 + Math.random() * 5;
    setTimeout(() => scheduleBirdCall(0), (delay + next) * 1000);
  }
  scheduleBirdCall(1.5);
  scheduleBirdCall(3.8);

  leafFilter.connect(merger);
  return merger;
}

// ────────────────────────────────────────────────────
export function AmbientSound() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.35);
  const [isPlaying, setIsPlaying] = useState(false);

  const ctxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sourceNodeRef = useRef<AudioNode | null>(null);

  const stopCurrent = useCallback(() => {
    if (sourceNodeRef.current && gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(0, gainNodeRef.current.context.currentTime, 0.3);
      setTimeout(() => {
        try { (sourceNodeRef.current as any)?.disconnect?.(); } catch { /* ignore */ }
        gainNodeRef.current?.disconnect?.();
      }, 800);
      sourceNodeRef.current = null;
      gainNodeRef.current = null;
    }
  }, []);

  const play = useCallback((id: string) => {
    // Tạo AudioContext nếu chưa có
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    stopCurrent();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 1.2);
    gain.connect(ctx.destination);
    gainNodeRef.current = gain;

    let node: AudioNode;
    switch (id) {
      case 'rain':   node = createRainNode(ctx);   break;
      case 'wind':   node = createWindNode(ctx);   break;
      case 'river':  node = createRiverNode(ctx);  break;
      case 'forest': node = createForestNode(ctx); break;
      default: return;
    }
    node.connect(gain);
    sourceNodeRef.current = node;
    setIsPlaying(true);
  }, [volume, stopCurrent]);

  const stop = useCallback(() => {
    stopCurrent();
    setIsPlaying(false);
    setActiveId(null);
  }, [stopCurrent]);

  const handleSelect = (id: string) => {
    if (activeId === id) {
      stop();
    } else {
      setActiveId(id);
      play(id);
    }
    setIsOpen(false);
  };

  // Cập nhật volume khi thay đổi
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setTargetAtTime(volume, gainNodeRef.current.context.currentTime, 0.1);
    }
  }, [volume]);

  // Cleanup khi unmount
  useEffect(() => {
    return () => { stopCurrent(); ctxRef.current?.close(); };
  }, [stopCurrent]);

  const activePreset = PRESETS.find(p => p.id === activeId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(o => !o)}
        title={isPlaying ? `Đang phát: ${activePreset?.label}` : 'Tiếng xung quanh'}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ${
          isPlaying
            ? 'bg-amber-100 text-amber-800 border border-amber-200/80'
            : 'text-[#888] hover:text-[#444] hover:bg-stone-100'
        }`}
      >
        {/* Speaker wave icon */}
        {isPlaying ? (
          <span className="flex items-center gap-1">
            <span className="text-base leading-none">{activePreset?.emoji}</span>
            {/* Animated sound bars */}
            <span className="flex items-end gap-[2px] h-3">
              {[1, 2, 3].map(i => (
                <span
                  key={i}
                  className="w-[2px] bg-amber-600 rounded-full"
                  style={{
                    height: `${40 + i * 20}%`,
                    animation: `sound-bar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                  }}
                />
              ))}
            </span>
          </span>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
        <span className="hidden lg:inline text-[11px]">
          {isPlaying ? activePreset?.label : 'Tiếng xung quanh'}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[490]" onClick={() => setIsOpen(false)} />

            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute top-full left-0 mt-2 w-64 bg-white/98 backdrop-blur-xl border border-stone-200/60 rounded-2xl shadow-2xl z-[500] overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-stone-100">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">Tiếng xung quanh</p>
                <p className="text-[11px] text-stone-400 mt-0.5">Âm thanh tự nhiên để thư giãn</p>
              </div>

              <div className="py-2">
                {PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handleSelect(preset.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-amber-50 ${
                      activeId === preset.id ? 'bg-amber-50' : ''
                    }`}
                  >
                    <span className="text-lg leading-none w-6 text-center">{preset.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold ${activeId === preset.id ? 'text-amber-800' : 'text-stone-700'}`}>
                        {preset.label}
                      </p>
                      <p className="text-[11px] text-stone-400 truncate">{preset.description}</p>
                    </div>
                    {activeId === preset.id && (
                      <span className="flex items-end gap-[2px] h-4 shrink-0">
                        {[1, 2, 3].map(i => (
                          <span
                            key={i}
                            className="w-[2px] bg-amber-600 rounded-full"
                            style={{
                              height: `${40 + i * 20}%`,
                              animation: `sound-bar 0.8s ease-in-out ${i * 0.15}s infinite alternate`,
                            }}
                          />
                        ))}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Volume slider */}
              {isPlaying && (
                <div className="px-4 py-3 border-t border-stone-100">
                  <div className="flex items-center gap-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-stone-400 shrink-0">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    </svg>
                    <input
                      type="range"
                      min={0.01}
                      max={0.9}
                      step={0.01}
                      value={volume}
                      onChange={e => setVolume(Number(e.target.value))}
                      className="flex-1 h-1 accent-amber-700 cursor-pointer"
                    />
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-stone-400 shrink-0">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  </div>
                </div>
              )}

              {isPlaying && (
                <div className="px-4 pb-3">
                  <button
                    onClick={stop}
                    className="w-full py-2 text-[12px] font-semibold text-stone-500 hover:text-red-500 transition-colors text-center border border-stone-200 rounded-xl hover:border-red-200"
                  >
                    ✕ Tắt âm thanh
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes sound-bar {
          from { transform: scaleY(0.4); }
          to   { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
