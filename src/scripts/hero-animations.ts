import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const hero = document.querySelector<HTMLElement>(".section_home_about");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Splits text into words (kept unbroken) and characters for per-letter motion.
const splitChars = (el: HTMLElement) => {
  const label = el.textContent?.trim() ?? "";
  el.setAttribute("aria-label", label);
  el.textContent = "";
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

    el.appendChild(wordEl);
    if (index < all.length - 1) el.appendChild(document.createTextNode(" "));
  });

  return chars;
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

  let chars: HTMLElement[] = [];

  if (heading) {
    chars = splitChars(heading);
    intro.from(
      chars,
      {
        y: 70,
        rotationX: -100,
        rotationZ: () => gsap.utils.random(-12, 12),
        scale: 0.6,
        autoAlpha: 0,
        transformPerspective: 700,
        transformOrigin: "50% 100%",
        duration: 1.1,
        ease: "back.out(1.7)",
        stagger: { each: 0.028, from: "center" },
      },
      0.2
    );

    // Letters spring up when the cursor passes over them
    if (canHover) {
      chars.forEach((char) => {
        char.addEventListener("pointerenter", () => {
          if (intro.isActive()) return;
          gsap.fromTo(
            char,
            { y: 0 },
            { y: -10, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 1, overwrite: "auto" }
          );
        });
      });
    }
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

  // Scroll: heading letters break apart and drift away; the rest of the content fades up
  const startScroll = () => {
    if (chars.length) {
      gsap.to(chars, {
        x: () => gsap.utils.random(-160, 160),
        y: () => gsap.utils.random(-120, 80),
        rotation: () => gsap.utils.random(-50, 50),
        scale: () => gsap.utils.random(0.5, 1.3),
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: hero, start: "top top", end: "70% top", scrub: 0.8, invalidateOnRefresh: true },
      });
    }

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
