import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  // Lower lerp and wheelMultiplier = slower, softer scrolling
  const lenis = new Lenis({
    lerp: 0.075,
    wheelMultiplier: 0.75,
    touchMultiplier: 1,
    anchors: { offset: -80 },
  });

  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // Scroll progress bar
  const bar = document.createElement("div");
  bar.setAttribute("aria-hidden", "true");
  bar.style.cssText =
    "position:fixed;top:0;left:0;height:3px;width:100%;z-index:9999;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#1b9dd9,#00b4a0);pointer-events:none;";
  document.body.appendChild(bar);

  gsap.to(bar, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { trigger: document.documentElement, start: "top top", end: "bottom bottom", scrub: 0.3 },
  });

  // Sections ease in from a slightly smaller, rounded card to full size
  const sections = gsap.utils.toArray<HTMLElement>(
    ".main-wrapper > section:not(.section_home_about):not(.section_home_stats)"
  );

  sections.forEach((section) => {
    gsap.fromTo(
      section,
      { scale: 0.94, borderRadius: 32, transformOrigin: "50% 0%" },
      {
        scale: 1,
        borderRadius: 0,
        ease: "none",
        immediateRender: false,
        scrollTrigger: { trigger: section, start: "top 100%", end: "top 45%", scrub: 0.6 },
      }
    );
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
