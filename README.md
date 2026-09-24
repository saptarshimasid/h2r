# Ninja H2R — Beyond Fast

A complete, responsive one-page Next.js App Router project. Next.js + React,
Tailwind CSS v4, GSAP + ScrollTrigger, and Locomotive Scroll v5. All components,
animation hooks, SVG icons, audio code, and styles are included. No UI kit,
paid animation plugin, API key, or additional component download is needed.

## Run the included project

Use Node.js 20.9 or newer (Node.js 22 or 24 LTS recommended).

```bash
cd ninja-h2r
npm ci
npm run dev
```

Open http://localhost:3000.

For production:

```bash
npm run build
npm run start
```

`npm ci` installs the exact dependency tree in the included lockfile.

## Files

| File | Purpose |
| --- | --- |
| `app/page.jsx` | Complete page, all seven sections, animation lifecycle, menu, images, and sound controls |
| `app/globals.css` | Tailwind theme, responsive styles, marquee, hover states, reduced-motion overrides |
| `app/layout.jsx` | Root layout, metadata, global CSS imports |
| `postcss.config.mjs` | Tailwind v4 PostCSS plugin |
| `next.config.mjs` | React Strict Mode |
| `package.json` / `package-lock.json` | Reproducible dependencies and scripts |
| `public/media/README.md` | Local asset replacement instructions |

## Add this to an existing Next.js App Router app

This example uses JavaScript and Tailwind v4. Copy the complete `app/page.jsx`,
`app/globals.css`, and `postcss.config.mjs` files, and merge the global stylesheet
imports from `app/layout.jsx` into your existing root layout.

```bash
npm install gsap@3.15.0 locomotive-scroll@5.0.1
npm install -D tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3
```

The supplied project additionally pins Next.js 16.3.6. Do not replace an existing
project's package.json wholesale unless you intend to adopt all these versions.
Tailwind v4 uses `@import "tailwindcss"` and a CSS `@theme`; this example does not
need a Tailwind v3 `tailwind.config.js` file.

## Exactly seven sections

1. Fixed glass header — logo reveal, staggered desktop navigation, hover underlines,
   responsive disclosure menu, Escape handling, anchor navigation.
2. Full-viewport hero — unique H2R photograph, `data-scroll-speed="0.12"`, clipped
   headline reveals, scroll indicator, and primary action.
3. The Beast — split layout, staggered copy reveal, ScrollTrigger image zoom.
4. Supercharged Engine — three specification cards, staggered entrance, lift,
   neon border glow, and scaling vector icons.
5. Visual Gallery — asymmetrical desktop grid, stacked mobile layout, four
   different detail photos, individual wipe reveals, and image hover zoom.
6. The Sound of Speed — seamless marquee with pause control, magnetic play button,
   working sound demo, animated equalizer, stop control, and volume slider.
7. Animated Footer — oversized green finale, staggered links, reveal parallax
   beneath the previous section, and a link to Kawasaki's official site.

The header and footer count toward seven, as requested. There are five semantic
`section` elements inside `main`; each of the seven blocks has a `data-section`
attribute. The gallery deliberately uses the offered asymmetrical option instead
of a pinned horizontal scroller, preserving straightforward mobile navigation.

## Locomotive Scroll + GSAP initialization

`app/page.jsx` starts with `"use client"`. Its `useExperience` hook initializes
DOM animation only after mount. Locomotive is dynamically imported inside an
effect, so it does not access `window` during server rendering.

The essential integration used in the complete source is:

```jsx
gsap.registerPlugin(ScrollTrigger);
const { default: LocomotiveScroll } = await import("locomotive-scroll");

const locomotive = new LocomotiveScroll({
  lenisOptions: { lerp: 0.085, smoothWheel: true },
  scrollCallback: () => ScrollTrigger.update(),
  initCustomTicker: (render) => gsap.ticker.add(render),
  destroyCustomTicker: (render) => gsap.ticker.remove(render),
});
```

This is **v5**, which uses native scroll coordinates. Do not add the old v4
`scrollerProxy`, transformed scroll wrapper, `data-scroll-container`, `el`, or
`smooth: true` setup. Do not run a separate RAF loop alongside the shared ticker.
The library's `render` callback owns its timing; pass it to the GSAP ticker as
shown in the v5 documentation.

The global Locomotive stylesheet is imported in `app/layout.jsx`:

```jsx
import "locomotive-scroll/dist/locomotive-scroll.css";
import "./globals.css";
```

The full hook, unlike the short illustration above, also handles:

- `gsap.matchMedia()` contexts, automatic tween/ScrollTrigger cleanup, responsive
  footer effects, and live reduced-motion preference changes.
- Cancelling async initialization when the component unmounts, including React
  Strict Mode's development mount/cleanup cycle.
- Destroying Locomotive and removing its ticker on cleanup.
- Image/font completion refreshes, native-scroll fallback, and event cleanup.
- Separate transform targets for Locomotive parallax, GSAP zoom, and CSS hover.
- Magnetic interaction only on devices with a fine pointer and hover support.

No library hides content permanently in CSS before initialization. With reduced
motion enabled, smooth scrolling, reveals, marquee motion, and magnetic movement
are disabled; the content and controls remain usable.

## Images: six URLs, zero repeats

Every photograph has a different URL, centralized in `IMAGES` at the top of
`app/page.jsx`. They are external **H2R photo placeholders**, not bundled or
licensed production assets. Network access is required. If a host rejects a
request, an accessible, styled fallback is displayed in the reserved image box.

| Key | Placement | Source page |
| --- | --- | --- |
| `hero` | Hero / dark front-view photograph | https://getwallpapers.com/collection/kawasaki-ninja-h2r-wallpaper |
| `aero` | About / aerodynamic side profile | https://www.sohu.com/a/708012416_121124363 |
| `exhaust` | Gallery / exhaust | https://www.asphaltandrubber.com/bikes/kawasaki-ninja-h2r-up-close-photos/ |
| `cockpit` | Gallery / instruments | https://www.kawasaki.com/en-us/motorcycle/ninja/hypersport/ninja-h2r |
| `wings` | Gallery / front winglets | https://collectingcars.com/for-sale/2017-kawasaki-ninja-h2r |
| `tire` | Gallery / rear tire | https://www.moto.it/news/kawasaki-ninja-h2r-2015-1.html |

For production, replace these with your licensed WebP/AVIF images in
`public/media/`, using distinct filenames such as `/media/h2r-hero.webp`,
`/media/h2r-aero.webp`, and `/media/h2r-exhaust.webp`. Keep every URL unique.
The hero gets eager/high-priority loading; all other images are lazy-loaded.
Native `<img>` elements are intentional, so no remote-host configuration is
required. CSS reserves the image frames to avoid layout shifts.

## Audio teaser

The play button works immediately using a low-volume, synthesized Web Audio
engine-inspired sound. It is explicitly labelled **not an H2R recording**.
There is no autoplay, external audio request, or recording of microphone input.
Playback stops when the tab is hidden or the component unmounts.

To use a real recording:

1. Add your licensed recording as `public/media/h2r.mp3`.
2. Change the constant near the top of `app/page.jsx`:

```jsx
const ENGINE_AUDIO_URL = "/media/h2r.mp3";
```

The same play/stop and volume controls then operate the recording. The equalizer
is a decorative playback animation, not a frequency analyzer. A video modal is
not required because this implementation uses the requested audio-teaser option.

## Design and content notes

- Carbon black `#090b0a`, gunmetal `#171b19`, neon green `#9aff00`.
- System fonts keep the project independent of font downloads. Headings use
  Impact/Arial Black where installed and fall back to a heavy sans serif.
- The hero uses `100svh`/`100vh` with a 700px minimum so controls remain accessible
  on short screens. All following sections grow naturally with content.
- The requested `310 HP` card includes a footnote: the referenced manufacturer
  figure is 310 **PS** (metric horsepower), approximately 306 mechanical hp.
  Specifications and imagery may reflect different model years; the page does
  not claim to be a particular model-year offer.
- This is an independent concept, not an official Kawasaki storefront. The final
  action opens the real manufacturer site rather than pretending to sell a bike.

## Validation

- Production build completed successfully with Next.js 16.3.6.
- Chromium checks: seven rendered blocks, no desktop (1440px) or mobile (390px)
  horizontal overflow, anchor scrolling and focus, menu open/close, audio
  play/stop, and live reduced-motion cleanup.
- No browser JavaScript runtime errors during those checks.
- The six selected image URLs were retrieved individually. Browser screenshots
  used the downloaded hero because the test browser's external networking was
  restricted; third-party image-host availability can still vary for visitors.

## Documentation references

- Next.js setup: https://nextjs.org/docs/app/getting-started/installation
- Tailwind with Next.js: https://nextjs.org/docs/app/getting-started/css
- Locomotive v5 options/ticker: https://scroll.locomotive.ca/docs/documentation/options
- Locomotive lifecycle/navigation: https://scroll.locomotive.ca/docs/documentation/methods
- GSAP React lifecycle: https://gsap.com/resources/react-basics/
- Kawasaki rating reference: https://www.kawasaki-motors.vn/en-vn/motorcycle/ninja/hypersport/ninja-h2r/2022-ninja-h2r
