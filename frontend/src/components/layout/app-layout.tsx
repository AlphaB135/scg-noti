"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../sidebar/sidebar";
import MobileHeader from "../sidebar/mobile-header";
import MobileSidebar from "../sidebar/mobile-sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export default function AppLayout({
  children,
  title,
  description,
}: AppLayoutProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Toggle function for mobile menu
  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // อัพเดทเวลาทุกวินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };
  return (
    <div className="flex min-h-screen bg-white font-noto">
      {/* Mobile Header */}
      {isMobile && (
        <MobileHeader isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} />
      )}

      {/* Desktop Sidebar - hidden on mobile */}
      {!isMobile && <Sidebar onLogout={handleLogout} />}

      {/* Mobile Sidebar - only shown when menu is open */}
      {isMobile && (
        <MobileSidebar
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)} // ✅ ส่ง onClose ให้
          onLogout={handleLogout}
        />
      )}

      {/* Main Content */}
      <main
        className={`flex-1 ${!isMobile ? "md:ml-64" : "mt-16"} p-6 ${
          !isMobile ? "pt-24" : "pt-6"
        } w-full`}
      >
        {/* Desktop Header - hidden on mobile */}
        {!isMobile && (
          <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 ml-64">
              <div className="py-1">
                <h1 className="text-xl font-bold text-gray-800">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-500 mt-1">{description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-sm text-gray-600">
                  <div>
                    {currentTime.toLocaleDateString("th-TH", {
                      weekday: "long",
                      day: "numeric",
                      month: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="font-bold text-lg">
                    {currentTime.toLocaleTimeString("th-TH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}{" "}
                    น.
                  </div>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Page Content */}
        <div className="mt-1">{children}</div>
      </main>
    </div>
  );
}
