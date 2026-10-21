import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const section = document.querySelector<HTMLElement>(".section_journey");

// Splits a heading into masked words so they can rise in one by one.
const splitWords = (el: HTMLElement) => {
  const label = el.textContent?.trim() ?? "";
  el.setAttribute("aria-label", label);
  el.textContent = "";

  return label.split(/\s+/).map((word, index, all) => {
    const mask = document.createElement("span");
    mask.setAttribute("aria-hidden", "true");
    mask.style.cssText = "display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.12em;";

    const inner = document.createElement("span");
    inner.style.display = "inline-block";
    inner.textContent = word;
    mask.appendChild(inner);

    el.appendChild(mask);
    if (index < all.length - 1) el.appendChild(document.createTextNode(" "));
    return inner;
  });
};

if (section && !reduceMotion) {
  const eyebrow = section.querySelector<HTMLElement>(".home_journey_eyebrow");
  const heading = section.querySelector<HTMLElement>(".home_journey_title_wrap h2");
  const text = section.querySelector<HTMLElement>(".home_journey_title_wrap p");
  const bento = section.querySelector<HTMLElement>(".home_journey_bento");
  const cards = gsap.utils.toArray<HTMLElement>(".home_journey_card", section);

  // Header: eyebrow, word-by-word title, then the supporting line
  const header = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: heading ?? section, start: "top 85%", once: true },
  });

  if (eyebrow) header.from(eyebrow, { y: 20, autoAlpha: 0, duration: 0.9, clearProps: "transform,opacity,visibility" });
  if (heading) {
    const words = splitWords(heading);
    header.from(words, { yPercent: 115, duration: 0.9, stagger: 0.08 }, eyebrow ? "-=0.4" : 0);
  }
  if (text) header.from(text, { y: 24, autoAlpha: 0, duration: 0.9 }, "-=0.5");

  if (bento && cards.length) {
    // Cards open with a clip-path reveal, each from a different edge
    const clipFrom = (card: HTMLElement) => {
      if (card.classList.contains("is-tall")) return "inset(100% 0% 0% 0%)";
      if (card.classList.contains("is-wide")) return "inset(0% 100% 0% 0%)";
      if (card.classList.contains("is-number")) return "inset(0% 0% 100% 0%)";
      return "inset(0% 0% 0% 100%)";
    };

    const reveal = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      scrollTrigger: { trigger: bento, start: "top 82%", once: true },
    });

    cards.forEach((card, index) => {
      const image = card.querySelector<HTMLElement>(".home_journey_image");
      const content = card.querySelectorAll<HTMLElement>(".home_journey_card_content > *");
      const at = index * 0.15;

      reveal.fromTo(card, { clipPath: clipFrom(card) }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, clearProps: "clipPath" }, at);
      if (image) reveal.from(image, { scale: 1.25, duration: 1.6, ease: "power2.out" }, at);
      reveal.from(content, { y: 28, autoAlpha: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }, at + 0.55);
    });

    // Count the headline number up when its card appears
    const number = bento.querySelector<HTMLElement>(".home_journey_card_number");
    if (number) {
      const match = number.textContent?.match(/^(\d+)(.*)$/);
      if (match) {
        const target = Number(match[1]);
        const suffix = match[2];
        const counter = { value: 0 };
        number.setAttribute("aria-label", number.textContent!.trim());
        number.textContent = `0${suffix}`;

        gsap.to(counter, {
          value: target,
          duration: 2,
          ease: "power2.out",
          onUpdate: () => {
            number.textContent = `${Math.round(counter.value)}${suffix}`;
          },
          scrollTrigger: { trigger: bento, start: "top 70%", once: true },
        });
      }
    }

    // Photos drift slower than the page for a light parallax feel
    gsap.utils.toArray<HTMLElement>(".home_journey_image", section).forEach((image) => {
      gsap.fromTo(
        image,
        { yPercent: -6 },
        {
          yPercent: 6,
          ease: "none",
          scrollTrigger: {
            trigger: image.closest(".home_journey_card") ?? image,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );
    });

    // Pointer-driven tilt and image zoom on desktop only
    if (canHover) {
      cards.forEach((card) => {
        const image = card.querySelector<HTMLElement>(".home_journey_image");
        const rotateX = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
        const rotateY = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
        const lift = gsap.quickTo(card, "y", { duration: 0.5, ease: "power3.out" });

        gsap.set(card, { transformPerspective: 1000, transformOrigin: "center" });

        card.addEventListener("pointerenter", () => {
          lift(-6);
          if (image) gsap.to(image, { scale: 1.06, duration: 0.8, ease: "power2.out", overwrite: "auto" });
        });

        card.addEventListener("pointermove", (event) => {
          const box = card.getBoundingClientRect();
          const px = (event.clientX - box.left) / box.width;
          const py = (event.clientY - box.top) / box.height;
          rotateY((px - 0.5) * 5);
          rotateX((0.5 - py) * 5);
        });

        card.addEventListener("pointerleave", () => {
          rotateX(0);
          rotateY(0);
          lift(0);
          if (image) gsap.to(image, { scale: 1, duration: 0.8, ease: "power2.out", overwrite: "auto" });
        });
      });
    }
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
