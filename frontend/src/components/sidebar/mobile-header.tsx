"use client"

interface MobileHeaderProps {
  isMenuOpen: boolean
  toggleMenu: () => void
}

export default function MobileHeader({ isMenuOpen, toggleMenu }: MobileHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 bg-red-800 text-white flex items-center justify-between px-4 py-3 shadow-lg z-50">
      <div className="flex items-center">
        <img
          src="https://storage.googleapis.com/be8website.appspot.com/logo-scg-white.png"
          alt="SCG Logo"
          className="h-9 mr-3"
        />
        <div className="border-l-2 border-white/30 pl-3">
          <h1 className="text-lg font-bold tracking-wide">SelfSync</h1>
          <p className="text-xs text-white/70">Reminder Dashboard</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-semibold border border-white/20">
          ปฉ
        </div>
        <button
          onClick={toggleMenu}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 border border-white/20 focus:outline-none"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
