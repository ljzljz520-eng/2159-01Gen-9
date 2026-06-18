interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  hue: number
  alpha: number
}

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  alpha: number
}

interface Emitter {
  x: number
  y: number
}

const GRAVITY = 0.15
const INITIAL_SPEED_MIN = 6
const INITIAL_SPEED_MAX = 12
const SPREAD_ANGLE = 0.4
const MAX_PARTICLES = 3000
const EMIT_RATE = 4
const PARTICLE_LIFE_MIN = 80
const PARTICLE_LIFE_MAX = 160
const WATER_LEVEL_RATIO = 0.82

export class ParticleEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private particles: Particle[] = []
  private ripples: Ripple[] = []
  private emitters: Emitter[] = []
  private emitterCount = 3
  private width = 0
  private height = 0
  private animFrameId = 0
  private time = 0
  private lifetimes: number[] = []
  private onStatsUpdate: (count: number, avgLifetime: number) => void

  constructor(
    canvas: HTMLCanvasElement,
    onStatsUpdate: (count: number, avgLifetime: number) => void
  ) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')!
    this.onStatsUpdate = onStatsUpdate
    this.resize()
    this.updateEmitters()
  }

  resize() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.width = rect.width
    this.height = rect.height
    this.canvas.width = rect.width * dpr
    this.canvas.height = rect.height * dpr
    this.ctx.scale(dpr, dpr)
    this.updateEmitters()
  }

  setEmitterCount(count: number) {
    this.emitterCount = count
    this.updateEmitters()
  }

  private updateEmitters() {
    const waterY = this.height * WATER_LEVEL_RATIO
    const spacing = this.width / (this.emitterCount + 1)
    this.emitters = Array.from({ length: this.emitterCount }, (_, i) => ({
      x: spacing * (i + 1),
      y: waterY,
    }))
  }

  start() {
    const loop = () => {
      this.update()
      this.render()
      this.animFrameId = requestAnimationFrame(loop)
    }
    loop()
  }

  stop() {
    cancelAnimationFrame(this.animFrameId)
  }

  private emit() {
    for (const emitter of this.emitters) {
      for (let i = 0; i < EMIT_RATE; i++) {
        if (this.particles.length >= MAX_PARTICLES) return

        const angle = -Math.PI / 2 + (Math.random() - 0.5) * SPREAD_ANGLE * 2
        const speed =
          INITIAL_SPEED_MIN + Math.random() * (INITIAL_SPEED_MAX - INITIAL_SPEED_MIN)

        const maxLife =
          PARTICLE_LIFE_MIN + Math.random() * (PARTICLE_LIFE_MAX - PARTICLE_LIFE_MIN)

        this.particles.push({
          x: emitter.x + (Math.random() - 0.5) * 4,
          y: emitter.y,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.8,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife,
          size: 1.5 + Math.random() * 2.5,
          hue: 190 + Math.random() * 60,
          alpha: 1,
        })
      }
    }
  }

  private update() {
    this.time++
    this.emit()

    const waterY = this.height * WATER_LEVEL_RATIO
    const aliveParticles: Particle[] = []

    for (const p of this.particles) {
      p.vy += GRAVITY
      p.x += p.vx
      p.y += p.vy
      p.life++

      const lifeRatio = p.life / p.maxLife
      p.alpha = 1 - lifeRatio * lifeRatio

      if (p.y >= waterY && p.vy > 0 && lifeRatio > 0.15) {
        this.ripples.push({
          x: p.x,
          y: waterY,
          radius: 1,
          maxRadius: 8 + Math.random() * 12,
          alpha: 0.6,
        })
        this.lifetimes.push(p.life)
        if (this.lifetimes.length > 200) {
          this.lifetimes = this.lifetimes.slice(-200)
        }
        continue
      }

      if (p.life < p.maxLife && p.y < this.height) {
        aliveParticles.push(p)
      } else {
        this.lifetimes.push(p.life)
        if (this.lifetimes.length > 200) {
          this.lifetimes = this.lifetimes.slice(-200)
        }
      }
    }

    this.particles = aliveParticles

    const aliveRipples: Ripple[] = []
    for (const r of this.ripples) {
      r.radius += 0.8
      r.alpha -= 0.02
      if (r.alpha > 0 && r.radius < r.maxRadius) {
        aliveRipples.push(r)
      }
    }
    this.ripples = aliveRipples

    const avgLife =
      this.lifetimes.length > 0
        ? this.lifetimes.reduce((a, b) => a + b, 0) / this.lifetimes.length
        : 0
    this.onStatsUpdate(this.particles.length, avgLife / 60)
  }

  private render() {
    const ctx = this.ctx
    const w = this.width
    const h = this.height

    ctx.fillStyle = '#0a0e1a'
    ctx.fillRect(0, 0, w, h)

    this.renderBackgroundGlow(ctx, w, h)
    this.renderParticles(ctx)
    this.renderWater(ctx, w, h)
    this.renderRipples(ctx)
    this.renderEmitterGlow(ctx)
  }

  private renderBackgroundGlow(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const waterY = h * WATER_LEVEL_RATIO
    for (const emitter of this.emitters) {
      const gradient = ctx.createRadialGradient(
        emitter.x, waterY - 40, 0,
        emitter.x, waterY - 40, 120
      )
      gradient.addColorStop(0, 'rgba(0, 212, 255, 0.06)')
      gradient.addColorStop(1, 'rgba(0, 212, 255, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(emitter.x - 120, waterY - 160, 240, 200)
    }
  }

  private renderParticles(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const lifeRatio = p.life / p.maxLife
      const sizeMultiplier = lifeRatio < 0.1 ? lifeRatio * 10 : 1 - lifeRatio * 0.5
      const size = p.size * sizeMultiplier

      ctx.beginPath()
      ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha * 0.9})`
      ctx.fill()

      if (p.alpha > 0.3) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha * 0.1})`
        ctx.fill()
      }
    }
  }

  private renderWater(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const waterY = h * WATER_LEVEL_RATIO
    const waterHeight = h - waterY

    ctx.beginPath()
    ctx.moveTo(0, waterY)

    for (let x = 0; x <= w; x += 4) {
      const wave1 = Math.sin((x * 0.02) + this.time * 0.03) * 3
      const wave2 = Math.sin((x * 0.035) + this.time * 0.02) * 2
      const wave3 = Math.sin((x * 0.01) + this.time * 0.05) * 1.5
      ctx.lineTo(x, waterY + wave1 + wave2 + wave3)
    }

    ctx.lineTo(w, h)
    ctx.lineTo(0, h)
    ctx.closePath()

    const waterGrad = ctx.createLinearGradient(0, waterY, 0, h)
    waterGrad.addColorStop(0, 'rgba(0, 80, 180, 0.25)')
    waterGrad.addColorStop(0.3, 'rgba(0, 60, 150, 0.35)')
    waterGrad.addColorStop(1, 'rgba(0, 20, 60, 0.5)')
    ctx.fillStyle = waterGrad
    ctx.fill()

    const surfaceGrad = ctx.createLinearGradient(0, waterY - 2, 0, waterY + 8)
    surfaceGrad.addColorStop(0, 'rgba(0, 200, 255, 0.15)')
    surfaceGrad.addColorStop(0.5, 'rgba(0, 200, 255, 0.25)')
    surfaceGrad.addColorStop(1, 'rgba(0, 200, 255, 0)')
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.3)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  private renderRipples(ctx: CanvasRenderingContext2D) {
    for (const r of this.ripples) {
      ctx.beginPath()
      ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.3, 0, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(150, 220, 255, ${r.alpha})`
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }

  private renderEmitterGlow(ctx: CanvasRenderingContext2D) {
    for (const emitter of this.emitters) {
      const pulse = 0.5 + Math.sin(this.time * 0.08) * 0.3
      const gradient = ctx.createRadialGradient(
        emitter.x, emitter.y, 0,
        emitter.x, emitter.y, 20
      )
      gradient.addColorStop(0, `rgba(0, 212, 255, ${0.8 * pulse})`)
      gradient.addColorStop(0.5, `rgba(123, 97, 255, ${0.3 * pulse})`)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(emitter.x, emitter.y, 20, 0, Math.PI * 2)
      ctx.fill()

      ctx.beginPath()
      ctx.arc(emitter.x, emitter.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${0.7 + pulse * 0.3})`
      ctx.fill()
    }
  }
}
