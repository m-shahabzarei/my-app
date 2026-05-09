"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Road Map", href: "/roadmap" },
  { name: "My Messages", href: "/messages" },
  { name: "Job Listings", href: "/jobs" },
  { name: "Planning", href: "/planning" },
  { name: "Learning", href: "/learning" },
  { name: "Messengers", href: "/messengers" },
  { name: "Job Sources", href: "/settings/jobs" },
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
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 rounded-xl px-3 py-2.5 text-sm transition-colors lg:p-3 ${
                isActive
                  ? "bg-white text-black"
                  : "text-white hover:bg-gray-800"
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}