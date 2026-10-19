import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const component = document.querySelector<HTMLElement>(".home_stats_component");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (component && !reduceMotion) {
  const cards = Array.from(component.querySelectorAll<HTMLElement>(".home_stats_card"));

  // Counts every number inside a string such as "8+", "37%+" or "96 / 94" up from zero.
  const prepareCounter = (el: HTMLElement) => {
    const finalText = el.textContent ?? "";
    const targets = (finalText.match(/\d+/g) ?? []).map(Number);
    el.setAttribute("aria-label", finalText);
    el.style.fontVariantNumeric = "tabular-nums";

    const render = (progress: number) => {
      let i = 0;
      el.textContent = finalText.replace(/\d+/g, () => String(Math.round(targets[i++] * progress)));
    };

    render(0);
    return { render, finalText };
  };

  const counters = cards.map((card) => {
    const number = card.querySelector<HTMLElement>(".home_stats_number");
    return number ? prepareCounter(number) : null;
  });

  // Shine sweep element, one per card
  const shines = cards.map((card) => {
    const shine = document.createElement("span");
    shine.setAttribute("aria-hidden", "true");
    shine.style.cssText =
      "position:absolute;inset:0;pointer-events:none;transform:translateX(-110%) skewX(-18deg);background:linear-gradient(105deg,transparent 35%,rgba(165,180,252,0.18) 50%,transparent 65%);";
    card.appendChild(shine);
    return shine;
  });

  const intro = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: component, start: "top 82%", once: true },
  });

  intro
    .from(component, { clipPath: "inset(0 50% 0 50% round 8px)", duration: 1.1, ease: "power4.inOut" })
    .from(
      cards.map((card) => card.querySelector(".home_stats_content")),
      { y: 40, autoAlpha: 0, scale: 0.9, duration: 0.9, stagger: 0.12 },
      "-=0.5"
    )
    .from(
      cards.map((card) => card.querySelector(".home_stats_label")),
      { y: 14, autoAlpha: 0, letterSpacing: "0.3em", duration: 0.9, stagger: 0.12, clearProps: "letterSpacing" },
      "<0.2"
    );

  counters.forEach((counter, index) => {
    if (!counter) return;
    const state = { p: 0 };
    intro.to(
      state,
      {
        p: 1,
        duration: 2,
        ease: "power2.out",
        onUpdate: () => counter.render(state.p),
        onComplete: () => counter.render(1),
      },
      0.5 + index * 0.12
    );
  });

  shines.forEach((shine, index) => {
    intro.to(shine, { x: "320%", duration: 1.3, ease: "power2.inOut" }, 1.4 + index * 0.14);
  });

  // Hover: cursor spotlight, number lift and a gentle magnetic drift
  if (canHover) {
    cards.forEach((card) => {
      const content = card.querySelector<HTMLElement>(".home_stats_content");
      const number = card.querySelector<HTMLElement>(".home_stats_number");
      if (!content || !number) return;

      const moveX = gsap.quickTo(content, "x", { duration: 0.6, ease: "power3.out" });
      const moveY = gsap.quickTo(content, "y", { duration: 0.6, ease: "power3.out" });
      let box: DOMRect | null = null;

      card.addEventListener("pointerenter", () => {
        box = card.getBoundingClientRect();
        gsap.to(number, { scale: 1.08, duration: 0.5, ease: "back.out(2)", overwrite: "auto" });
      });

      card.addEventListener("pointermove", (event) => {
        if (!box) return;
        const px = (event.clientX - box.left) / box.width;
        const py = (event.clientY - box.top) / box.height;

        card.style.setProperty("--sx", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--sy", `${(py * 100).toFixed(1)}%`);
        moveX((px - 0.5) * 14);
        moveY((py - 0.5) * 10);
      });

      card.addEventListener("pointerleave", () => {
        box = null;
        moveX(0);
        moveY(0);
        gsap.to(number, { scale: 1, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      });
    });
  }

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
