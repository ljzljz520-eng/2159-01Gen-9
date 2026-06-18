import { useEffect, useRef } from 'react'
import { ParticleEngine } from '@/lib/ParticleEngine'
import { useFountainStore } from '@/hooks/useFountainStore'

export default function FountainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<ParticleEngine | null>(null)
  const emitterCount = useFountainStore((s) => s.emitterCount)
  const setParticleCount = useFountainStore((s) => s.setParticleCount)
  const setAvgLifetime = useFountainStore((s) => s.setAvgLifetime)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const engine = new ParticleEngine(canvas, (count, avgLife) => {
      setParticleCount(count)
      setAvgLifetime(avgLife)
    })
    engineRef.current = engine
    engine.start()

    const handleResize = () => engine.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      engine.stop()
    }
  }, [setParticleCount, setAvgLifetime])

  useEffect(() => {
    engineRef.current?.setEmitterCount(emitterCount)
  }, [emitterCount])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  )
}
