export function initTimelines(root: ParentNode = document): void {
  const lists = Array.from(root.querySelectorAll<HTMLElement>("[data-timeline]"));

  lists.forEach((list) => {
    const items = Array.from(list.querySelectorAll<HTMLElement>(".timeline_item"));

    if (items.length === 0) {
      return;
    }

    const years = items.map((item) => {
      const year = item.querySelector<HTMLElement>(".timeline_year");

      if (!year) {
        throw new Error("Timeline item is missing its year element.");
      }

      return year;
    });

    // One-time reveal as each item enters the viewport
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!reduceMotion && "IntersectionObserver" in window) {
      list.classList.add("is-ready");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      items.forEach((item) => observer.observe(item));
    }

    let ticking = false;

    const update = () => {
      ticking = false;
      const focus = window.innerHeight * 0.5;
      const listBounds = list.getBoundingClientRect();
      const progress = Math.min(listBounds.height, Math.max(0, focus - listBounds.top));

      list.style.setProperty("--timeline-progress", `${progress}px`);

      let activeIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      items.forEach((item, index) => {
        const bounds = item.getBoundingClientRect();
        const distance = Math.abs(bounds.top + bounds.height / 2 - focus);

        if (distance < closestDistance) {
          closestDistance = distance;
          activeIndex = index;
        }
      });

      items.forEach((item, index) => {
        const yearBounds = years[index].getBoundingClientRect();

        item.classList.toggle("is-active", index === activeIndex);
        item.classList.toggle(
          "is-reached",
          index === 0 || focus >= yearBounds.top + yearBounds.height / 2
        );
      });
    };

    const scheduleUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("load", scheduleUpdate);
    update();
  });
}
