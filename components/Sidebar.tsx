"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Briefcase,
  CalendarDays,
  GraduationCap,
  Inbox,
  LayoutDashboard,
  Map,
  MessagesSquare,
  Notebook,
  Settings,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Road Map", href: "/roadmap", icon: Map },
  { name: "My Messages", href: "/messages", icon: Inbox },
  { name: "Job Listings", href: "/jobs", icon: Briefcase },
  { name: "Planning", href: "/planning", icon: CalendarDays },
  { name: "Notes", href: "/notes", icon: Notebook },
  { name: "AI", href: "/ai", icon: Sparkles },
  { name: "Learning", href: "/learning", icon: GraduationCap },
  { name: "Messengers", href: "/messengers", icon: MessagesSquare },
  { name: "Job Sources", href: "/settings/jobs", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-800 bg-black/95 p-2 backdrop-blur-xl lg:inset-x-auto lg:right-0 lg:top-0 lg:h-screen lg:w-64 lg:border-l lg:border-t-0 lg:p-4">
      <div className="mb-8 hidden lg:block">
        <h1 className="text-3xl font-bold text-white">MY</h1>
      </div>
      <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors lg:p-3 ${
                isActive ? "bg-white text-black" : "text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="whitespace-nowrap">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
