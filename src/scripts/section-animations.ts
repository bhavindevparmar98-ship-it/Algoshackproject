import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type SectionConfig = {
  root: string;
  eyebrow: string;
  heading: string;
  text: string;
  grid: string;
  card: string;
  icon: string;
};

const sections: SectionConfig[] = [
  {
    root: ".platform_tour",
    eyebrow: ".platform_eyebrow",
    heading: ".platform_header h2",
    text: ".platform_header p",
    grid: ".platform_grid",
    card: ".platform_card",
    icon: ".platform_icon",
  },
  {
    root: ".section_knowledge",
    eyebrow: ".knowledge_eyebrow",
    heading: ".knowledge_header h2",
    text: ".knowledge_header p",
    grid: ".knowledge_grid",
    card: ".knowledge_card",
    icon: ".knowledge_icon",
  },
];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Wraps each word of a heading so words can rise in one after another.
const splitWords = (el: HTMLElement) => {
  const label = el.textContent?.trim() ?? "";
  el.setAttribute("aria-label", label);
  el.textContent = "";

  return label.split(/\s+/).map((word, index, all) => {
    const mask = document.createElement("span");
    mask.setAttribute("aria-hidden", "true");
    mask.style.display = "inline-block";
    mask.style.overflow = "hidden";
    mask.style.verticalAlign = "top";
    mask.style.paddingBottom = "0.12em";

    const inner = document.createElement("span");
    inner.style.display = "inline-block";
    inner.textContent = word;
    mask.appendChild(inner);

    el.appendChild(mask);
    if (index < all.length - 1) el.appendChild(document.createTextNode(" "));
    return inner;
  });
};

const initCardHover = (card: HTMLElement, icon: SVGElement | null) => {
  const rotateX = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3.out" });
  const rotateY = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3.out" });
  const lift = gsap.quickTo(card, "y", { duration: 0.4, ease: "power3.out" });

  gsap.set(card, { transformPerspective: 900, transformOrigin: "center" });
  let box: DOMRect | null = null;

  card.addEventListener("pointerenter", () => {
    box = card.getBoundingClientRect();
    lift(-6);
    if (icon) gsap.to(icon, { scale: 1.12, rotate: -4, duration: 0.45, ease: "back.out(2)" });
  });

  card.addEventListener("pointermove", (event) => {
    if (!box) return;
    const px = (event.clientX - box.left) / box.width;
    const py = (event.clientY - box.top) / box.height;

    card.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    card.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    rotateY((px - 0.5) * 6);
    rotateX((0.5 - py) * 6);
  });

  card.addEventListener("pointerleave", () => {
    box = null;
    rotateX(0);
    rotateY(0);
    lift(0);
    if (icon) gsap.to(icon, { scale: 1, rotate: 0, duration: 0.5, ease: "power3.out" });
  });
};

if (!reduceMotion) {
  sections.forEach((config) => {
    const root = document.querySelector<HTMLElement>(config.root);
    if (!root) return;

    const eyebrow = root.querySelector<HTMLElement>(config.eyebrow);
    const heading = root.querySelector<HTMLElement>(config.heading);
    const text = root.querySelector<HTMLElement>(config.text);
    const grid = root.querySelector<HTMLElement>(config.grid);
    const cards = Array.from(root.querySelectorAll<HTMLElement>(config.card));

    // Header: eyebrow, word-by-word heading, then paragraph
    const header = gsap.timeline({
      defaults: { ease: "power3.out" },
      scrollTrigger: { trigger: heading ?? root, start: "top 85%", once: true },
    });

    if (eyebrow) {
      header.from(eyebrow, { y: 16, autoAlpha: 0, letterSpacing: "0.3em", duration: 0.7 });
    }
    if (heading) {
      const words = splitWords(heading);
      header.from(words, { yPercent: 110, duration: 0.9, stagger: 0.07 }, eyebrow ? "-=0.4" : 0);
    }
    if (text) {
      header.from(text, { y: 24, autoAlpha: 0, duration: 0.9 }, "-=0.5");
    }

    if (!grid || !cards.length) return;

    // Cards: 3D flip-up with stagger, then draw each icon's strokes
    gsap.from(cards, {
      y: 60,
      rotationX: -18,
      scale: 0.94,
      autoAlpha: 0,
      transformPerspective: 900,
      transformOrigin: "50% 100%",
      duration: 1,
      ease: "power3.out",
      stagger: { each: 0.1, from: "start", grid: "auto" },
      scrollTrigger: { trigger: grid, start: "top 85%", once: true },
    });

    cards.forEach((card, index) => {
      const icon = card.querySelector<SVGElement>(config.icon);

      if (icon) {
        const shapes = Array.from(icon.querySelectorAll<SVGGeometryElement>("path, rect, circle"));
        shapes.forEach((shape) => {
          const length = shape.getTotalLength();
          gsap.fromTo(
            shape,
            { strokeDasharray: length, strokeDashoffset: length },
            {
              strokeDashoffset: 0,
              duration: 1.2,
              ease: "power2.inOut",
              delay: 0.35 + index * 0.1,
              clearProps: "strokeDasharray,strokeDashoffset",
              scrollTrigger: { trigger: grid, start: "top 85%", once: true },
            }
          );
        });
      }

      if (canHover) initCardHover(card, icon);
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
