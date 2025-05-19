"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, Star } from "lucide-react"

type ConfettiAnimationProps = {
  isVisible: boolean
  onComplete: () => void
  title: string
  description: string
  icon?: React.ReactNode
  duration?: number
}

export default function ConfettiAnimation({
  isVisible,
  onComplete,
  title,
  description,
  icon = <CheckCircle className="h-16 w-16" />,
  duration = 2200,
}: ConfettiAnimationProps) {
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; size: number; color: string; rotation: number }>
  >([])

  useEffect(() => {
    if (isVisible) {
      // Generate random confetti particles
      const newParticles = Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100 - 50,
        y: Math.random() * 100 - 50,
        size: Math.random() * 10 + 5,
        color: [
          "#2c3e50", // Primary color
          "#3498db", // Blue
          "#f1c40f", // Yellow
          "#e74c3c", // Red
          "#2ecc71", // Green
        ][Math.floor(Math.random() * 5)],
        rotation: Math.random() * 360,
      }))
      setParticles(newParticles)

      // Set timeout to trigger onComplete callback
      const timer = setTimeout(() => {
        onComplete()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, onComplete, duration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onComplete}
        >
          <motion.div
            className="bg-white rounded-xl p-8 max-w-md w-full relative overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti particles */}
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute"
                style={{
                  backgroundColor: particle.color,
                  width: particle.size,
                  height: particle.size,
                  borderRadius: Math.random() > 0.5 ? "50%" : "0%",
                }}
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 0,
                  rotate: 0,
                }}
                animate={{
                  x: particle.x * 3,
                  y: particle.y * 3,
                  opacity: [0, 1, 0],
                  rotate: particle.rotation,
                }}
                transition={{
                  duration: 1.5,
                  delay: Math.random() * 0.2,
                  ease: "easeOut",
                }}
              />
            ))}

            {/* Star burst effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 0.5],
                    x: Math.cos((i * Math.PI) / 4) * 120,
                    y: Math.sin((i * Math.PI) / 4) * 120,
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.05,
                    repeat: 1,
                    repeatType: "reverse",
                  }}
                >
                  <Star className="h-6 w-6 text-[#f1c40f] fill-[#f1c40f]" />
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col items-center text-center relative z-10">
              {/* Success icon with pulse effect */}
              <motion.div
                className="bg-[#2c3e50] text-white rounded-full p-6 mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, times: [0, 0.6, 1] }}
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {icon}
                </motion.div>
              </motion.div>

              {/* Pulse ring effect */}
              <motion.div
                className="absolute w-24 h-24 rounded-full border-4 border-[#2c3e50]/20"
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{ duration: 1, delay: 0.3, repeat: 1 }}
              />

              {/* Title with staggered letters */}
              <div className="overflow-hidden">
                <motion.h2
                  className="text-2xl font-bold text-[#2c3e50]"
                  initial={{ y: 40 }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  {title.split("").map((char, i) => (
                    <motion.span
                      key={`char-${i}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.03 }}
                      className="inline-block"
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  ))}
                </motion.h2>
              </div>

              {/* Description */}
              <motion.p
                className="text-gray-600 mt-2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {description}
              </motion.p>

              {/* Close button */}
              <motion.button
                className="mt-8 px-6 py-2 bg-[#2c3e50] text-white rounded-md hover:bg-[#1a2530] transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={onComplete}
              >
                ตกลง
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
