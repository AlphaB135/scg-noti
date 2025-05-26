"use client"

import { useState, useEffect } from "react"

export function useMobileDetector() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Function to check if the screen is mobile-sized
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check on initial load
    checkIsMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile)

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  return isMobile
}
