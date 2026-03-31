"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Car, CalendarDays, Receipt, User, LucideIcon } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

function SidebarItem({ href, icon: Icon, label }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 w-full p-4 text-xl font-bold rounded-2xl transition-colors whitespace-nowrap",
        isActive 
          ? "bg-[var(--primary)] text-white shadow" 
          : "hover:bg-slate-800 text-white"
      )}
    >
      <Icon className="w-6 h-6" /> {label}
    </Link>
  );
}

export default function Sidebar() {
  return (
    <nav className="flex items-center md:flex-col gap-4 overflow-x-auto md:overflow-visible pb-4 md:pb-0">
      <SidebarItem href="/dashboard" icon={Home} label="Home" />
      <SidebarItem href="/dashboard/profile" icon={User} label="My Profile" />
      <SidebarItem href="/dashboard/vehicles" icon={Car} label="My Vehicles" />
      <SidebarItem href="/dashboard/subscription" icon={CalendarDays} label="Plans" />
      <SidebarItem href="/dashboard/history" icon={Receipt} label="History" />
    </nav>
  );
}
