"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Link, useLocation } from "react-router-dom"
import {
  Bell,
  CheckSquare,
  LayoutDashboard,
  Play,
  Settings,
  LogOut,
  ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4",
  {
    variants: {
      variant: {
        default:    "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:"bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:  "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:      "hover:bg-accent hover:text-accent-foreground",
        link:       "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-9 rounded-md px-3",
        lg:      "h-11 rounded-md px-8",
        icon:    "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size:    "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
          VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

const sidebarLinks = [
  { name: "แดชบอร์ด",    href: "/dashboard",    icon: LayoutDashboard },
  { name: "การแจ้งเตือน", href: "/notifications", icon: Bell            },
  { name: "การอนุมัติ",   href: "/approvals",    icon: CheckSquare     },
  { name: "ทริกเกอร์ RPA", href: "/rpa",         icon: Play            },
  {
    name: "บันทึกตรวจสอบ",
    href: "/audit-logs",
    icon: ClipboardList,
    adminOnly: true,
  },
  { name: "การตั้งค่า",     href: "/settings",     icon: Settings        },
]

export function AppSidebar() {
  const { pathname } = useLocation()
  const isAdmin = true // replace with real auth check

  return (
    <aside className="hidden md:flex flex-col h-screen overflow-hidden w-64 bg-white border-r border-gray-200 font-noto">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded bg-[#E2001A] flex items-center justify-center text-white font-bold">
            SCG
          </div>
          <span className="ml-2 text-lg font-semibold font-noto">ระบบแจ้งเตือน</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {sidebarLinks.map((link) => {
          if (link.adminOnly && !isAdmin) return null
          const isActive = pathname === link.href
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors font-noto",
                isActive
                  ? "bg-[#E2001A]/10 text-[#E2001A]"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon
                className={cn(
                  "mr-2 h-5 w-5",
                  isActive ? "text-[#E2001A]" : "text-gray-500"
                )}
              />
              {link.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <Button variant="outline" className="w-full justify-start text-gray-700 font-noto">
          <LogOut className="mr-2" />
          ออกจากระบบ
        </Button>
      </div>
    </aside>
  )
}
AppSidebar.displayName = "AppSidebar"
