"use client"

import { useState } from "react"
import { useLocation } from "react-router-dom"
import { Bell, Menu, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AppSidebar } from "./app-sidebar"

export function Header() {
  const { pathname } = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)

  const getPageTitle = () => {
    if (pathname.startsWith("/dashboard")) return "แดชบอร์ด"
    if (pathname.startsWith("/notifications")) return "การแจ้งเตือน"
    if (pathname.startsWith("/approvals")) return "การอนุมัติ"
    if (pathname.startsWith("/rpa")) return "ทริกเกอร์ RPA"
    if (pathname.startsWith("/settings")) return "การตั้งค่า"
    return "ระบบแจ้งเตือน SCG"
  }

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden font-noto">
                <Menu className="h-5 w-5" />
                <span className="sr-only font-noto">สลับเมนู</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <AppSidebar />
            </SheetContent>
          </Sheet>
          <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
        </div>

        <div className="flex items-center gap-4">
          {searchOpen ? (
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="ค้นหา..."
                className="w-64 pl-8 h-9"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)} className="font-noto">
              <Search className="h-5 w-5" />
              <span className="sr-only font-noto">ค้นหา</span>
            </Button>
          )}

          <Button variant="ghost" size="icon" className="relative font-noto">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E2001A] rounded-full" />
            <span className="sr-only font-noto">การแจ้งเตือน</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full font-noto">
                <User className="h-5 w-5" />
                <span className="sr-only font-noto">เมนูผู้ใช้</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-noto">บัญชีของฉัน</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-noto">โปรไฟล์</DropdownMenuItem>
              <DropdownMenuItem className="font-noto">การตั้งค่า</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="font-noto">ออกจากระบบ</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
