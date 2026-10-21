import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (!reduceMotion) {
  // One-time entrance: the slider rises in as it scrolls into view
  document.querySelectorAll<HTMLElement>(".marquee_slider").forEach((slider) => {
    if (!slider.querySelector(".testimonial_card")) return;
    gsap.from(slider, {
      y: 50,
      autoAlpha: 0,
      duration: 1.1,
      ease: "power3.out",
      clearProps: "transform,opacity,visibility",
      scrollTrigger: { trigger: slider, start: "top 88%", once: true },
    });
  });

  // Hover is delegated, so the cloned marquee cards react too
  if (canHover) {
    const parts = (card: HTMLElement) => ({
      logo: card.querySelector<HTMLElement>(".testimonial_logo"),
      avatar: card.querySelector<HTMLElement>(".testimonial_avatar"),
      name: card.querySelector<HTMLElement>(".testimonial_name"),
    });

    const enter = (card: HTMLElement) => {
      const { logo, avatar, name } = parts(card);
      gsap.to(card, {
        y: -10,
        scale: 1.025,
        borderColor: "#2f8bcc",
        boxShadow: "0px 12px 2rem -1.25rem rgba(47, 139, 204, 0.25)",
        backgroundColor: "#ffffff",
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
      if (logo) gsap.to(logo, { x: 6, duration: 0.5, ease: "power3.out", overwrite: "auto" });
      if (avatar) gsap.to(avatar, { scale: 1.12, rotation: -4, duration: 0.5, ease: "back.out(2)", overwrite: "auto" });
      if (name) gsap.to(name, { x: 4, color: "#2f8bcc", duration: 0.4, ease: "power2.out", overwrite: "auto" });
    };

    const leave = (card: HTMLElement) => {
      const { logo, avatar, name } = parts(card);
      gsap.to(card, {
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateY: 0,
        borderColor: "",
        boxShadow: "0px 0px 0px 0px rgba(47, 139, 204, 0)",
        backgroundColor: "",
        duration: 0.6,
        ease: "power3.out",
        overwrite: "auto",
        clearProps: "boxShadow,backgroundColor,borderColor,transform",
      });
      if (logo) gsap.to(logo, { x: 0, duration: 0.5, ease: "power3.out", overwrite: "auto", clearProps: "transform" });
      if (avatar) gsap.to(avatar, { scale: 1, rotation: 0, duration: 0.5, ease: "power3.out", overwrite: "auto", clearProps: "transform" });
      if (name) gsap.to(name, { x: 0, color: "", duration: 0.4, ease: "power2.out", overwrite: "auto", clearProps: "transform,color" });
    };

    const cardFrom = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLElement>(".testimonial_card") : null;

    document.addEventListener("pointerover", (event) => {
      const card = cardFrom(event.target);
      if (!card || card.contains(event.relatedTarget as Node | null)) return;
      enter(card);
    });

    document.addEventListener("pointerout", (event) => {
      const card = cardFrom(event.target);
      if (!card || card.contains(event.relatedTarget as Node | null)) return;
      leave(card);
    });
  }
}
