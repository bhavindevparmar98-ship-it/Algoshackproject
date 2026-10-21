import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Plain-text headings only; the hero and the platform/knowledge sections have their own effects.
const headings = Array.from(
  document.querySelectorAll<HTMLElement>("main h2")
).filter(
  (el) =>
    !el.closest(".section_home_about, .platform_tour, .section_knowledge, .section_journey") &&
    el.children.length === 0 &&
    (el.textContent ?? "").trim().length > 0
);

if (!reduceMotion) {
  // Simple one-time fade-up when the heading first scrolls into view
  headings.forEach((heading) => {
    gsap.from(heading, {
      y: 20,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power2.out",
      clearProps: "transform,opacity,visibility",
      scrollTrigger: { trigger: heading, start: "top 90%", once: true },
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
