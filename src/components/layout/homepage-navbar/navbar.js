/* AlgoShack – Navbar behaviour
   - announcement bar close (session ma yaad rakhe)
   - desktop mega menu: hover + click + keyboard (Esc / Tab)
   - mega menu tabs (categories -> panes)
   - mobile menu (hamburger) + accordion
*/
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

  /* ---------- mobile menu ---------- */
  function setMenuOpen(open) {
    if (!menu || !burger) return;
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.documentElement.style.overflow = open ? "hidden" : "";
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
  var onBreakpoint = function () { closeAll(); setMenuOpen(false); };
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
