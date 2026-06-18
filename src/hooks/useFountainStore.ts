import { create } from 'zustand'

interface FountainState {
  emitterCount: number
  setEmitterCount: (count: number) => void
  particleCount: number
  setParticleCount: (count: number) => void
  avgLifetime: number
  setAvgLifetime: (lifetime: number) => void
}

export const useFountainStore = create<FountainState>((set) => ({
  emitterCount: 3,
  setEmitterCount: (count) => set({ emitterCount: count }),
  particleCount: 0,
  setParticleCount: (count) => set({ particleCount: count }),
  avgLifetime: 0,
  setAvgLifetime: (lifetime) => set({ avgLifetime: lifetime }),
}))
