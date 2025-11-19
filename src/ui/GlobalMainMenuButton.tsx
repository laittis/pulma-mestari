// src/ui/GlobalMainMenuButton.tsx
"use client";

import type { MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";

export function GlobalMainMenuButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (!pathname || pathname === "/") {
    return null;
  }

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (pathname.startsWith("/game")) {
      event.preventDefault();
      window.dispatchEvent(new Event("pm-exit-request"));
      return;
    }

    router.push("/");
  };

  return (
    <div className="fixed left-4 top-4 z-30">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center justify-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        aria-label="Palaa päävalikkoon"
      >
        Päävalikkoon
      </button>
    </div>
  );
}
