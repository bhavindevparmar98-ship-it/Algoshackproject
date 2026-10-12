export function initMarquees(root: ParentNode = document): void {
  const sliders = Array.from(root.querySelectorAll<HTMLElement>("[data-marquee]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  sliders.forEach((slider) => {
    if (slider.dataset.ready === "true") {
      return;
    }

    const track = slider.querySelector<HTMLElement>(".marquee_track");

    if (!track) {
      throw new Error("Marquee slider is missing its track.");
    }

    slider.dataset.ready = "true";
    const cards = Array.from(track.children);

    if (cards.length === 0) {
      return;
    }

    if (reduceMotion) {
      slider.classList.add("is-static");
      return;
    }

    cards.forEach((card) => {
      const clone = card.cloneNode(true);

      if (!(clone instanceof HTMLElement)) {
        throw new Error("Marquee card clone is not an HTML element.");
      }

      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    const speed = Number.parseFloat(slider.dataset.speed ?? "") || 40;
    let position = 0;
    let speedFactor = 1;
    let targetSpeedFactor = 1;
    let visible = true;
    let previousTime: number | null = null;
    let loopDistance = 0;

    const measure = () => {
      const firstClone = track.children[cards.length];
      const firstCard = track.children[0];

      if (!(firstClone instanceof HTMLElement) || !(firstCard instanceof HTMLElement)) {
        throw new Error("Marquee slider is missing its original or cloned cards.");
      }

      loopDistance = firstClone.offsetLeft - firstCard.offsetLeft;
    };

    const animate = (time: number) => {
      if (previousTime === null) {
        previousTime = time;
      }

      const delta = Math.min(0.1, (time - previousTime) / 1000);
      previousTime = time;

      if (visible && loopDistance > 0) {
        speedFactor += (targetSpeedFactor - speedFactor) * (1 - Math.exp(-delta * 6));
        position = (position + speed * speedFactor * delta) % loopDistance;
        track.style.transform = `translate3d(${-position.toFixed(2)}px, 0, 0)`;
      }

      requestAnimationFrame(animate);
    };

    slider.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse") {
        targetSpeedFactor = 0;
      }
    });

    slider.addEventListener("pointerleave", (event) => {
      if (event.pointerType === "mouse") {
        targetSpeedFactor = 1;
      }
    });

    slider.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse") {
        targetSpeedFactor = 0;
      }
    });

    ["pointerup", "pointercancel"].forEach((type) => {
      slider.addEventListener(type, (event) => {
        if (event instanceof PointerEvent && event.pointerType !== "mouse") {
          targetSpeedFactor = 1;
        }
      });
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
      });

      observer.observe(slider);
    }

    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    measure();
    requestAnimationFrame(animate);
  });
}
