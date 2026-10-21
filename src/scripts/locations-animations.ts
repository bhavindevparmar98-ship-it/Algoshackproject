import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const list = document.querySelector<HTMLElement>(".locations_list");

if (list && !reduceMotion) {
  const cards = Array.from(list.querySelectorAll<HTMLElement>(".locations_card"));

  const reveal = gsap.timeline({
    defaults: { ease: "power3.out" },
    scrollTrigger: { trigger: list, start: "top 85%", once: true },
  });

  cards.forEach((card, index) => {
    const media = card.querySelector<HTMLElement>(".locations_image-wrapper");
    const tag = card.querySelector<HTMLElement>(".locations_tag");
    const content = card.querySelectorAll<HTMLElement>(".locations_content-top > *, .locations_link");
    const at = index * 0.18;

    // Photo opens upward like a curtain, then the tag, text and link follow
    if (media) {
      reveal.fromTo(
        media,
        { clipPath: "inset(100% 0% 0% 0%)", y: 40 },
        { clipPath: "inset(0% 0% 0% 0%)", y: 0, duration: 1.1, clearProps: "clipPath,transform" },
        at
      );
    }
    if (tag) reveal.from(tag, { x: -20, autoAlpha: 0, duration: 0.7, clearProps: "transform,opacity,visibility" }, at + 0.6);
    reveal.from(card.querySelector(".locations_content"), { autoAlpha: 0, y: 30, duration: 0.9, clearProps: "transform,opacity,visibility" }, at + 0.3);
    if (content.length) {
      reveal.from(content, { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1, clearProps: "transform,opacity,visibility" }, at + 0.7);
    }
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}
