// src/ui/GlobalMainMenuButton.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function GlobalMainMenuButton() {
  const pathname = usePathname();

  if (!pathname || pathname === "/") {
    return null;
  }

  return (
    <div className="fixed left-4 top-4 z-30">
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-label="Palaa päävalikkoon"
      >
        Päävalikkoon
      </Link>
    </div>
  );
}
