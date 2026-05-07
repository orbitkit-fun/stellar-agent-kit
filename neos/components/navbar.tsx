"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const ORBIT_URL = "https://orbitkit.fun";

const NAV_LINKS = [
  { href: "/#paths", label: "Paths" },
];

export function Navbar() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const last = lastScrollYRef.current;
      if (currentScrollY < last || currentScrollY < 10) setIsVisible(true);
      else if (currentScrollY > last && currentScrollY > 100) setIsVisible(false);
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-1/2 -translate-x-1/2 z-50 px-4 w-max max-w-[calc(100vw-2rem)] transition-all duration-700 ease-in-out ${
        isVisible ? "top-6 opacity-100" : "-top-24 opacity-0"
      }`}
    >
      <div className="px-6 sm:px-8 sm:pr-10 py-4 flex items-center justify-between sm:justify-center gap-6 sm:gap-8 min-w-0 w-full rounded-full bg-zinc-900/80 border border-zinc-800/60 backdrop-blur-xl shadow-lg shadow-black/25">
        <div className="hidden sm:flex items-center justify-center gap-6 sm:gap-8 min-w-0 shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-white hover:text-zinc-200 transition-colors duration-300 shrink-0"
          >
            <Image src="/brand/orbit/orbit.png" alt="Orbit" width={28} height={28} className="shrink-0" />
            Orbit
          </Link>
          <span className="hidden md:block w-px h-5 bg-zinc-700 shrink-0 mx-4" aria-hidden />
          <a
            href={ORBIT_URL}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm rounded-lg text-zinc-400 hover:text-white transition-colors duration-300 whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </a>
          <nav className="flex items-center gap-1 min-w-0 shrink" aria-label="neos">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === "/" && href === "/#paths";
              const className = `px-3 py-2.5 text-sm rounded-lg transition-colors duration-300 whitespace-nowrap ${
                isActive ? "text-white font-medium" : "text-zinc-400 hover:text-white"
              }`;
              return (
                <Link key={label} href={href} className={className} scroll>
                  {label}
                </Link>
              );
            })}
          </nav>
          <span className="hidden md:block w-px h-5 bg-zinc-700 shrink-0 mx-4" aria-hidden />
          <LiquidMetalButton href={ORBIT_URL} label="Open Orbit" width={140} className="shrink-0" target="_blank" rel="noopener noreferrer" />
        </div>
        <div className="flex sm:hidden items-center w-full justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-white hover:text-zinc-200 transition-colors">
            <Image src="/brand/orbit/orbit.png" alt="Orbit" width={24} height={24} className="shrink-0" />
            Orbit
          </Link>
          <a href={ORBIT_URL} className="flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-400 hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" />
            Open Orbit
          </a>
        </div>
      </div>
    </nav>
  );
}
