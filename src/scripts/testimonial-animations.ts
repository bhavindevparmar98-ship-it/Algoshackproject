import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

if (!reduceMotion) {
  // Scroll-scrubbed intro: the section pins while the heading types out,
  // then the slider rises in and the page continues scrolling.
  const section = document.querySelector<HTMLElement>(".section_testimonials");
  const eyebrow = section?.querySelector<HTMLElement>(".testimonial_eyebrow");
  const heading = section?.querySelector<HTMLElement>(".testimonial_header h2");
  const slider = section?.querySelector<HTMLElement>(".marquee_slider");

  if (section && heading && slider) {
    const text = (heading.textContent ?? "").trim();
    heading.setAttribute("aria-label", text);
    heading.textContent = "";

    const chars: HTMLElement[] = [];
    text.split(/\s+/).forEach((word, i, words) => {
      const wordEl = document.createElement("span");
      wordEl.setAttribute("aria-hidden", "true");
      wordEl.style.display = "inline-block";
      wordEl.style.whiteSpace = "nowrap";
      for (const ch of word) {
        const c = document.createElement("span");
        c.textContent = ch;
        c.style.opacity = "0";
        wordEl.appendChild(c);
        chars.push(c);
      }
      heading.appendChild(wordEl);
      if (i < words.length - 1) heading.appendChild(document.createTextNode(" "));
    });

    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=120%",
        pin: true,
        scrub: 0.6,
        anticipatePin: 1,
      },
    });

    if (eyebrow) tl.from(eyebrow, { autoAlpha: 0, y: 16, duration: 0.15, ease: "power2.out" });
    tl.to(chars, { opacity: 1, duration: 0.01, stagger: 0.6 / chars.length }, eyebrow ? ">" : 0);
    tl.from(slider, { y: 60, autoAlpha: 0, duration: 0.25, ease: "power2.out" }, ">+0.05");
    tl.to({}, { duration: 0.1 });
  }

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
