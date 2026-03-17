"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FeatureBoxes } from "@/components/FeatureBoxes";

export function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(600);

  useEffect(() => {
    setMounted(true);
    setViewportHeight(window.innerHeight);
    const onResize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const progress = Math.max(0, Math.min(1, scrollY / viewportHeight));
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
  const p = easeOutCubic(progress);

  return (
    <section className="relative min-h-[200vh]">
      <div className="sticky top-0 min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="relative flex flex-col items-center justify-center px-6 -translate-y-[14vh] min-h-screen w-full"
        style={{
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          opacity: mounted ? 1 : 0,
          transition: "transform 700ms ease-out, opacity 700ms ease-out",
        }}
      >
        <h1
          className="font-serif text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tight text-white/95 absolute"
          style={{
            opacity: 1 - p,
            transform: `translateY(${p * -72}px) scale(${1 - p * 0.06})`,
            whiteSpace: "nowrap",
            transition: "opacity 500ms cubic-bezier(0.33, 1, 0.68, 1), transform 500ms cubic-bezier(0.33, 1, 0.68, 1)",
          }}
        >
          Welcome to osn. project
        </h1>

        <div
          className="flex flex-col items-center justify-center absolute inset-0"
          style={{
            opacity: p,
            transform: `translateY(${(1 - p) * 56}px) scale(${0.94 + p * 0.06})`,
            transition: "opacity 500ms cubic-bezier(0.33, 1, 0.68, 1), transform 500ms cubic-bezier(0.33, 1, 0.68, 1)",
          }}
        >
          <div className="mb-5 sm:mb-6 flex justify-center">
            <Image
              src="/logo.png"
              alt="osn."
              width={56}
              height={56}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain"
            />
          </div>
          <h2 className="font-serif text-center text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium tracking-tight text-white/90 whitespace-nowrap mb-16 sm:mb-20">
            The best plugin-base— No, no, not quite.
          </h2>

          <FeatureBoxes />
        </div>
      </div>
      </div>
    </section>
  );
}
