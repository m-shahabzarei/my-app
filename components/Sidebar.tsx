"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Dashboard", href: "/dashboard" },
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
    <aside className="fixed right-0 top-0 h-screen w-64 bg-black border-l border-gray-800 p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">MY</h1>
      </div>
      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`p-3 rounded-lg text-sm transition-colors ${
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