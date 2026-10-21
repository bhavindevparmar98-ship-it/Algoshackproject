import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (!reduceMotion) {
  document.querySelectorAll<HTMLElement>(".marquee_slider").forEach((slider) => {
    if (!slider.querySelector(".life_card")) return;
    gsap.from(slider, {
      y: 50,
      autoAlpha: 0,
      duration: 1.1,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility",
      scrollTrigger: { trigger: slider, start: "top 88%", once: true },
    });
  });

  // Delegated so the cloned marquee cards react as well
  if (canHover) {
    const cardFrom = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLElement>(".life_card") : null;

    const enter = (card: HTMLElement) => {
      const image = card.querySelector(".life_card_image");
      const icon = card.querySelector(".life_card_icon");
      const divider = card.querySelector(".life_card_divider");
      const content = card.querySelector(".life_card_content");

      gsap.to(image, { scale: 1.12, duration: 1.2, ease: "power3.out", overwrite: "auto" });
      gsap.to(content, { y: -8, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      gsap.to(icon, { rotation: -8, scale: 1.2, transformOrigin: "50% 50%", duration: 0.5, ease: "back.out(2)", overwrite: "auto" });
      gsap.fromTo(
        divider,
        { scaleX: 0.2, transformOrigin: "0% 50%", backgroundColor: "rgba(27, 157, 217, 0.9)" },
        { scaleX: 1, duration: 0.7, ease: "power3.out", overwrite: "auto" }
      );
    };

    const leave = (card: HTMLElement) => {
      const image = card.querySelector(".life_card_image");
      const icon = card.querySelector(".life_card_icon");
      const divider = card.querySelector(".life_card_divider");
      const content = card.querySelector(".life_card_content");

      gsap.to(image, { scale: 1, duration: 1, ease: "power3.out", overwrite: "auto", clearProps: "transform" });
      gsap.to(content, { y: 0, duration: 0.6, ease: "power3.out", overwrite: "auto", clearProps: "transform" });
      gsap.to(icon, { rotation: 0, scale: 1, duration: 0.5, ease: "power3.out", overwrite: "auto", clearProps: "transform" });
      gsap.to(divider, { backgroundColor: "rgba(228, 233, 237, 0.2)", duration: 0.5, overwrite: "auto", clearProps: "transform,backgroundColor" });
    };

    document.addEventListener("pointerover", (event) => {
      const card = cardFrom(event.target);
      if (card && !card.contains(event.relatedTarget as Node | null)) enter(card);
    });

    document.addEventListener("pointerout", (event) => {
      const card = cardFrom(event.target);
      if (card && !card.contains(event.relatedTarget as Node | null)) leave(card);
    });
  }
}
