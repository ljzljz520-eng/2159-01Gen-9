import { useFountainStore } from '@/hooks/useFountainStore'

export default function ControlPanel() {
  const emitterCount = useFountainStore((s) => s.emitterCount)
  const setEmitterCount = useFountainStore((s) => s.setEmitterCount)
  const particleCount = useFountainStore((s) => s.particleCount)
  const avgLifetime = useFountainStore((s) => s.avgLifetime)

  return (
    <div className="absolute top-6 right-6 w-72 backdrop-blur-xl bg-fountain-surface border border-white/10 rounded-2xl p-6 shadow-2xl shadow-cyan-900/20 z-10">
      <h2 className="font-orbitron text-sm font-bold tracking-widest text-fountain-cyan mb-5 uppercase">
        Particle Fountain
      </h2>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-orbitron text-xs text-white/50 tracking-wider">
            EMITTERS
          </span>
          <span className="font-mono text-sm text-fountain-cyan font-semibold">
            {emitterCount}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={8}
          value={emitterCount}
          onChange={(e) => setEmitterCount(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[10px] text-white/25">1</span>
          <span className="font-mono text-[10px] text-white/25">8</span>
        </div>
      </div>

      <div className="border-t border-white/5 pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-orbitron text-xs text-white/50 tracking-wider">
            PARTICLES
          </span>
          <span className="font-mono text-lg text-white/90 font-semibold stat-value">
            {particleCount.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-orbitron text-xs text-white/50 tracking-wider">
            AVG LIFETIME
          </span>
          <span className="font-mono text-lg text-white/90 font-semibold stat-value">
            {avgLifetime.toFixed(2)}
            <span className="text-xs text-white/40 ml-1">s</span>
          </span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5">
        <div className="flex gap-2">
          {Array.from({ length: emitterCount }, (_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full"
              style={{
                background: `linear-gradient(90deg, #00d4ff, #7b61ff)`,
                opacity: 0.4 + (i % 3) * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
