import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const grid = document.querySelector<HTMLElement>(".leadership__grid");

if (grid && !reduceMotion) {
  const cards = Array.from(grid.querySelectorAll<HTMLElement>(".leader-card"));

  // Each card is revealed upward like a curtain, its photo settles from a slight zoom,
  // then the name, role and actions follow one by one.
  const reveal = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: grid, start: "top 85%", once: true },
  });

  cards.forEach((card, index) => {
    const photo = card.querySelector<HTMLElement>(".leader-card__photo");
    const details = card.querySelectorAll<HTMLElement>(
      ".leader-card__who > *, .leader-card__linkedin, .leader-card__toggle"
    );
    const at = index * 0.15;

    reveal.fromTo(
      card,
      { y: 50, autoAlpha: 0, clipPath: "inset(12% 0% 0% 0% round 4px)" },
      { y: 0, autoAlpha: 1, clipPath: "inset(0% 0% 0% 0% round 4px)", duration: 1.1, clearProps: "transform,opacity,visibility,clipPath" },
      at
    );
    if (photo) reveal.from(photo, { scale: 1.2, duration: 1.5, ease: "power2.out", clearProps: "transform" }, at);
    if (details.length) {
      reveal.from(details, { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.08, clearProps: "transform,opacity,visibility" }, at + 0.5);
    }
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
