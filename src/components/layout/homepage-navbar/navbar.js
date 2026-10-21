/* AlgoShack – Navbar behaviour
   - announcement bar close (session ma yaad rakhe)
   - desktop mega menu: hover + click + keyboard (Esc / Tab)
   - mega menu tabs (categories -> panes)
   - mobile menu (hamburger) + accordion
*/
import { gsap } from "gsap";

(function () {
  "use strict";

  var root = document.querySelector("[data-navbar]");
  if (!root) return;

  var BREAKPOINT = "(min-width: 1101px)";
  var desktop = window.matchMedia(BREAKPOINT);
  var canHover = window.matchMedia("(hover: hover)");
  var STORAGE_KEY = "algoshack:announcement-closed";

  var announcement = root.querySelector("[data-navbar-announcement]");
  var announcementClose = root.querySelector("[data-navbar-announcement-close]");
  var menu = root.querySelector("[data-navbar-menu]");
  var burger = root.querySelector("[data-navbar-burger]");
  var items = Array.prototype.slice.call(root.querySelectorAll("[data-navbar-dropdown]"));
  var lastScrollY = window.scrollY;

  /* ---------- helpers ---------- */
  function toggleOf(item) { return item.querySelector(".navbar_dropdown-toggle"); }

  function setOpen(item, open) {
    item.classList.toggle("is-open", open);
    toggleOf(item).setAttribute("aria-expanded", String(open));
  }

  function closeAll(except) {
    items.forEach(function (item) { if (item !== except) setOpen(item, false); });
  }

  /* ---------- announcement bar ---------- */
  function syncAnnouncementHeight() {
    var h = announcement && !announcement.hidden ? announcement.offsetHeight : 0;
    root.style.setProperty("--navbar-announcement-h", h + "px");
  }

  function updateAnnouncementVisibility() {
    var currentScrollY = window.scrollY;
    var scrollingDown = currentScrollY > lastScrollY;

    if (announcement && !announcement.hidden) {
      root.classList.toggle("is-announcement-hidden", scrollingDown && currentScrollY > 24);
    } else {
      root.classList.remove("is-announcement-hidden");
    }

    lastScrollY = currentScrollY;
  }

  if (announcement) {
    try {
      if (window.sessionStorage.getItem(STORAGE_KEY) === "1") announcement.hidden = true;
    } catch (e) { /* storage blocked – ignore */ }

    if (announcementClose) {
      announcementClose.addEventListener("click", function () {
        announcement.hidden = true;
        root.classList.remove("is-announcement-hidden");
        try { window.sessionStorage.setItem(STORAGE_KEY, "1"); } catch (e) { /* ignore */ }
        syncAnnouncementHeight();
      });
    }

    if ("ResizeObserver" in window) {
      new ResizeObserver(syncAnnouncementHeight).observe(announcement);
    }
    window.addEventListener("resize", syncAnnouncementHeight);
  }
  syncAnnouncementHeight();
  updateAnnouncementVisibility();
  window.addEventListener("scroll", updateAnnouncementVisibility, { passive: true });

  /* ---------- mobile menu (GSAP) ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var burgerLines = burger ? Array.prototype.slice.call(burger.querySelectorAll(".navbar_burger-line")) : [];
  var menuTween = null;
  var burgerTween = null;

  function menuParts() {
    return {
      items: Array.prototype.slice.call(menu.querySelectorAll(".navbar_menu-list > .navbar_item")),
      actions: Array.prototype.slice.call(menu.querySelectorAll(".navbar_actions > *"))
    };
  }

  var BASE_WIDTHS = [20, 13, 17];
  var idleTween = null;

  // Closed state: the three lines gently breathe in a staggered wave
  function startIdle() {
    if (idleTween) idleTween.kill();
    if (reduceMotion || !burgerLines.length) return;
    idleTween = gsap.timeline({ repeat: -1, yoyo: true, defaults: { duration: 1.1, ease: "sine.inOut" } })
      .to(burgerLines[0], { width: 13 }, 0)
      .to(burgerLines[1], { width: 20 }, 0.18)
      .to(burgerLines[2], { width: 10 }, 0.36);
  }

  function stopIdle() {
    if (idleTween) idleTween.kill();
    idleTween = null;
  }

  function animateBurger(open) {
    if (!burgerLines.length) return;
    if (burgerTween) burgerTween.kill();
    stopIdle();
    if (reduceMotion) {
      gsap.set(burgerLines[0], { y: open ? 0 : -6, rotation: open ? 45 : 0, width: 20 });
      gsap.set(burgerLines[1], { scaleX: open ? 0 : 1, autoAlpha: open ? 0 : 1, width: BASE_WIDTHS[1] });
      gsap.set(burgerLines[2], { y: open ? 0 : 6, rotation: open ? -45 : 0, width: open ? 20 : BASE_WIDTHS[2] });
      return;
    }
    burgerTween = gsap.timeline({
      defaults: { duration: 0.8, ease: "power3.inOut" },
      onComplete: function () { if (!open) startIdle(); }
    })
      .to(burgerLines[0], { y: open ? 0 : -6, rotation: open ? 45 : 0, width: open ? 20 : BASE_WIDTHS[0] }, 0)
      .to(burgerLines[1], { scaleX: open ? 0 : 1, autoAlpha: open ? 0 : 1, width: BASE_WIDTHS[1], duration: 0.45, ease: "power2.out" }, 0)
      .to(burgerLines[2], { y: open ? 0 : 6, rotation: open ? -45 : 0, width: open ? 20 : BASE_WIDTHS[2] }, 0)
      .to(burger, { rotation: open ? 180 : 0, duration: 0.9, ease: "power3.inOut" }, 0);
  }

  startIdle();

  function animatePanel(open) {
    if (menuTween) menuTween.kill();
    var parts = menuParts();
    var targets = parts.items.concat(parts.actions);

    if (reduceMotion) {
      menu.classList.toggle("is-open", open);
      return;
    }

    if (open) {
      menu.classList.add("is-open");
      menuTween = gsap.timeline({ defaults: { ease: "power3.out" } })
        .fromTo(menu, { clipPath: "inset(0% 0% 100% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power3.inOut", clearProps: "clipPath" }, 0)
        .fromTo(targets, { y: 18, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.09, clearProps: "transform,opacity,visibility" }, 0.3);
    } else {
      menuTween = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        onComplete: function () {
          menu.classList.remove("is-open");
          gsap.set([menu].concat(targets), { clearProps: "all" });
        }
      })
        .to(targets.slice().reverse(), { y: -10, autoAlpha: 0, duration: 0.35, stagger: 0.03 }, 0)
        .to(menu, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.7 }, 0.2);
    }
  }

  function setMenuOpen(open, immediate) {
    if (!menu || !burger) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.style.overflow = open ? "hidden" : "";

    if (immediate) {
      if (menuTween) menuTween.kill();
      if (burgerTween) burgerTween.kill();
      stopIdle();
      menu.classList.toggle("is-open", open);
      var parts = menuParts();
      gsap.set([menu, burger].concat(burgerLines, parts.items, parts.actions), { clearProps: "all" });
      if (!open) startIdle();
      return;
    }

    animateBurger(open);
    animatePanel(open);
  }

  if (burger) {
    burger.addEventListener("click", function () {
      setMenuOpen(burger.getAttribute("aria-expanded") !== "true");
    });
  }

  /* ---------- dropdowns ---------- */
  items.forEach(function (item) {
    var toggle = toggleOf(item);
    var openTimer, closeTimer;

    // Desktop hover (mouse j)
    item.addEventListener("pointerenter", function (e) {
      if (!desktop.matches || e.pointerType !== "mouse") return;
      clearTimeout(closeTimer);
      openTimer = setTimeout(function () { closeAll(item); setOpen(item, true); }, 60);
    });
    item.addEventListener("pointerleave", function (e) {
      if (!desktop.matches || e.pointerType !== "mouse") return;
      clearTimeout(openTimer);
      closeTimer = setTimeout(function () { setOpen(item, false); }, 140);
    });

    // Click / Enter / Space
    toggle.addEventListener("click", function (e) {
      var isOpen = item.classList.contains("is-open");
      var keyboard = e.detail === 0;

      if (desktop.matches && canHover.matches && !keyboard) {
        // mouse: hover thi khuli gayu hoy to khuleli j rakho
        closeAll(item);
        setOpen(item, true);
        return;
      }
      closeAll(item);
      setOpen(item, !isOpen);
    });

    // focus bahar jay to desktop par band
    item.addEventListener("focusout", function (e) {
      if (!desktop.matches) return;
      if (!item.contains(e.relatedTarget)) setOpen(item, false);
    });
  });

  // Esc
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var open = items.filter(function (i) { return i.classList.contains("is-open"); })[0];
    if (open) {
      setOpen(open, false);
      if (desktop.matches) toggleOf(open).focus();
    }
    if (menu && menu.classList.contains("is-open")) {
      setMenuOpen(false);
      if (burger) burger.focus();
    }
  });

  // bahar click
  document.addEventListener("pointerdown", function (e) {
    if (!root.contains(e.target)) {
      closeAll();
      if (desktop.matches) return;
      setMenuOpen(false);
    }
  });

  // breakpoint badlay tyare reset
  var onBreakpoint = function () { closeAll(); setMenuOpen(false, true); };
  if (desktop.addEventListener) desktop.addEventListener("change", onBreakpoint);
  else desktop.addListener(onBreakpoint);

  /* ---------- tabs (categories -> panes) ---------- */
  Array.prototype.forEach.call(root.querySelectorAll("[data-mega]"), function (mega) {
    var tabs = Array.prototype.slice.call(mega.querySelectorAll('[role="tab"]'));
    var panes = Array.prototype.slice.call(mega.querySelectorAll("[data-pane]"));
    if (!tabs.length) return;

    function activate(tab) {
      var key = tab.getAttribute("data-tab");
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      panes.forEach(function (p) {
        var on = p.getAttribute("data-pane") === key;
        p.classList.toggle("is-active", on);
        p.hidden = !on;
      });
    }

    tabs.forEach(function (tab, i) {
      tab.tabIndex = tab.classList.contains("is-active") ? 0 : -1;
      tab.addEventListener("click", function () { activate(tab); });
      tab.addEventListener("focus", function () { activate(tab); });
      tab.addEventListener("pointerenter", function (e) {
        if (e.pointerType === "mouse" && desktop.matches) activate(tab);
      });
      tab.addEventListener("keydown", function (e) {
        var next = null;
        if (e.key === "ArrowDown") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowUp") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); next.focus(); }
      });
    });
  });
})();
