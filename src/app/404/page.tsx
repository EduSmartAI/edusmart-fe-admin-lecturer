"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ThemeSwitch } from "EduSmart/components/Themes/Theme";
import { useValidateStore } from "EduSmart/stores/Validate/ValidateStore";

const ACCENT = "#ccff00"; // neon lime you liked
const BG = "#020712"; // deep navy/blue‑black you mentioned

export default function NotFound() {
  useEffect(() => {
    return () => {
      useValidateStore.getState().setInValid(false);
    };
  }, []);
  return (
    <div className="min-h-screen">
      <main
        className="relative flex min-h-screen w-full flex-col items-center justify-center text-center select-none"
        style={{ backgroundColor: BG }}
      >
        <nav className="pointer-events-none absolute right-4 top-4 text-xs leading-tight tracking-wider text-white/70 sm:right-8 sm:top-8">
          <div className="pointer-events-auto flex items-center gap-4">
            <ThemeSwitch />
          </div>
        </nav>

        {/* ─── Center 404 Graphic ───────────────────────────────────────────── */}
        <div className="mb-4 flex items-center justify-center gap-3 text-[7rem] font-bold leading-none sm:text-[10rem] md:text-[12rem] lg:text-[14rem]">
          <span className="text-white">4</span>
          <span className="relative inline-flex h-[0.7em] w-[0.7em] items-center justify-center">
            {/* neon ring */}
            <span
              className="absolute inset-0 rounded-full border-[0.08em]"
              style={{ borderColor: ACCENT }}
            />
            {/* eye */}
            <svg
              viewBox="0 0 64 64"
              className="relative h-[60%] w-[60%]"
              aria-hidden
            >
              <ellipse cx="32" cy="32" rx="28" ry="18" fill={ACCENT} />
              <circle cx="32" cy="32" r="6" fill={BG} />
            </svg>
          </span>
          <span className="text-white">4</span>
        </div>

        {/* ─── Message ──────────────────────────────────────────────────────── */}
        <h1 className="text-xl font-medium tracking-wide text-white sm:text-2xl md:text-3xl">
          SORRY, THERE&apos;S <span className="block sm:inline" />
          <span style={{ color: ACCENT }}>NOTHING HERE</span>
        </h1>

        {/* ─── Go Home Button ───────────────────────────────────────────────── */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-block rounded px-8 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-transform duration-150 hover:scale-105 focus:scale-105 focus:outline-none"
            style={{ backgroundColor: ACCENT }}
          >
            GO HOME
          </Link>
        </div>

        {/* ─── Footer Meta ──────────────────────────────────────────────────── */}
        <footer className="pointer-events-none absolute bottom-4 flex w-full items-end justify-between px-4 text-[10px] leading-tight tracking-widest text-white/50 sm:bottom-6 sm:px-8">
          <span>9/1999</span>
          <span>YOUR NAME © {new Date().getFullYear()}</span>
          <span>CODED BY YOU</span>
        </footer>
      </main>
    </div>
  );
}
