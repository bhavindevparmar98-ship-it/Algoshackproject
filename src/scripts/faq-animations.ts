import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const list = document.querySelector<HTMLElement>(".section_faq .faq_list");

if (list && !reduceMotion) {
  const items = Array.from(list.querySelectorAll<HTMLElement>(".faq_item"));

  // Rows slide in one by one with their border drawn from a clipped edge
  const reveal = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: list, start: "top 85%", once: true },
  });

  reveal.fromTo(
    items,
    { x: -40, autoAlpha: 0, clipPath: "inset(0% 100% 0% 0%)" },
    {
      x: 0,
      autoAlpha: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1,
      stagger: 0.1,
      clearProps: "transform,opacity,visibility,clipPath",
    }
  );

  items.forEach((item, index) => {
    const icon = item.querySelector<HTMLElement>(".faq_icon");
    if (icon) {
      reveal.from(icon, { scale: 0, rotation: -90, duration: 0.6, ease: "back.out(2)", clearProps: "transform" }, 0.35 + index * 0.1);
    }
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
