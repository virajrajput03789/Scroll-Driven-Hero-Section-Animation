"use client";

/**
 * VELOCITY INTERACTIVE HERO SECTION
 * 
 * This component implements a high-performance horizontal car drive animation
 * contained within a fixed 100vh viewport. The animation is driven by mouse 
 * wheel or touch interaction, mapping input delta to vertical progress.
 */

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

/**
 * STAT BOX COMPONENT
 * Floating information boxes that appear at specific points in the timeline.
 */
const StatBox = ({ label, value, theme = "yellow", boxRef }) => {
  const themes = {
    yellow: "bg-[#def54f] text-[#111]",
    blue: "bg-[#6ac9ff] text-[#111]",
    dark: "bg-[#333333] text-[#fff]",
    orange: "bg-[#fa7328] text-[#111]"
  };

  return (
    <div
      ref={boxRef}
      className={`absolute z-30 opacity-0 pointer-events-none p-6 md:p-10 rounded-xl shadow-2xl flex flex-col gap-0 min-w-[300px] border border-white/5 ${themes[theme]}`}
    >
      <div className="text-5xl md:text-7xl font-bold leading-none tracking-tighter">
        <span className="text-4xl md:text-6xl">{value.replace('%', '')}</span>
        {value.includes('%') && '%'}
      </div>
      <div className="text-sm md:text-lg font-medium opacity-80 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
};

export default function Home() {
  const container = useRef();
  const carRef = useRef();
  const trailRef = useRef();
  const roadRef = useRef();
  const box1 = useRef();
  const box2 = useRef();
  const box3 = useRef();
  const box4 = useRef();

  useGSAP(() => {
    // Find individual characters for road reveal
    const chars = roadRef.current?.querySelectorAll('.char');
    if (!chars || chars.length === 0) return;

    /**
     * 1. COORDINATE CALCULATION
     * Find the exact horizontal positions of letters to trigger reveals.
     */
    const roadRect = roadRef.current.getBoundingClientRect();
    const charData = Array.from(chars).map(char => {
      const rect = char.getBoundingClientRect();
      return {
        element: char,
        triggerX: rect.left - roadRect.left + (rect.width / 2),
      };
    });

    const carWidth = carRef.current.offsetWidth || 150;
    const firstCharX = charData[0].triggerX;

    // Define Start (Car nose at W) and End (Fully off-screen)
    const startX = firstCharX - carWidth / 2;
    const endX = window.innerWidth + carWidth;

    /**
     * 2. MAIN ANIMATION TIMELINE
     * Maps the entire "drive" into a 0-1 progress timeline.
     */
    const tl = gsap.timeline({ paused: true });

    // Horizontal Drive
    tl.fromTo(carRef.current, { x: startX }, { x: endX, ease: "none", duration: 10 }, 0);

    // Frame-by-frame synchronization of text and trail
    tl.eventCallback("onUpdate", () => {
      const currentX = gsap.getProperty(carRef.current, "x");
      const carCenterX = currentX + carWidth / 2;

      // Illuminate letters car passes over
      charData.forEach((data) => {
        data.element.style.opacity = carCenterX >= data.triggerX ? 1 : 0.05;
      });

      // Extend neon trail follow
      if (trailRef.current) {
        gsap.set(trailRef.current, { width: Math.min(carCenterX, window.innerWidth) });
      }
    });

    /**
     * 3. DATA REVEAL TRIGGERS
     * Sequential appearance of info boxes during the drive.
     */
    const boxConfigs = [
      { ref: box1, time: 2, top: "8%", right: "25%" },
      { ref: box2, time: 4, bottom: "8%", right: "30%" },
      { ref: box3, time: 6, top: "8%", right: "8%" },
      { ref: box4, time: 8, bottom: "8%", right: "12%" }
    ];

    boxConfigs.forEach((config) => {
      tl.fromTo(config.ref.current,
        { opacity: 0, scale: 0.8, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 1.5, ease: "power2.out" },
        config.time - 0.5
      ).to(config.ref.current,
        { opacity: 0, scale: 0.8, y: -30, duration: 1.5, ease: "power2.in" },
        config.time + 0.5
      );

      // Fixed positioning setup
      gsap.set(config.ref.current, {
        top: config.top || "auto",
        bottom: config.bottom || "auto",
        right: config.right
      });
    });

    /**
     * 4. INTERACTION HUB
     * Bridges mouse/touch input to animation progress.
     */
    let progress = 0;
    const handleWheel = (e) => {
      const delta = e.deltaY * 0.0005; // Interaction sensitivity
      progress = Math.max(0, Math.min(1, progress + delta));
      gsap.to(tl, { progress: progress, duration: 0.8, ease: "power2.out" });
    };

    const handleTouch = (e) => {
      const touch = e.touches[0];
      if (!container.current._lastTouchY) {
        container.current._lastTouchY = touch.clientY;
        return;
      }
      const delta = (container.current._lastTouchY - touch.clientY) * 0.002;
      progress = Math.max(0, Math.min(1, progress + delta));
      gsap.to(tl, { progress: progress, duration: 0.8, ease: "power2.out" });
      container.current._lastTouchY = touch.clientY;
    };

    const resetTouch = () => { container.current._lastTouchY = null; };

    // Events
    window.addEventListener("wheel", handleWheel);
    window.addEventListener("touchmove", handleTouch, { passive: false });
    window.addEventListener("touchstart", resetTouch);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("touchstart", resetTouch);
    };

  }, { scope: container });

  return (
    <main ref={container} className="bg-[#050505] h-screen w-screen overflow-hidden text-white font-sans fixed inset-0 touch-none select-none">

      {/* Visual Atmosphere: Grids & Glows */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[200px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-600/10 blur-[200px] rounded-full"></div>

      {/* Corner Decorative HUD */}
      <div className="absolute top-12 left-12 flex flex-col gap-2 opacity-30 pointer-events-none">
        <div className="w-12 h-[2px] bg-white"></div>
        <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white">Velocity Engine</span>
        <span className="text-[9px] text-gray-400 uppercase tracking-widest text-shadow-glow">One View Module / V5.2</span>
      </div>

      {/* Scroll Interaction Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center opacity-30 animate-pulse pointer-events-none">
        <span className="text-[9px] uppercase tracking-[0.6em] text-white underline underline-offset-8">Scroll wheel to start</span>
      </div>

      {/* MAIN INTERACTIVE CONTENT */}
      <div className="relative h-full w-full flex flex-col items-center justify-center pointer-events-none">

        {/* The Track */}
        <div ref={roadRef} id="road" className="relative w-screen h-[200px] md:h-[260px] bg-[#121212] flex items-center overflow-hidden border-y border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.8)]">

          {/* Road Texture */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] flex justify-around opacity-10">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-8 h-full bg-white"></div>
            ))}
          </div>

          {/* Headline Text with Character Reveal */}
          <div className="absolute left-[10%] flex items-center z-10">
            <h1 className="text-6xl md:text-[10vw] font-black text-white flex flex-nowrap whitespace-nowrap overflow-hidden tracking-tighter filter drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]">
              {"WELCOME ITZFIZZ".split("").map((char, i) => (
                <span key={i} className="char inline-block min-w-[0.1em] opacity-0">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
          </div>

          {/* Neon Visual Trail */}
          <div ref={trailRef} id="trail" className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-[#45db7d]/30 to-[#45db7d] z-[5] blur-[1px]" style={{ width: '0' }}></div>

          {/* The Car Asset */}
          <img
            ref={carRef}
            src="/car.png"
            alt="Interative Car"
            className="absolute left-0 top-0 h-full object-contain z-20 transform-gpu filter drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
            style={{ transform: 'translateX(px)' }}
          />
        </div>

        {/* Information Overlays */}
        <StatBox boxRef={box1} value="58%" label="Pick-up usage" theme="yellow" />
        <StatBox boxRef={box2} value="23%" label="Phone decrease" theme="blue" />
        <StatBox boxRef={box3} value="27%" label="Efficiency up" theme="dark" />
        <StatBox boxRef={box4} value="40%" label="Retention rate" theme="orange" />

      </div>
    </main>
  );
}
