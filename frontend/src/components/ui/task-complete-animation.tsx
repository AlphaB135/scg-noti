"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Award, Sparkles, Trophy } from "lucide-react"

type TaskCompleteAnimationProps = {
  isVisible: boolean
  onComplete: () => void
  taskTitle: string
}

export default function TaskCompleteAnimation({ isVisible, onComplete, taskTitle }: TaskCompleteAnimationProps) {
  const [particles, setParticles] = useState<
    Array<{
      id: number
      x: number
      y: number
      size: number
      color: string
      rotation: number
      shape: "circle" | "square" | "triangle"
    }>
  >([])

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number>(0)
  const [progress, setProgress] = useState(0)

  // Add audio effects for the fireworks explosions
  // Add this at the beginning of the component, after the useState declarations

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const explosionSoundsRef = useRef<HTMLAudioElement[]>([])

  // Add this useEffect to create and manage audio elements
  useEffect(() => {
    if (isVisible) {
      // Create audio elements for explosion sounds
      const explosionSounds = [
        new Audio("/sounds/explosion1.mp3"),
        new Audio("/sounds/explosion2.mp3"),
        new Audio("/sounds/explosion3.mp3"),
      ]

      // Set volume for all sounds
      explosionSounds.forEach((sound) => {
        sound.volume = 0.4
      })

      explosionSoundsRef.current = explosionSounds

      // Play success sound
      const successSound = new Audio("/sounds/success.mp3")
      successSound.volume = 0.5
      successSound.play()
      audioRef.current = successSound

      // Schedule explosion sounds
      for (let i = 0; i < 8; i++) {
        setTimeout(
          () => {
            const randomSound =
              explosionSoundsRef.current[Math.floor(Math.random() * explosionSoundsRef.current.length)]
            // Clone the audio to allow multiple simultaneous playback
            const soundClone = randomSound.cloneNode() as HTMLAudioElement
            soundClone.volume = 0.3 + Math.random() * 0.2
            soundClone.play()
          },
          200 + i * 200,
        )
      }

      return () => {
        // Clean up audio
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current = null
        }
      }
    }
  }, [isVisible])

  // Generate firework particles
  useEffect(() => {
    if (isVisible) {
      // Generate random confetti particles
      const newParticles = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        size: Math.random() * 12 + 5,
        color: [
          "#2c3e50", // Primary color
          "#3498db", // Blue
          "#f1c40f", // Yellow
          "#e74c3c", // Red
          "#2ecc71", // Green
          "#9b59b6", // Purple
          "#1abc9c", // Teal
        ][Math.floor(Math.random() * 7)],
        rotation: Math.random() * 360,
        shape: ["circle", "square", "triangle"][Math.floor(Math.random() * 3)] as "circle" | "square" | "triangle",
      }))
      setParticles(newParticles)

      // Progress animation
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 5
        })
      }, 50)

      // Set timeout to trigger onComplete callback
      const timer = setTimeout(() => {
        onComplete()
      }, 3000)

      return () => {
        clearTimeout(timer)
        clearInterval(interval)
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [isVisible, onComplete])

  // Add a function to create more dramatic explosion effects
  // Add this function after the component declaration but before any useEffect hooks

  const createExplosionEffect = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, size: number) => {
    // Create a radial gradient for the explosion
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
    gradient.addColorStop(0, "white")
    gradient.addColorStop(0.2, color)
    gradient.addColorStop(0.6, `${color}80`) // Semi-transparent
    gradient.addColorStop(1, "transparent")

    // Draw the explosion
    ctx.globalAlpha = 0.8
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fill()

    // Draw rays emanating from explosion
    const rayCount = 12
    ctx.globalAlpha = 0.5
    ctx.lineWidth = 2
    ctx.strokeStyle = color

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2
      const rayLength = size * (0.8 + Math.random() * 0.4)

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(angle) * rayLength, y + Math.sin(angle) * rayLength)
      ctx.stroke()
    }

    ctx.globalAlpha = 1.0
  }

  // Update the fireworks animation to make explosions more dramatic
  // Replace the existing useEffect for canvas fireworks with this enhanced version

  // Canvas fireworks animation
  useEffect(() => {
    if (!isVisible || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const fireworks: Array<{
      x: number
      y: number
      targetX: number
      targetY: number
      size: number
      color: string
      exploded: boolean
      explosionSize: number
      explosionFrame: number
      particles: Array<{
        x: number
        y: number
        vx: number
        vy: number
        alpha: number
        color: string
        size: number
        gravity: number
        decay: number
      }>
    }> = []

    // Create initial fireworks
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        fireworks.push({
          x: canvas.width / 2 + (Math.random() * 400 - 200),
          y: canvas.height,
          targetX: canvas.width / 2 + (Math.random() * 400 - 200),
          targetY: canvas.height / 3 + (Math.random() * 200 - 100),
          size: 4 + Math.random() * 3,
          color: [
            "#f1c40f", // Yellow
            "#e74c3c", // Red
            "#3498db", // Blue
            "#2ecc71", // Green
            "#9b59b6", // Purple
            "#1abc9c", // Teal
            "#e67e22", // Orange
            "#f39c12", // Amber
          ][Math.floor(Math.random() * 8)],
          exploded: false,
          explosionSize: 80 + Math.random() * 80, // Larger explosion size
          explosionFrame: 0,
          particles: [],
        })
      }, i * 200)
    }

    const animate = () => {
      // Semi-transparent background to create trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw fireworks
      fireworks.forEach((firework, index) => {
        if (!firework.exploded) {
          // Move firework towards target
          const dx = firework.targetX - firework.x
          const dy = firework.targetY - firework.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 5) {
            // Explode with dramatic effect
            firework.exploded = true

            // Create explosion flash
            createExplosionEffect(ctx, firework.x, firework.y, firework.color, firework.explosionSize / 2)

            // Create particles in all directions
            const particleCount = 120 + Math.floor(Math.random() * 60)
            for (let i = 0; i < particleCount; i++) {
              const angle = Math.random() * Math.PI * 2
              // Vary the speed for more natural look
              const speed = Math.random() * 6 + 2

              // Create different particle colors for each explosion
              const particleColors = [
                firework.color, // Main color
                firework.color, // Main color repeated for higher probability
                "#ffffff", // White
                "#ffcc00", // Gold
              ]

              firework.particles.push({
                x: firework.x,
                y: firework.y,
                vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
                vy: Math.sin(angle) * speed * (0.8 + Math.random() * 0.4),
                alpha: 1,
                color: particleColors[Math.floor(Math.random() * particleColors.length)],
                size: Math.random() * 4 + 1,
                gravity: 0.08 + Math.random() * 0.03,
                decay: 0.01 + Math.random() * 0.02,
              })
            }
          } else {
            // Move towards target with slight wobble
            firework.x += dx * 0.05
            firework.y += dy * 0.05 + (Math.random() * 0.4 - 0.2)

            // Draw firework trail
            ctx.beginPath()
            ctx.arc(firework.x, firework.y, firework.size, 0, Math.PI * 2)
            ctx.fillStyle = firework.color
            ctx.fill()

            // Draw glowing effect
            const glow = ctx.createRadialGradient(firework.x, firework.y, 0, firework.x, firework.y, firework.size * 3)
            glow.addColorStop(0, `${firework.color}80`)
            glow.addColorStop(1, `${firework.color}00`)

            ctx.beginPath()
            ctx.arc(firework.x, firework.y, firework.size * 3, 0, Math.PI * 2)
            ctx.fillStyle = glow
            ctx.fill()

            // Draw trail
            ctx.beginPath()
            ctx.moveTo(firework.x, firework.y)
            ctx.lineTo(firework.x - dx * 0.01, firework.y - dy * 0.01)
            ctx.strokeStyle = firework.color
            ctx.lineWidth = firework.size * 0.8
            ctx.stroke()
          }
        } else {
          // Draw explosion flash that fades out
          if (firework.explosionFrame < 10) {
            ctx.globalAlpha = 1 - firework.explosionFrame / 10
            ctx.fillStyle = firework.color
            ctx.beginPath()
            ctx.arc(
              firework.x,
              firework.y,
              (firework.explosionSize / 3) * (1 - firework.explosionFrame / 10),
              0,
              Math.PI * 2,
            )
            ctx.fill()
            ctx.globalAlpha = 1.0
            firework.explosionFrame++
          }

          // Update and draw particles
          firework.particles.forEach((particle, particleIndex) => {
            // Apply physics
            particle.x += particle.vx
            particle.y += particle.vy
            particle.vy += particle.gravity // gravity
            particle.alpha -= particle.decay // fade out

            // Remove dead particles
            if (particle.alpha <= 0) {
              firework.particles.splice(particleIndex, 1)
            } else {
              // Draw particle with glow effect
              ctx.globalAlpha = particle.alpha

              // Draw main particle
              ctx.beginPath()
              ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
              ctx.fillStyle = particle.color
              ctx.fill()

              // Draw glow
              const glow = ctx.createRadialGradient(
                particle.x,
                particle.y,
                0,
                particle.x,
                particle.y,
                particle.size * 2,
              )
              glow.addColorStop(0, `${particle.color}80`)
              glow.addColorStop(1, `${particle.color}00`)

              ctx.beginPath()
              ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
              ctx.fillStyle = glow
              ctx.fill()

              ctx.globalAlpha = 1.0
            }
          })

          // Remove firework if all particles are gone
          if (firework.particles.length === 0) {
            fireworks.splice(index, 1)

            // Add a new firework
            if (Math.random() < 0.7) {
              fireworks.push({
                x: canvas.width / 2 + (Math.random() * 400 - 200),
                y: canvas.height,
                targetX: canvas.width / 2 + (Math.random() * 400 - 200),
                targetY: canvas.height / 3 + (Math.random() * 200 - 100),
                size: 4 + Math.random() * 3,
                color: [
                  "#f1c40f", // Yellow
                  "#e74c3c", // Red
                  "#3498db", // Blue
                  "#2ecc71", // Green
                  "#9b59b6", // Purple
                  "#1abc9c", // Teal
                  "#e67e22", // Orange
                  "#f39c12", // Amber
                ][Math.floor(Math.random() * 8)],
                exploded: false,
                explosionSize: 80 + Math.random() * 80,
                explosionFrame: 0,
                particles: [],
              })
            }
          }
        }
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isVisible])

  // Draw triangle function for particles
  const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.beginPath()
    ctx.moveTo(0, -size / 2)
    ctx.lineTo(size / 2, size / 2)
    ctx.lineTo(-size / 2, size / 2)
    ctx.closePath()
    ctx.restore()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onComplete}
        >
          {/* Canvas for fireworks */}
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" onClick={(e) => e.stopPropagation()} />

          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full relative overflow-hidden z-10"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute"
                style={{
                  backgroundColor: particle.shape === "circle" ? particle.color : "transparent",
                  width: particle.size,
                  height: particle.size,
                  borderRadius: particle.shape === "circle" ? "50%" : particle.shape === "square" ? "0%" : "0%",
                  border: particle.shape === "triangle" ? `solid ${particle.color}` : "none",
                  borderWidth: particle.shape === "triangle" ? "0 5px 10px 5px" : 0,
                  borderColor:
                    particle.shape === "triangle"
                      ? `transparent transparent ${particle.color} transparent`
                      : "transparent",
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  rotate: 0,
                }}
                animate={{
                  x: particle.x * 5,
                  y: particle.y * 5,
                  opacity: [0, 1, 0],
                  rotate: particle.rotation * 2,
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.3,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Achievement unlocked banner */}
            <motion.div
              className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-white text-center py-2 font-bold"
              initial={{ y: -40 }}
              animate={{ y: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 15 }}
            >
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5" />
                <span>ความสำเร็จปลดล็อค!</span>
                <Trophy className="h-5 w-5" />
              </div>
            </motion.div>

            <div className="flex flex-col items-center text-center pt-8 relative z-10">
              {/* Success icon with pulse effect */}
              <motion.div
                className="bg-gradient-to-br from-green-500 to-emerald-700 text-white rounded-full p-6 mb-6 shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: [0, 1.2, 1],
                  rotate: [0, 0],
                }}
                transition={{
                  duration: 0.8,
                  times: [0, 0.6, 1],
                  ease: "easeOut",
                }}
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{
                    rotate: [0, 15, -15, 10, -10, 5, -5, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  <CheckCircle className="h-16 w-16" />
                </motion.div>
              </motion.div>

              {/* Pulse ring effects */}
              <motion.div
                className="absolute w-24 h-24 rounded-full border-4 border-green-500/30"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.3, repeat: 2 }}
              />

              <motion.div
                className="absolute w-24 h-24 rounded-full border-4 border-green-500/20"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.6, repeat: 2 }}
              />

              {/* Sparkle effects around the icon */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute"
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 0,
                  }}
                  animate={{
                    x: Math.cos((angle * Math.PI) / 180) * 80,
                    y: Math.sin((angle * Math.PI) / 180) * 80,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5 + i * 0.05,
                    repeat: 1,
                    repeatDelay: 1,
                  }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                </motion.div>
              ))}

              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-6 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1 }}
                />
              </div>

              {/* Title with staggered letters */}
              <div className="overflow-hidden mb-2">
                <motion.h2
                  className="text-3xl font-bold text-gray-800"
                  initial={{ y: 40 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {Array.from("เสร็จสิ้นงานแล้ว!").map((char, i) => (
                    <motion.span
                      key={`char-${i}`}
                      initial={{ opacity: 0, y: 20, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.04 }}
                      className="inline-block"
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.h2>
              </div>

              {/* Task title */}
              <motion.div
                className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <motion.p
                  className="text-lg font-medium text-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {taskTitle}
                </motion.p>
              </motion.div>

              {/* Motivational message */}
              <motion.p
                className="text-gray-600 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
              >
                ยอดเยี่ยมมาก! คุณทำได้ดีมาก ทำต่อไปเรื่อยๆ นะ
              </motion.p>

              {/* Close button */}
              <motion.button
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full hover:from-green-600 hover:to-emerald-700 transition-colors shadow-md font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.4 }}
                onClick={onComplete}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  ดีมาก!
                </span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
