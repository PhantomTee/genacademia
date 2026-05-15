"use client";

import { useState, useEffect, useRef } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const COLS = 62;
const ROWS = 28;

// Density ramp: index 0 = darkest (least ink), last = brightest (most ink)
const RAMP = " .,;:+=*%$#@";
const GLITCH = "@#$%&*!?/\\|~-+";

const FRAMES = [
  { src: "/ascii-eth.png",    label: "ethereum", invert: true  },
  { src: "/ascii-book.png",   label: "learn",    invert: true  },
  { src: "/ascii-pencil.png", label: "code",     invert: true  },
  { src: "/ascii-gl.png",     label: "genlayer", invert: false },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

type Grid = string[][];

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function imgToGrid(src: string, invert: boolean): Promise<Grid> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = COLS;
      canvas.height = ROWS;
      const ctx = canvas.getContext("2d")!;
      // Fill background opposite to invert direction to handle transparency
      ctx.fillStyle = invert ? "#ffffff" : "#000000";
      ctx.fillRect(0, 0, COLS, ROWS);
      ctx.drawImage(img, 0, 0, COLS, ROWS);
      const { data } = ctx.getImageData(0, 0, COLS, ROWS);
      const grid: Grid = [];
      for (let r = 0; r < ROWS; r++) {
        const row: string[] = [];
        for (let c = 0; c < COLS; c++) {
          const i = (r * COLS + c) * 4;
          let b = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
          if (invert) b = 1 - b;
          const ci = Math.round(b * (RAMP.length - 1));
          row.push(RAMP[Math.max(0, Math.min(RAMP.length - 1, ci))]);
        }
        grid.push(row);
      }
      resolve(grid);
    };
    img.onerror = () => reject(new Error(`Cannot load ${src}`));
    img.src = src;
  });
}

function blankGrid(): Grid {
  return Array.from({ length: ROWS }, () => Array(COLS).fill("."));
}

function shuffledPositions(): [number, number][] {
  const pos: [number, number][] = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      pos.push([r, c]);
  for (let i = pos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pos[i], pos[j]] = [pos[j], pos[i]];
  }
  return pos;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AsciiHero() {
  const [display, setDisplay] = useState<Grid>(blankGrid);
  const [activeIdx, setActiveIdx] = useState(0);
  const [ready, setReady] = useState(false);

  const grids = useRef<Grid[]>([]);
  const timers = useRef<{
    morph: ReturnType<typeof setInterval> | null;
    cycle: ReturnType<typeof setInterval> | null;
  }>({ morph: null, cycle: null });
  const morphRef = useRef<{
    pos: [number, number][];
    prog: number;
    target: Grid;
    idx: number;
  }>({ pos: [], prog: 0, target: blankGrid(), idx: 0 });

  // Load all images once, client-side only
  useEffect(() => {
    Promise.all(FRAMES.map(({ src, invert }) => imgToGrid(src, invert)))
      .then((loaded) => {
        grids.current = loaded;
        setDisplay(loaded[0]);
        setReady(true);
      })
      .catch(console.error);
  }, []);

  const morphTo = (idx: number) => {
    const target = grids.current[idx];
    if (!target) return;
    if (timers.current.morph) clearInterval(timers.current.morph);

    morphRef.current = { pos: shuffledPositions(), prog: 0, target, idx };

    const BATCH = 55;
    const NOISE = 28;

    timers.current.morph = setInterval(() => {
      const { pos, prog, target: tgt, idx: ti } = morphRef.current;

      setDisplay(prev => {
        const next = prev.map(r => [...r]);
        for (let i = prog; i < Math.min(prog + BATCH, pos.length); i++) {
          const [r, c] = pos[i];
          next[r][c] = tgt[r][c];
        }
        for (let i = prog + BATCH; i < Math.min(prog + BATCH + NOISE, pos.length); i++) {
          const [r, c] = pos[i];
          next[r][c] = GLITCH[Math.floor(Math.random() * GLITCH.length)];
        }
        return next;
      });

      morphRef.current.prog += BATCH;
      if (morphRef.current.prog >= pos.length) {
        clearInterval(timers.current.morph!);
        timers.current.morph = null;
        setDisplay(grids.current[ti]);
      }
    }, 16);
  };

  useEffect(() => {
    if (!ready) return;

    timers.current.cycle = setInterval(() => {
      setActiveIdx(prev => {
        const next = (prev + 1) % FRAMES.length;
        morphTo(next);
        return next;
      });
    }, 4000);

    return () => {
      if (timers.current.cycle) clearInterval(timers.current.cycle);
      if (timers.current.morph) clearInterval(timers.current.morph);
    };
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-start gap-3">
      <pre
        aria-hidden
        className="font-mono text-[8.5px] leading-[1.25] select-none text-ink dark:text-cream-200 transition-colors"
      >
        {display.map(row => row.join("")).join("\n")}
      </pre>

      <div className="flex gap-5">
        {FRAMES.map(({ label }, i) => (
          <span
            key={label}
            className={`text-[10px] font-mono uppercase tracking-widest transition-all duration-700 ${
              i === activeIdx
                ? "text-ink dark:text-cream-200 opacity-100"
                : "text-ink/15 dark:text-cream-200/15"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
