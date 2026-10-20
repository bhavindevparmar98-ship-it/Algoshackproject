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
  headings.forEach((heading) => {
    const label = heading.textContent!.trim();
    heading.setAttribute("aria-label", label);
    heading.textContent = "";

    const chars: HTMLElement[] = [];

    label.split(/\s+/).forEach((word, index, all) => {
      const wordEl = document.createElement("span");
      wordEl.setAttribute("aria-hidden", "true");
      wordEl.style.cssText = "display:inline-block;white-space:nowrap;";

      Array.from(word).forEach((letter) => {
        const char = document.createElement("span");
        char.style.cssText = "display:inline-block;will-change:transform;";
        char.textContent = letter;
        wordEl.appendChild(char);
        chars.push(char);
      });

      heading.appendChild(wordEl);
      if (index < all.length - 1) heading.appendChild(document.createTextNode(" "));
    });

    // Letters start scattered and assemble as the heading scrolls into view
    gsap.from(chars, {
      x: () => gsap.utils.random(-120, 120),
      y: () => gsap.utils.random(-80, 80),
      rotation: () => gsap.utils.random(-45, 45),
      scale: () => gsap.utils.random(0.5, 1.4),
      autoAlpha: 0,
      ease: "power3.out",
      stagger: { each: 0.01, from: "random" },
      scrollTrigger: {
        trigger: heading,
        start: "top 92%",
        end: "top 55%",
        scrub: 0.7,
        invalidateOnRefresh: true,
      },
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
