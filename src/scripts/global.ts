// Homepage stats: animate each number's gradient while respecting reduced-motion preferences.
const cards = document.querySelectorAll<HTMLElement>(".home_stats_card");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const idleSpeed = 0.00035;
const easing = 0.08;

const items = Array.from(cards, (card, index) => {
  const number = card.querySelector<HTMLElement>(".home_stats_number");

  if (!number) {
    throw new Error("Stats card is missing its number element.");
  }

  const item = {
    number,
    position: 0,
    hovered: false,
    mouse: 0,
    offset: index * 0.9
  };

  // Follow the pointer across a stat card. With reduced motion, update directly without animation.
  card.addEventListener("mousemove", (event) => {
    const bounds = card.getBoundingClientRect();
    item.mouse = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));
    item.hovered = true;

    if (reduceMotion) {
      item.position = item.mouse;
      number.style.setProperty("--mx", `${item.position.toFixed(2)}%`);
    }
  });

  // Resume the idle gradient glide when the pointer leaves a card.
  card.addEventListener("mouseleave", () => {
    item.hovered = false;
  });

  return item;
});

// Idle gradient motion is decorative, so stop the animation loop when motion reduction is requested.
if (!reduceMotion && items.length > 0) {
  function animateGradient(time: number) {
    items.forEach((item) => {
      const idlePosition = ((Math.sin(time * idleSpeed * 2 * Math.PI + item.offset) + 1) / 2) * 100;
      const target = item.hovered ? item.mouse : idlePosition;

      item.position += (target - item.position) * easing;
      item.number.style.setProperty("--mx", `${item.position.toFixed(2)}%`);
    });

    requestAnimationFrame(animateGradient);
  }

  // FAQ accordion: keep the answer visibility, inert state, and ARIA state in sync.
  const faqLists = document.querySelectorAll<HTMLElement>("[data-faq]");

  faqLists.forEach((list) => {
    const faqItems = Array.from(list.querySelectorAll<HTMLElement>("[data-faq-item]"));

    const setOpen = (item: HTMLElement, open: boolean) => {
      item.classList.toggle("is-open", open);

      const trigger = item.querySelector<HTMLButtonElement>("[data-faq-trigger]");
      const answer = item.querySelector<HTMLElement>(".faq_answer-wrap");

      if (!trigger || !answer) {
        throw new Error("FAQ item is missing its trigger or answer.");
      }

      trigger.setAttribute("aria-expanded", String(open));
      answer.setAttribute("aria-hidden", String(!open));
      answer.inert = !open;
    };

    faqItems.forEach((item) => {
      const trigger = item.querySelector<HTMLButtonElement>("[data-faq-trigger]");

      if (!trigger) {
        throw new Error("FAQ item is missing its trigger.");
      }

      trigger.addEventListener("click", () => {
        const willOpen = !item.classList.contains("is-open");

        if (willOpen) {
          faqItems.forEach((other) => {
            if (other !== item) {
              setOpen(other, false);
            }
          });
        }

        setOpen(item, willOpen);
      });
    });
  });

  requestAnimationFrame(animateGradient);
}
