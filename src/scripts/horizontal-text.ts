// import { gsap } from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import { SplitText } from "gsap/SplitText";

// gsap.registerPlugin(ScrollTrigger, SplitText);

// const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// const wrapper = document.querySelector<HTMLElement>(".Horizontal");
// const text = document.querySelector<HTMLElement>(".Horizontal__text");

// if (wrapper && text && !reduceMotion) {
//   const split = SplitText.create(text, { type: "chars, words" });

//   const scrollTween = gsap.to(text, {
//     xPercent: -100,
//     ease: "none",
//     scrollTrigger: {
//       trigger: wrapper,
//       pin: true,
//       end: "+=5000px",
//       scrub: true,
//     },
//   });

//   split.chars.forEach((char) => {
//     gsap.from(char, {
//       yPercent: "random(-200, 200)",
//       rotation: "random(-20, 20)",
//       ease: "back.out(1.2)",
//       scrollTrigger: {
//         trigger: char,
//         containerAnimation: scrollTween,
//         start: "left 100%",
//         end: "left 30%",
//         scrub: 1,
//       },
//     });
//   });
// }
