// ---------- Homepage stats ----------
const cards = document.querySelectorAll<HTMLElement>(".home_stats_card");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const DEFAULT_POSITION = 50; // screenshot jevo default look. Aa value 0-100 ma tune kari shako
const easing = 0.1;

type StatItem = {
  number: HTMLElement;
  position: number;
  target: number;
};

const items: StatItem[] = [];
let running = false;

const render = (item: StatItem) => {
  item.number.style.setProperty("--mx", `${item.position.toFixed(2)}%`);
};

const tick = () => {
  let moving = false;

  items.forEach((item) => {
    const diff = item.target - item.position;

    if (Math.abs(diff) > 0.05) {
      item.position += diff * easing;
      moving = true;
    } else {
      item.position = item.target;
    }

    render(item);
  });

  if (moving) {
    requestAnimationFrame(tick);
  } else {
    running = false;
  }
};

// Animation loop sirf jyare jarur hoy tyare j chale
const start = () => {
  if (running) return;
  running = true;
  requestAnimationFrame(tick);
};

cards.forEach((card) => {
  const number = card.querySelector<HTMLElement>(".home_stats_number");
  if (!number) return;

  const item: StatItem = {
    number,
    position: DEFAULT_POSITION,
    target: DEFAULT_POSITION,
  };

  render(item); // default look set karo

  card.addEventListener("mousemove", (event) => {
    const bounds = card.getBoundingClientRect();
    item.target = Math.min(100, Math.max(0, ((event.clientX - bounds.left) / bounds.width) * 100));

    if (reduceMotion) {
      item.position = item.target;
      render(item);
    } else {
      start();
    }
  });

  card.addEventListener("mouseleave", () => {
    item.target = DEFAULT_POSITION;

    if (reduceMotion) {
      item.position = DEFAULT_POSITION;
      render(item);
    } else {
      start();
    }
  });

  items.push(item);
});

// ---------- FAQ accordion (independent of motion preference) ----------
const faqLists = document.querySelectorAll<HTMLElement>("[data-faq]");

faqLists.forEach((list) => {
  const faqItems = Array.from(list.querySelectorAll<HTMLElement>("[data-faq-item]"));

  const setOpen = (item: HTMLElement, open: boolean) => {
    const trigger = item.querySelector<HTMLButtonElement>("[data-faq-trigger]");
    const answer = item.querySelector<HTMLElement>(".faq_answer-wrap");
    if (!trigger || !answer) return;

    item.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    answer.setAttribute("aria-hidden", String(!open));
    answer.inert = !open;
  };

  faqItems.forEach((item) => {
    const trigger = item.querySelector<HTMLButtonElement>("[data-faq-trigger]");
    if (!trigger) return;

    trigger.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");

      if (willOpen) {
        faqItems.forEach((other) => {
          if (other !== item) setOpen(other, false);
        });
      }

      setOpen(item, willOpen);
    });
  });
});

const navbar = document.querySelector(".navbar_wrapper");

if (navbar) {
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("is-scrolled", window.scrollY > 38);
  }, { passive: true });
}