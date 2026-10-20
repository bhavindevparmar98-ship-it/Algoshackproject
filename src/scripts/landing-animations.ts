import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  // clearProps hands transform/opacity back to the existing CSS (hover effects etc.)
  const clear = "transform,opacity,visibility";

  // Section headings and intro copy reveal on scroll
  const headers = gsap.utils.toArray<HTMLElement>(
    [
      ".channels_header",
      ".trust_header",
      ".home_values_header",
      "main section[aria-labelledby]:not(.platform_tour):not(.section_knowledge):not(.section_journey) > .padding-global > .container-large > .padding-section-large > :first-child",
    ].join(",")
  );

  headers.forEach((el) => {
    gsap.from(el, {
      y: 28,
      autoAlpha: 0,
      duration: 0.8,
      ease: "power2.out",
      clearProps: clear,
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });

  // Card groups: stagger siblings together
  const groups = [
    ".home_values_list",
  ];

  groups.forEach((selector) => {
    gsap.utils.toArray<HTMLElement>(selector).forEach((group) => {
      const items = Array.from(group.children) as HTMLElement[];
      if (!items.length) return;

      gsap.from(items, {
        y: 32,
        autoAlpha: 0,
        duration: 0.75,
        ease: "power2.out",
        stagger: 0.12,
        clearProps: clear,
        scrollTrigger: { trigger: group, start: "top 85%", once: true },
      });
    });
  });

  // Images (phone/device mockups, illustrations) fade in and rise slowly
  gsap.utils
    .toArray<HTMLElement>(".platform_card img, .section_locations img")
    .forEach((img) => {
      gsap.from(img, {
        y: 24,
        scale: 0.96,
        autoAlpha: 0,
        duration: 1.1,
        ease: "power3.out",
        clearProps: clear,
        scrollTrigger: { trigger: img, start: "top 92%", once: true },
      });
    });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
