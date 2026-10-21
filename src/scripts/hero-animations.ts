import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const hero = document.querySelector<HTMLElement>(".section_home_about");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Splits text into word spans for a simple word-by-word reveal.
const splitWords = (el: HTMLElement) => {
  const label = el.textContent?.trim() ?? "";
  el.setAttribute("aria-label", label);
  el.textContent = "";
  const words: HTMLElement[] = [];

  label.split(/\s+/).forEach((word, index, all) => {
    const wordEl = document.createElement("span");
    wordEl.setAttribute("aria-hidden", "true");
    wordEl.style.cssText = "display:inline-block;will-change:transform,opacity;";
    wordEl.textContent = word;
    el.appendChild(wordEl);
    words.push(wordEl);
    if (index < all.length - 1) el.appendChild(document.createTextNode(" "));
  });

  return words;
};

// Soft glowing orbs that drift behind the content.
const createOrbs = (mesh: HTMLElement) => {
  const palette = [
    "rgba(27, 157, 217, 0.35)",
    "rgba(0, 180, 160, 0.3)",
    "rgba(120, 140, 255, 0.22)",
  ];
  const layout = [
    { size: 360, left: "6%", top: "12%" },
    { size: 300, left: "72%", top: "48%" },
    { size: 220, left: "58%", top: "-6%" },
  ];

  return layout.map((spec, index) => {
    const orb = document.createElement("span");
    orb.style.cssText = `position:absolute;left:${spec.left};top:${spec.top};width:${spec.size}px;height:${spec.size}px;border-radius:50%;background:radial-gradient(circle,${palette[index]},transparent 68%);pointer-events:none;will-change:transform;`;
    mesh.appendChild(orb);
    return orb;
  });
};

if (hero && !reduceMotion) {
  const mesh = hero.querySelector<HTMLElement>(".home_about_mesh");
  const heading = hero.querySelector<HTMLElement>(".home_about_copy h1");
  const paragraph = hero.querySelector<HTMLElement>(".home_about_copy p");
  const buttons = Array.from(hero.querySelectorAll<HTMLElement>(".home_about_button"));

  // Entrance timeline
  const intro = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.15 });

  if (mesh) {
    intro.from(mesh, { autoAlpha: 0, scale: 1.12, duration: 2, ease: "power2.out" }, 0);
  }

  // Heading: words glide up and fade in one after another
  let headingWords: HTMLElement[] = [];

  if (heading) {
    headingWords = splitWords(heading);
    intro.from(
      headingWords,
      {
        y: 36,
        autoAlpha: 0,
        filter: "blur(6px)",
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        clearProps: "filter",
      },
      0.2
    );
  }

  if (paragraph) {
    intro.from(paragraph, { y: 28, autoAlpha: 0, filter: "blur(8px)", duration: 1, clearProps: "filter" }, 0.7);
  }

  if (buttons.length) {
    intro.from(
      buttons,
      { y: 30, scale: 0.9, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: "back.out(1.6)", clearProps: "transform,opacity,visibility" },
      0.95
    );
  }

  if (mesh) {
    // Slow ambient motion

    const orbs = createOrbs(mesh);
    orbs.forEach((orb, index) => {
      gsap.to(orb, {
        x: gsap.utils.random(-70, 70),
        y: gsap.utils.random(-50, 50),
        duration: gsap.utils.random(7, 11),
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        force3D: true,
        delay: index * 0.6,
      });
    });

    // Pointer parallax on the background only; text stays crisp and still
    if (canHover) {
      const meshX = gsap.quickTo(mesh, "x", { duration: 1.2, ease: "power3.out" });
      const meshY = gsap.quickTo(mesh, "y", { duration: 1.2, ease: "power3.out" });
      let box: DOMRect | null = null;

      hero.addEventListener("pointerenter", () => {
        box = hero.getBoundingClientRect();
      });

      hero.addEventListener("pointermove", (event) => {
        if (!box) return;
        const px = (event.clientX - box.left) / box.width - 0.5;
        const py = (event.clientY - box.top) / box.height - 0.5;

        meshX(px * -28);
        meshY(py * -20);
      });

      hero.addEventListener("pointerleave", () => {
        box = null;
        meshX(0);
        meshY(0);
      });
    }
  }

  // Magnetic buttons: pulled toward the cursor with a soft spring
  if (canHover) {
    buttons.forEach((button) => {
      button.style.transition = "background 0.2s ease, border-color 0.2s ease";

      const moveX = gsap.quickTo(button, "x", { duration: 0.6, ease: "power3.out" });
      const moveY = gsap.quickTo(button, "y", { duration: 0.6, ease: "power3.out" });
      let box: DOMRect | null = null;

      button.addEventListener("pointerenter", () => {
        box = button.getBoundingClientRect();
        gsap.to(button, { scale: 1.05, duration: 0.3, ease: "power2.out" });
      });

      button.addEventListener("pointermove", (event) => {
        if (!box) return;
        moveX((event.clientX - (box.left + box.width / 2)) * 0.22);
        moveY((event.clientY - (box.top + box.height / 2)) * 0.3);
      });

      button.addEventListener("pointerleave", () => {
        box = null;
        moveX(0);
        moveY(0);
        gsap.to(button, { scale: 1, duration: 0.4, ease: "power2.out" });
      });
    });
  }

  // Scroll: heading and content fade up gently
  const startScroll = () => {
    const rest = [paragraph, ...buttons].filter(Boolean);
    if (rest.length) {
      gsap.to(rest, {
        y: -50,
        autoAlpha: 0,
        ease: "none",
        stagger: 0.05,
        scrollTrigger: { trigger: hero, start: "top top", end: "60% top", scrub: 0.6 },
      });
    }
  };

  // Created after the intro so the scroll tweens read the settled letter positions
  intro.eventCallback("onComplete", startScroll);

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
