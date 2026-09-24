"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Six distinct, replaceable H2R photo placeholders; no image is reused.
// Use licensed, self-hosted production assets. See README.md for source pages.
const IMAGES = {
  hero: "https://getwallpapers.com/wallpaper/full/5/d/3/1336509-kawasaki-ninja-h2r-wallpaper-2880x1620-tablet.jpg",
  aero: "https://p0.itc.cn/q_70/images03/20230801/e5aea5999cb244d18b86094e6c5c26ff.jpeg",
  exhaust: "https://i0.wp.com/www.asphaltandrubber.com/wp-content/uploads/2014/10/kawasaki-ninja-h2r-up-close-12.jpg",
  cockpit: "https://content2.kawasaki.com/ContentStorage/KMC/ProductTopFeature/1094/585e409b-dde7-4896-a16b-cbbc32efe819.jpg?w=1530",
  wings: "https://collectingcars.imgix.net/019966/MMP-76.jpg?auto=format&fit=crop&w=1400&q=85",
  tire: "https://img.stcrm.it/images/294799/1200x/kawasaki-h2-dettagli-19.png",
};

// Set to "/media/h2r.mp3" after adding a licensed recording to public/media.
// With null, the button plays a clearly labelled synthesized sound design demo.
const ENGINE_AUDIO_URL = null;
const NAV = [
  ["The machine", "beast"],
  ["Performance", "performance"],
  ["Details", "gallery"],
  ["The sound", "sound"],
  ["Pricing", "pricing"],
];

function Arrow({ className = "", down = false }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={down ? "M12 4v16m-6-6 6 6 6-6" : "M5 19 19 5M5 5h14v14"} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function SpecIcon({ type }) {
  const paths = {
    power: "M14 2 4 14h7l-1 8 10-12h-7l1-8Z",
    engine: "M3 9h4l3-4h7v4h4v10H7v-3H3V9Zm8-7h6M14 2v3M1 8v9",
    wings: "M12 12 2 5l3 11 7 4 7-4 3-11-10 7Zm0 0v8M2 5l10 3 10-3",
  };
  return <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={paths[type]} stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" /></svg>;
}

function Photo({ src, alt, className = "", priority = false, style }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`photo ${className}`} style={style}>
      {failed ? (
        <div className="photo-fallback" role="img" aria-label={alt}>
          <span className="eyebrow text-lime">NINJA / H2R</span>
          <span>{alt}</span>
        </div>
      ) : (
        // Native images allow arbitrary placeholder hosts without Next image config.
        // Width/height plus a reserved container avoid layout shifts.
        <img src={src} alt={alt} width="1800" height="1200" loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"} decoding="async" onError={() => setFailed(true)} />
      )}
    </div>
  );
}

function Label({ number, children }) {
  return <p className="eyebrow flex items-center gap-4"><span className="text-lime">/ {number}</span><span>{children}</span></p>;
}

function useExperience(root, scrollRef) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const scope = root.current;
    const q = gsap.utils.selector(scope);
    const mm = gsap.matchMedia(scope);

    // The page remains fully visible when JavaScript or animation loading fails.
    // matchMedia also tears everything down when reduced-motion changes live.
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let cancelled = false;
      let locomotive;
      let refreshFrame;
      const refresh = () => {
        cancelAnimationFrame(refreshFrame);
        refreshFrame = requestAnimationFrame(() => {
          if (!cancelled) ScrollTrigger.refresh();
        });
      };

      // Browser-only import: no window/document evaluation during Next.js SSR.
      import("locomotive-scroll").then(({ default: LocomotiveScroll }) => {
        if (cancelled) return;
        locomotive = new LocomotiveScroll({
          lenisOptions: { lerp: 0.085, smoothWheel: true },
          scrollCallback: () => ScrollTrigger.update(),
          // One shared ticker; do not add a second requestAnimationFrame loop.
          initCustomTicker: (render) => gsap.ticker.add(render),
          destroyCustomTicker: (render) => gsap.ticker.remove(render),
        });
        scrollRef.current = locomotive;
        refresh();
      }).catch((error) => console.warn("Smooth scroll unavailable; using native scrolling.", error));

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
      intro.from(q(".brand"), { y: -20, opacity: 0, duration: 0.7 })
        .from(q(".nav-entry"), { y: -14, opacity: 0, stagger: 0.09, duration: 0.65 }, 0.1)
        .from(q(".hero-line"), { yPercent: 112, rotate: 3, opacity: 0, stagger: 0.13, duration: 1.25 }, 0.15)
        .from(q(".hero-meta"), { y: 22, opacity: 0, stagger: 0.1, duration: 0.8 }, 0.6);

      q(".reveal-group").forEach((group) => {
        gsap.from(group.querySelectorAll(".reveal"), {
          y: 48, opacity: 0, duration: 1, stagger: 0.13, ease: "power3.out",
          scrollTrigger: { trigger: group, start: "top 86%", once: true },
        });
      });

      gsap.fromTo(q(".aero-zoom"), { scale: 1 }, {
        scale: 1.12, ease: "none",
        scrollTrigger: { trigger: "#beast", start: "top bottom", end: "bottom top", scrub: 1.2 },
      });
      gsap.from(q(".spec-reveal"), {
        y: 65, opacity: 0, stagger: 0.16, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".spec-grid", start: "top 84%", once: true },
      });
      gsap.from(q(".price-card-reveal"), {
        y: 70, opacity: 0, stagger: 0.18, duration: 1, ease: "power3.out",
        scrollTrigger: { trigger: ".pricing-grid", start: "top 84%", once: true },
      });
      q(".gallery-wipe").forEach((frame) => {
        gsap.fromTo(frame, { clipPath: "inset(0 0 100% 0)" }, {
          clipPath: "inset(0 0 0% 0)", duration: 1.15, ease: "power3.inOut",
          scrollTrigger: { trigger: frame, start: "top 88%", once: true },
        });
      });
      gsap.from(q(".footer-link"), {
        y: 22, opacity: 0, stagger: 0.1, duration: 0.75,
        scrollTrigger: { trigger: ".footer-links", start: "top 95%", once: true },
      });

      const images = [...scope.querySelectorAll("img")];
      images.forEach((img) => img.addEventListener("load", refresh));
      document.fonts.ready.then(() => { if (!cancelled) refresh(); });
      refresh();
      return () => {
        cancelled = true;
        cancelAnimationFrame(refreshFrame);
        images.forEach((img) => img.removeEventListener("load", refresh));
        locomotive?.destroy();
        if (scrollRef.current === locomotive) scrollRef.current = null;
      };
    });

    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(q(".footer-inner"), { yPercent: -22, opacity: 0.45 }, {
        yPercent: 0, opacity: 1, ease: "none",
        scrollTrigger: { trigger: "#ride", start: "top bottom", end: "bottom bottom", scrub: true },
      });
      gsap.to(q(".sound-content"), {
        y: -50, opacity: 0.25, ease: "none",
        scrollTrigger: { trigger: "#sound", start: "top top", end: "bottom top", scrub: true },
      });
      q(".price-card").forEach((card) => {
        const glow = card.querySelector(".price-glow");
        if (!glow) return;
        const move = (e) => {
          const rect = card.getBoundingClientRect();
          glow.style.setProperty("--gx", `${e.clientX - rect.left}px`);
          glow.style.setProperty("--gy", `${e.clientY - rect.top}px`);
          glow.style.opacity = "1";
        };
        const leave = () => { glow.style.opacity = "0"; };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        return () => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", leave); };
      });
    });

    mm.add("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
      const cleanups = q("[data-magnetic]").map((element) => {
        const target = element.querySelector(".magnetic-target");
        const x = gsap.quickTo(target, "x", { duration: 0.45, ease: "power3.out" });
        const y = gsap.quickTo(target, "y", { duration: 0.45, ease: "power3.out" });
        const move = (event) => {
          const rect = element.getBoundingClientRect();
          x((event.clientX - rect.left - rect.width / 2) * 0.22);
          y((event.clientY - rect.top - rect.height / 2) * 0.22);
        };
        const leave = () => { x(0); y(0); };
        element.addEventListener("pointermove", move);
        element.addEventListener("pointerleave", leave);
        return () => {
          element.removeEventListener("pointermove", move);
          element.removeEventListener("pointerleave", leave);
        };
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    });
    return () => mm.revert();
  }, [root, scrollRef]);
}

// Web Audio demo generated locally after an explicit click. No autoplay or download.
function useEngineSound() {
  const resource = useRef(null);
  const mounted = useRef(true);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [volume, setVolume] = useState(0.35);

  const stop = () => {
    const current = resource.current;
    resource.current = null;
    if (current?.audio) { current.audio.pause(); current.audio.src = ""; }
    if (current?.context) void current.context.close().catch(() => {});
    if (mounted.current) setPlaying(false);
  };

  useEffect(() => {
    mounted.current = true;
    const hide = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", hide);
    return () => {
      mounted.current = false;
      document.removeEventListener("visibilitychange", hide);
      stop();
    };
  }, []);

  useEffect(() => {
    const current = resource.current;
    if (current?.audio) current.audio.volume = volume;
    if (current?.master) current.master.gain.setTargetAtTime(volume * 0.12, current.context.currentTime, 0.04);
  }, [volume]);

  const toggle = async () => {
    if (busy) return;
    if (playing) { stop(); return; }
    setBusy(true);
    setError("");
    try {
      if (ENGINE_AUDIO_URL) {
        const audio = new Audio(ENGINE_AUDIO_URL);
        audio.loop = true;
        audio.volume = volume;
        const current = { audio };
        resource.current = current;
        await audio.play();
        if (!mounted.current || resource.current !== current) { audio.pause(); return; }
      } else {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) throw new Error("Audio unavailable");
        const context = new AudioContext();
        const master = context.createGain();
        const filter = context.createBiquadFilter();
        const current = { context, master };
        resource.current = current;
        master.gain.value = volume * 0.12;
        filter.type = "lowpass";
        filter.frequency.value = 1600;
        filter.Q.value = 0.8;
        filter.connect(master);
        master.connect(context.destination);

        const rev = context.createOscillator();
        rev.frequency.value = 0.2;
        const modulation = context.createGain();
        modulation.gain.value = 55;
        rev.connect(modulation);
        [95, 190, 285].forEach((frequency, index) => {
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.type = index === 2 ? "triangle" : "sawtooth";
          oscillator.frequency.value = frequency;
          gain.gain.value = 0.28 / (index + 1);
          modulation.connect(oscillator.frequency);
          oscillator.connect(gain);
          gain.connect(filter);
          oscillator.start();
        });
        // Higher sine tone suggests a supercharger without imitating a recording.
        const whine = context.createOscillator();
        const whineGain = context.createGain();
        whine.frequency.value = 1800;
        whineGain.gain.value = 0.045;
        modulation.connect(whine.frequency);
        whine.connect(whineGain);
        whineGain.connect(master);
        whine.start();
        rev.start();
        await context.resume();
        if (!mounted.current || resource.current !== current) return;
      }
      if (mounted.current) setPlaying(true);
    } catch {
      stop();
      if (mounted.current) setError("Audio could not start. Please try again in another browser.");
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  return { playing, busy, error, volume, setVolume, toggle };
}

function SoundSection() {
  const { playing, busy, error, volume, setVolume, toggle } = useEngineSound();
  const [marqueePaused, setMarqueePaused] = useState(false);
  return (
    <section id="sound" tabIndex={-1} aria-labelledby="sound-title" data-section="6" className="sound-section relative z-10 overflow-hidden bg-carbon px-6 py-24 md:py-32">
      <div className="sound-content relative z-10 mx-auto max-w-[1600px]">
        <div className="mb-14 flex items-center justify-between gap-6">
          <Label number="05">Feel the frequency</Label>
          <button type="button" className="micro-button" onClick={() => setMarqueePaused(!marqueePaused)} aria-pressed={marqueePaused}>
            {marqueePaused ? "Resume text" : "Pause text"}
          </button>
        </div>
        <h2 id="sound-title" className="sr-only">The sound of speed</h2>
        <div className={`marquee ${marqueePaused ? "is-paused" : ""}`} aria-hidden="true">
          <div className="marquee-track">
            {[0, 1].map((i) => <span key={i}>HEAR THE ROAR <b>•</b> THE SOUND OF A SUPERCHARGER <b>•</b>&nbsp;</span>)}
          </div>
        </div>
        <div className="sound-stage relative mx-auto flex min-h-[360px] max-w-3xl flex-col items-center justify-center text-center">
          <div className="sound-orbit" aria-hidden="true" />
          <div data-magnetic className="relative z-10 flex h-48 w-48 items-center justify-center">
            <button type="button" className="magnetic-target play-button" onClick={toggle} disabled={busy}
              aria-label={playing ? "Stop sound preview" : "Play sound preview"} aria-pressed={playing}>
              {playing ? <span className="stop-icon" /> : <span className="play-icon" />}
            </button>
          </div>
          <div className={`equalizer ${playing ? "is-playing" : ""}`} aria-hidden="true">
            {Array.from({ length: 19 }, (_, i) => <i key={i} style={{ "--i": i, height: `${10 + ((i * 13) % 29)}px` }} />)}
          </div>
          <p className="eyebrow mt-6 text-white" aria-live="polite">{busy ? "Starting audio…" : playing ? "Sound on / Feel the pulse" : "Press play / Enter the redline"}</p>
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-zinc-400">{ENGINE_AUDIO_URL ? "Engine audio preview. Headphones recommended." : "Synthesized sound preview · not an H2R recording"}</p>
          <label className="mt-5 flex items-center gap-3 text-xs text-zinc-400">Volume
            <input aria-label="Sound volume" className="w-28 accent-lime" type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} />
          </label>
          {error && <p role="alert" className="mt-3 max-w-sm text-sm text-red-300">{error}</p>}
        </div>
        <div className="flex justify-between border-t border-white/10 pt-6 text-xs uppercase tracking-[0.2em] text-zinc-500"><span>Mechanical. Visceral. Unfiltered.</span><span className="hidden sm:block">Headphones recommended ↗</span></div>
      </div>
    </section>
  );
}

export default function Home() {
  const root = useRef(null);
  const scrollRef = useRef(null);
  const menuButton = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef(null);
  useExperience(root, scrollRef);

  // ── Ignition Sequence Loader ──
  useEffect(() => {
    if (!loading || !loaderRef.current) return;
    const el = loaderRef.current;
    const q = gsap.utils.selector(el);
    let audioCtx = null;

    document.body.style.overflow = "hidden";

    // ── Synthesized engine rev sound ──
    function startEngineSound() {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        audioCtx = new AC();
        const master = audioCtx.createGain();
        master.gain.value = 0.06;
        master.connect(audioCtx.destination);

        // Low-pass filter simulates muffled engine
        const filter = audioCtx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 800;
        filter.Q.value = 1.2;
        filter.connect(master);

        // LFO for rpm flutter
        const lfo = audioCtx.createOscillator();
        const lfoGain = audioCtx.createGain();
        lfo.frequency.value = 0.3;
        lfoGain.gain.value = 30;
        lfo.connect(lfoGain);

        // Engine harmonics (fundamental + overtones)
        const harmonics = [65, 130, 195, 260].map((freq, i) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = i < 2 ? "sawtooth" : "triangle";
          osc.frequency.value = freq;
          gain.gain.value = 0.35 / (i + 1);
          lfoGain.connect(osc.frequency);
          osc.connect(gain);
          gain.connect(filter);
          osc.start();
          return { osc, gain, baseFreq: freq };
        });

        // Supercharger whine
        const whine = audioCtx.createOscillator();
        const whineGain = audioCtx.createGain();
        whine.type = "sine";
        whine.frequency.value = 1200;
        whineGain.gain.value = 0;
        whine.connect(whineGain);
        whineGain.connect(master);
        whine.start();
        lfo.start();

        audioCtx.resume();

        return { audioCtx, master, filter, harmonics, whine, whineGain, lfo };
      } catch { return null; }
    }

    // Ramp the engine sound as RPM increases (0→1 progress)
    function updateEngineSound(audio, progress) {
      if (!audio) return;
      const t = audio.audioCtx.currentTime;
      const rpmMult = 1 + progress * 3.5; // frequency multiplier
      audio.harmonics.forEach(({ osc, baseFreq }) => {
        osc.frequency.setTargetAtTime(baseFreq * rpmMult, t, 0.08);
      });
      audio.filter.frequency.setTargetAtTime(800 + progress * 3200, t, 0.08);
      audio.master.gain.setTargetAtTime(0.06 + progress * 0.07, t, 0.05);
      audio.whineGain.gain.setTargetAtTime(progress * 0.04, t, 0.1);
      audio.whine.frequency.setTargetAtTime(1200 + progress * 3800, t, 0.08);
      audio.lfo.frequency.setTargetAtTime(0.3 + progress * 12, t, 0.08);
    }

    // Fade out engine sound
    function fadeOutEngine(audio) {
      if (!audio) return;
      const t = audio.audioCtx.currentTime;
      audio.master.gain.setTargetAtTime(0, t, 0.15);
      setTimeout(() => { audio.audioCtx.close().catch(() => {}); }, 600);
    }

    const audio = startEngineSound();
    const rpmObj = { value: 0 };
    const gearEl = q(".loader-gear-num")[0];
    const rpmNumEl = q(".loader-rpm-num")[0];
    const statusEl = q(".loader-status")[0];
    const gears = [" N", " 1", " 2", " 3", " 4", " 5", " 6"];
    let currentGear = 0;

    // ── Main timeline ──
    const tl = gsap.timeline({
      onComplete: () => {
        // Launch flash + exit
        const exitTl = gsap.timeline({
          onComplete: () => {
            fadeOutEngine(audio);
            setLoading(false);
            document.body.style.overflow = "";
          },
        });
        exitTl
          .to(q(".loader-flash"), { opacity: 0.85, duration: 0.12, ease: "power2.in" })
          .to(q(".loader-flash"), { opacity: 0, duration: 0.4, ease: "power2.out" })
          .to(el, { opacity: 0, duration: 0.35, ease: "power2.in" }, 0.15);
      },
    });

    // Phase 1: Brand + status appear
    tl.from(q(".loader-brand-row"), { opacity: 0, duration: 0.5, ease: "power2.out" })
      .set(q(".loader-brand-row"), { opacity: 1 })
      .to(statusEl, { duration: 0.01, onComplete: () => { if (statusEl) statusEl.textContent = "IGNITION ON"; } }, 0.3);

    // Phase 2: H2R title glitch reveal
    tl.to(q(".loader-glitch"), { opacity: 1, duration: 0.05 }, 0.5)
      .to(q(".loader-glitch"), { opacity: 0, x: -3, duration: 0.05 }, 0.55)
      .to(q(".loader-glitch"), { opacity: 0.8, x: 2, duration: 0.04 }, 0.62)
      .to(q(".loader-glitch"), { opacity: 0, x: 0, duration: 0.05 }, 0.66)
      .to(q(".loader-h2r-fill"), { clipPath: "inset(0 0% 0 0)", duration: 0.8, ease: "power3.inOut" }, 0.6)
      .to(q(".loader-glitch"), { opacity: 0.6, x: -4, duration: 0.03 }, 1.0)
      .to(q(".loader-glitch"), { opacity: 0, x: 0, duration: 0.06 }, 1.03);

    // Phase 3: RPM climb + gear shifts — the main rev sequence
    tl.to(statusEl, { duration: 0.01, onComplete: () => { if (statusEl) statusEl.textContent = "SYSTEMS READY"; } }, 1.2)
      .from(q(".loader-rpm-track"), { opacity: 0, scaleX: 0, duration: 0.4, ease: "power2.out" }, 1.2)
      .from(q(".loader-data"), { opacity: 0, y: 10, duration: 0.3, ease: "power2.out" }, 1.3);

    // RPM ramp with gear shifts
    const rpmDuration = 2.8;
    tl.to(rpmObj, {
      value: 14000,
      duration: rpmDuration,
      ease: "power2.in",
      onUpdate: () => {
        const rpm = Math.round(rpmObj.value);
        if (rpmNumEl) rpmNumEl.textContent = rpm.toLocaleString();
        // RPM bar fill
        const pct = rpm / 14000;
        const fill = q(".loader-rpm-fill")[0];
        if (fill) fill.style.right = `${(1 - pct) * 100}%`;
        // Gear shifts
        let gear = 0;
        if (rpm > 800) gear = 1;
        if (rpm > 3500) gear = 2;
        if (rpm > 5800) gear = 3;
        if (rpm > 8200) gear = 4;
        if (rpm > 10500) gear = 5;
        if (rpm > 12500) gear = 6;
        if (gear !== currentGear) {
          currentGear = gear;
          if (gearEl) gearEl.textContent = gears[gear];
          if (statusEl && gear > 0) statusEl.textContent = gear === 6 ? "REDLINE" : `GEAR ${gear} ENGAGED`;
        }
        // Update engine sound
        updateEngineSound(audio, pct);
      },
    }, 1.6);

    // Phase 4: Speed streaks intensify with RPM
    const streaks = q(".loader-streak");
    streaks.forEach((streak, i) => {
      const y = 10 + Math.random() * 80;
      const w = 80 + Math.random() * 200;
      const delay = 1.8 + (i * rpmDuration) / streaks.length + Math.random() * 0.3;
      gsap.set(streak, { top: `${y}%`, width: w });
      tl.to(streak, {
        left: "110%", opacity: 0.6 + Math.random() * 0.4, duration: 0.25 + Math.random() * 0.15,
        ease: "power1.in",
        onComplete: () => gsap.set(streak, { opacity: 0, left: "-10%" }),
      }, delay);
    });

    // Hold briefly at redline
    tl.to({}, { duration: 0.25 });

    return () => {
      tl.kill();
      fadeOutEngine(audio);
      document.body.style.overflow = "";
    };
  }, [loading]);

  useEffect(() => {
    const escape = (event) => {
      if (event.key === "Escape") { setMenuOpen(false); menuButton.current?.focus(); }
    };
    const desktop = window.matchMedia("(min-width: 768px)");
    const resize = () => { if (desktop.matches) setMenuOpen(false); };
    document.addEventListener("keydown", escape);
    desktop.addEventListener("change", resize);
    return () => { document.removeEventListener("keydown", escape); desktop.removeEventListener("change", resize); };
  }, []);

  const navigate = (event, id) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setMenuOpen(false);
    history.pushState(null, "", `#${id}`);
    target.focus({ preventScroll: true });
    if (scrollRef.current) scrollRef.current.scrollTo(target, { offset: -86, duration: 1.3 });
    else target.scrollIntoView({ behavior: "auto" });
  };

  return (
    <div ref={root} className="experience">
      {/* ── Ignition Sequence Loader ── */}
      {loading && (
        <div ref={loaderRef} className="loader-screen" aria-live="polite" aria-label="Loading">
          {/* Flash overlay */}
          <div className="loader-flash" aria-hidden="true" />

          {/* Speed streaks */}
          <div className="loader-streaks" aria-hidden="true">
            {Array.from({ length: 18 }, (_, i) => (
              <div key={i} className="loader-streak" />
            ))}
          </div>

          <div className="loader-inner">
            {/* Giant H2R with glitch reveal */}
            <div className="loader-h2r" aria-hidden="true">
              H2R
              <div className="loader-h2r-fill">H2R</div>
              <div className="loader-glitch">H2R</div>
            </div>

            {/* RPM bar */}
            <div className="loader-rpm-track">
              <div className="loader-rpm-fill" />
            </div>

            {/* Data row */}
            <div className="loader-data">
              <div className="loader-gear">
                <span className="loader-gear-num"> N</span>
              </div>
              <div className="loader-rpm-val">
                <span className="loader-rpm-num">0</span> RPM
              </div>
              <div className="loader-status">STANDBY</div>
            </div>
          </div>

          {/* Bottom brand */}
          <div className="loader-brand-row">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span className="loader-brand-text">Kawasaki / Ninja H2R</span>
          </div>
        </div>
      )}

      <a className="skip-link" href="#hero">Skip to content</a>

      {/* 1 — Modern header */}
      <header data-section="1" className="site-header fixed inset-x-0 top-0 z-50 border-b border-white/10">
        <div className="mx-auto flex h-20 max-w-[1720px] items-center justify-between gap-5 px-6 md:px-12">
          <a href="#hero" onClick={(event) => navigate(event, "hero")} className="brand flex items-center gap-3" aria-label="Ninja H2R home">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
            <span className="text-[19px] font-black uppercase tracking-[-0.07em]">Kawasaki<span className="ml-2 text-lime">/</span><span className="ml-2 text-xs font-medium tracking-widest">H2R</span></span>
          </a>
          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            {NAV.map(([label, id]) => <a key={id} className="nav-entry nav-link" href={`#${id}`} onClick={(event) => navigate(event, id)}>{label}</a>)}
          </nav>
          <a href="#ride" onClick={(event) => navigate(event, "ride")} className="nav-entry hidden items-center gap-3 text-xs font-bold uppercase tracking-widest lg:flex">Explore H2R <Arrow className="text-lime" /></a>
          <button ref={menuButton} type="button" className="micro-button md:hidden" aria-expanded={menuOpen} aria-controls="mobile-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Close −" : "Menu +"}</button>
        </div>
        <nav id="mobile-nav" aria-label="Mobile navigation" hidden={!menuOpen} className="mobile-nav px-6 pb-6 md:hidden">
          {NAV.map(([label, id], index) => <a key={id} href={`#${id}`} onClick={(event) => navigate(event, id)} className="flex items-center justify-between border-t border-white/10 py-4 text-lg"><span>{label}</span><span className="eyebrow text-lime">0{index + 1}</span></a>)}
        </nav>
      </header>

      <main>
        {/* 2 — Hero */}
        <section id="hero" data-section="2" tabIndex={-1} aria-labelledby="hero-title" className="hero relative isolate overflow-hidden bg-carbon">
          <div className="hero-parallax absolute -inset-y-[15%] inset-x-0 -z-20" data-scroll data-scroll-speed="0.12">
            <Photo src={IMAGES.hero} alt="Head-on view of the Kawasaki Ninja H2R with black carbon-fiber bodywork and winglets" priority className="hero-photo h-full w-full" />
          </div>
          <div className="hero-shade absolute inset-0 -z-10" />
          <div className="hero-grid absolute inset-0 -z-10" aria-hidden="true" />
          <div className="hero-content mx-auto flex h-full w-full max-w-[1720px] flex-col justify-center px-6 pb-24 pt-28 md:px-12">
            <p className="hero-meta eyebrow mb-7 flex items-center gap-3 text-lime"><span className="status-dot" /> Closed-course hypersport / Ninja H2R</p>
            <h1 id="hero-title" className="hero-title">
              <span className="line-mask"><span className="hero-line">BEYOND</span></span>
              <span className="line-mask"><span className="hero-line italic outline-text">FAST<span className="text-lime">.</span></span></span>
            </h1>
            <div className="hero-meta mt-8 max-w-sm">
              <p className="max-w-[300px] text-sm leading-relaxed text-zinc-300">Some machines follow the limits.<br />This one was built to move them.</p>
              <a className="primary-link mt-8 inline-flex items-center gap-7" href="#beast" onClick={(event) => navigate(event, "beast")}>Meet the machine <Arrow /></a>
            </div>
          </div>
          <div className="hero-meta absolute inset-x-6 bottom-6 flex items-end justify-between border-t border-white/20 pt-5 md:inset-x-12 md:bottom-8">
            <a className="flex items-center gap-4 text-[10px] uppercase tracking-[0.2em]" href="#beast" onClick={(event) => navigate(event, "beast")}><Arrow down className="scroll-bounce text-lime" /> Scroll to unleash</a>
            <div className="flex gap-7 sm:gap-12"><div><strong className="text-xl font-medium md:text-3xl">998<span className="ml-1 text-xs text-zinc-400">cc</span></strong><p className="mt-1 text-[9px] uppercase tracking-widest text-zinc-400">Supercharged</p></div><div><strong className="text-xl font-medium md:text-3xl">310<span className="ml-1 text-xs text-zinc-400">PS</span></strong><p className="mt-1 text-[9px] uppercase tracking-widest text-zinc-400">Pure intent</p></div></div>
          </div>
        </section>

        {/* 3 — The Beast */}
        <section id="beast" data-section="3" tabIndex={-1} aria-labelledby="beast-title" className="section-pad bg-carbon">
          <div className="reveal-group mx-auto grid max-w-[1480px] items-center gap-14 md:grid-cols-2 lg:gap-24">
            <div>
              <div className="reveal"><Label number="02">The beast / Aerodynamics</Label></div>
              <h2 id="beast-title" className="section-title reveal mt-8">SCULPTED<br />BY <span className="text-lime">AIR.</span><br /><span className="text-zinc-500">BUILT TO<br />DEFY IT.</span></h2>
              <p className="reveal mt-8 max-w-md text-base leading-relaxed text-zinc-400">Every surface has a purpose. Carbon-fiber wings turn airflow into downforce, while the sharp silhouette expresses an obsession with performance.</p>
              <div className="reveal mt-10 flex items-center gap-5 border-t border-white/15 pt-6"><span className="text-4xl font-black italic text-lime">H2R</span><p className="eyebrow leading-relaxed text-zinc-400">Aerospace thinking.<br />Two-wheel instinct.</p></div>
            </div>
            <figure className="aero-frame relative overflow-hidden">
              <Photo src={IMAGES.aero} alt="Side profile of the Ninja H2R showing its aerodynamic bodywork and green trellis frame" className="aero-zoom h-full w-full" />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
              <figcaption className="absolute inset-x-6 bottom-6 flex items-end justify-between"><span className="eyebrow text-white">Form follows<br /><span className="text-lime">absolute function.</span></span><span className="technical-cross" aria-hidden="true">+</span></figcaption>
              <span className="image-corner" aria-hidden="true" />
            </figure>
          </div>
        </section>

        {/* 4 — Supercharged engine */}
        <section id="performance" data-section="4" tabIndex={-1} aria-labelledby="performance-title" className="section-pad carbon-weave border-y border-white/10">
          <div className="mx-auto max-w-[1480px]">
            <div className="reveal-group mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div><div className="reveal"><Label number="03">Supercharged engineering</Label></div><h2 id="performance-title" className="section-title reveal mt-8">NUMBERS THAT<br /><span className="outline-text">HIT DIFFERENT.</span></h2></div>
              <p className="reveal max-w-xs text-sm leading-relaxed text-zinc-400">A purpose-built powerplant.<br />An uncompromising pursuit of exhilaration.</p>
            </div>
            <div className="spec-grid grid gap-4 md:grid-cols-3">
              {[
                { icon: "power", number: "310", unit: "HP*", title: "Unrestrained power", text: "Peak power at 14,000 rpm. Engineered for the circuit, with nothing held back." },
                { icon: "engine", number: "998", unit: "CC", title: "Supercharged inline-four", text: "A compact centrifugal supercharger. A relentlessly intense delivery of power." },
                { icon: "wings", number: "CARBON", unit: "FIBER", title: "Aerospace-inspired wings", text: "Lightweight aerodynamic surfaces help generate downforce and high-speed stability." },
              ].map((spec, index) => (
                <div className="spec-reveal" key={spec.title}><article className="spec-card group flex h-full flex-col">
                  <div className="flex items-center justify-between"><span className="eyebrow text-zinc-500">0{index + 1} / H2R</span><span className="spec-icon text-lime"><SpecIcon type={spec.icon} /></span></div>
                  <div className="mb-8 mt-14"><span className={`font-black leading-none tracking-tighter ${index === 2 ? "text-[clamp(2.5rem,4vw,4rem)]" : "text-7xl lg:text-8xl"}`}>{spec.number}</span><span className="ml-2 text-xs text-lime">{spec.unit}</span></div>
                  <h3 className="mb-3 text-lg font-medium">{spec.title}</h3><p className="max-w-sm text-sm leading-relaxed text-zinc-400">{spec.text}</p>
                </article></div>
              ))}
            </div>
            <p className="mt-6 text-xs leading-relaxed text-zinc-500">*310 metric horsepower (PS), approximately 306 mechanical hp. Manufacturer rating without ram air. Closed-course use only.</p>
          </div>
        </section>

        {/* 5 — Asymmetrical gallery, four unique detail photographs */}
        <section id="gallery" data-section="5" tabIndex={-1} aria-labelledby="gallery-title" className="section-pad bg-carbon">
          <div className="mx-auto max-w-[1480px]">
            <div className="reveal-group mb-14"><div className="reveal"><Label number="04">Obsess over the details</Label></div><h2 id="gallery-title" className="section-title reveal mt-8">NOTHING HERE<br />IS <span className="text-lime">ORDINARY.</span></h2></div>
            <div className="gallery-grid">
              {[
                ["exhaust", "01", "THE EXHALE", "Exhaust / Raw expression", "Ninja H2R exhaust and sculpted rear assembly"],
                ["cockpit", "02", "COMMAND CENTER", "Cockpit / Total focus", "Ninja H2R analog tachometer and digital instrument display"],
                ["wings", "03", "CARBON INSTINCT", "Winglets / Air, controlled", "Close-up of the Ninja H2R carbon-fiber front winglets"],
                ["tire", "04", "CONTACT PATCH", "Race slick / Track connection", "Ninja H2R rear racing slick, chain and swingarm"],
              ].map(([key, number, title, subtitle, alt]) => (
                <figure key={key} className={`gallery-item gallery-${key}`}>
                  <div className="gallery-wipe relative overflow-hidden"><Photo src={IMAGES[key]} alt={alt} className="gallery-photo h-full w-full" /><span className="absolute left-5 top-5 bg-black/65 px-3 py-2 font-mono text-xs text-lime">/{number}</span></div>
                  <figcaption className="flex justify-between gap-4 border-b border-white/15 py-5"><div><h3 className="text-lg font-bold tracking-tight md:text-xl">{title}</h3><p className="mt-1 text-xs text-zinc-500">{subtitle}</p></div><span className="text-lime" aria-hidden="true">+</span></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 6 — Sound */}
        <SoundSection />

        {/* 7 — Pricing */}
        <section id="pricing" data-section="7" tabIndex={-1} aria-labelledby="pricing-title" className="section-pad pricing-section relative z-10 overflow-hidden border-t border-white/10">
          <div className="mx-auto max-w-[1480px]">
            <div className="reveal-group mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <div className="reveal"><Label number="06">Pricing / Your path to H2R</Label></div>
                <h2 id="pricing-title" className="section-title reveal mt-8">OWN THE<br /><span className="outline-text">IMPOSSIBLE.</span></h2>
              </div>
              <p className="reveal max-w-xs text-sm leading-relaxed text-zinc-400">Not just a purchase — an initiation.<br />Choose the tier that matches your ambition.</p>
            </div>
            <div className="pricing-grid grid gap-6 md:grid-cols-3">
              {[
                {
                  tier: "TRACK DAY",
                  price: "$1,200",
                  period: "/ session",
                  description: "Experience the H2R on a closed circuit with full support crew and telemetry.",
                  features: ["4-hour closed-circuit session", "Professional riding coach", "Full telemetry & data review", "Leathers & safety gear provided", "GoPro footage included"],
                  cta: "Book a session",
                  featured: false,
                },
                {
                  tier: "OWNERSHIP",
                  price: "$55,000",
                  period: "MSRP*",
                  description: "The full Ninja H2R — delivered race-ready. Built by hand in Akashi, Japan.",
                  features: ["Hand-built supercharged engine", "Full carbon-fiber bodywork", "Dog-ring transmission", "Öhlins TTX suspension", "Brembo Stylema calipers", "Kawasaki track support package"],
                  cta: "Reserve yours",
                  featured: true,
                },
                {
                  tier: "ELITE",
                  price: "$120,000",
                  period: "/ year",
                  description: "The ultimate track programme. Priority access, concierge logistics, exclusive events.",
                  features: ["Dedicated H2R (yours to ride)", "12 track days at premium circuits", "Personal race engineer", "Hospitality & VIP paddock", "Annual Kawasaki factory tour", "Private rider community access"],
                  cta: "Apply for Elite",
                  featured: false,
                },
              ].map((plan, index) => (
                <div className="price-card-reveal" key={plan.tier}>
                  <article className={`price-card group relative flex h-full flex-col overflow-hidden ${plan.featured ? "is-featured" : ""}`}>
                    <div className="price-glow" aria-hidden="true" />
                    <div className="flex items-center justify-between">
                      <span className="eyebrow text-zinc-500">0{index + 1} / {plan.tier}</span>
                      {plan.featured && <span className="price-badge">Most popular</span>}
                    </div>
                    <div className="mb-4 mt-10">
                      <span className="price-value">{plan.price}</span>
                      <span className="ml-2 text-sm text-zinc-400">{plan.period}</span>
                    </div>
                    <p className="mb-8 max-w-sm text-sm leading-relaxed text-zinc-400">{plan.description}</p>
                    <ul className="price-features mb-10 flex-1" role="list">
                      {plan.features.map((f) => <li key={f}>{f}</li>)}
                    </ul>
                    <button type="button" className={`price-cta ${plan.featured ? "is-featured" : ""}`}>{plan.cta} <Arrow /></button>
                  </article>
                </div>
              ))}
            </div>
            <p className="mt-8 text-xs leading-relaxed text-zinc-500">*Manufacturer's suggested retail price. Actual pricing varies by market. The Ninja H2R is a closed-course vehicle and is not street-legal. Track Day sessions subject to availability.</p>
          </div>
        </section>
      </main>

      {/* 7 — Footer revealed beneath the sound section */}
      <footer id="ride" data-section="8" tabIndex={-1} aria-labelledby="footer-title" className="footer-shell relative z-0 overflow-hidden bg-lime text-carbon">
        <div className="footer-inner mx-auto max-w-[1720px] px-6 pb-8 pt-16 md:px-12 md:pt-24">
          <div className="flex items-center justify-between gap-4"><p className="eyebrow">The end of ordinary.</p><span className="eyebrow">Kawasaki / Ninja H2R</span></div>
          <h2 id="footer-title" className="footer-title mb-10 mt-14">RIDE THE<br /><span className="italic">H2R</span><span className="footer-arrow inline-block" aria-hidden="true">↗</span></h2>
          <div className="footer-links flex flex-col justify-between gap-8 border-t border-black/25 py-8 md:flex-row md:items-center">
            <a className="footer-link footer-cta inline-flex items-center gap-7 text-sm font-bold uppercase tracking-widest" href="https://www.kawasaki.com/en-us/motorcycle/ninja/hypersport/ninja-h2r" target="_blank" rel="noreferrer">Explore at Kawasaki <Arrow /><span className="sr-only"> (opens in a new tab)</span></a>
            <nav aria-label="Footer navigation" className="flex flex-wrap gap-6 text-xs font-medium uppercase tracking-wider">{[["The machine", "beast"], ["The sound", "sound"], ["Back to top ↑", "hero"]].map(([label, id]) => <a key={id} className="footer-link" href={`#${id}`} onClick={(event) => navigate(event, id)}>{label}</a>)}</nav>
          </div>
          <div className="flex flex-col justify-between gap-3 border-t border-black/25 pt-6 text-[10px] uppercase tracking-wider text-black/65 sm:flex-row"><span>Independent design concept · Not affiliated with Kawasaki</span><span>Closed-course motorcycle. No street use.</span></div>
        </div>
      </footer>
    </div>
  );
}
