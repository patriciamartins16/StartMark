const WHATSAPP_NUMBER = "351963781997";
const WHATSAPP_MESSAGE =
  "Ola StartMark, vi o vosso site e gostaria de falar sobre um projeto digital.";

function buildWhatsAppUrl() {
  const encodedMessage = encodeURIComponent(WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
}

function hydrateWhatsAppLinks() {
  const url = buildWhatsAppUrl();
  document.querySelectorAll("[data-wa-link]").forEach((link) => {
    link.setAttribute("href", url);
  });
}

function hydrateYear() {
  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
}

function setupHeaderState() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  let isScrolled = false;
  let ticking = false;

  const applyState = () => {
    const scrollTop = window.scrollY;

    // Use hysteresis so the sticky header does not flicker near the top.
    if (!isScrolled && scrollTop > 44) {
      isScrolled = true;
      header.classList.add("is-scrolled");
    } else if (isScrolled && scrollTop < 10) {
      isScrolled = false;
      header.classList.remove("is-scrolled");
    }

    ticking = false;
  };

  const update = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(applyState);
  };

  applyState();
  window.addEventListener("scroll", update, { passive: true });
}

function setupMobileNav() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector(".site-nav");
  const cta = document.querySelector(".header-cta");

  if (!header || !toggle || !nav) return;

  const mobileQuery = window.matchMedia("(max-width: 900px)");

  const closeMenu = () => {
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  };

  const openMenu = () => {
    header.classList.add("menu-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Fechar menu");
  };

  const syncMenu = () => {
    if (!mobileQuery.matches) {
      closeMenu();
    }
  };

  toggle.addEventListener("click", () => {
    if (!mobileQuery.matches) return;

    if (header.classList.contains("menu-open")) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  cta?.addEventListener("click", closeMenu);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", syncMenu);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(syncMenu);
  }

  syncMenu();
}

function setupTiltCards() {
  const supportsTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (!supportsTilt) return;

  const cards = document.querySelectorAll("[data-tilt]");
  if (!cards.length) return;

  cards.forEach((card) => {
    let rect = null;

    const reset = () => {
      if (window.gsap) {
        window.gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          x: 0,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
        });
      } else {
        card.style.transform = "";
      }
    };

    card.addEventListener("pointermove", (event) => {
      rect = rect || card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      const rotateY = px * 8;
      const rotateX = py * -8;
      const x = px * 6;
      const y = py * 6;

      if (window.gsap) {
        window.gsap.to(card, {
          rotateX,
          rotateY,
          x,
          y,
          duration: 0.28,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      } else {
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${x}px, ${y}px)`;
      }
    });

    card.addEventListener("pointerenter", () => {
      rect = card.getBoundingClientRect();
    });

    card.addEventListener("pointerleave", reset);
    card.addEventListener("pointercancel", reset);
  });
}

function setupHeroImageFx() {
  const visual = document.querySelector("[data-hero-visual]");
  const frame = visual?.querySelector(".hero-panel__visual-frame");
  const supportsTilt = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (!visual || !frame || !supportsTilt) return;

  let rect = null;
  let rafId = 0;
  let nextState = null;

  const applyState = () => {
    if (!nextState) {
      rafId = 0;
      return;
    }

    frame.style.setProperty("--hero-rx", `${nextState.rx}deg`);
    frame.style.setProperty("--hero-ry", `${nextState.ry}deg`);
    frame.style.setProperty("--hero-tilt-shift-x", `${nextState.tx}px`);
    frame.style.setProperty("--hero-tilt-shift-y", `${nextState.ty}px`);
    visual.style.setProperty("--hero-glow-x", `${nextState.gx}%`);
    visual.style.setProperty("--hero-glow-y", `${nextState.gy}%`);

    rafId = 0;
  };

  const queueState = (state) => {
    nextState = state;
    if (rafId) return;
    rafId = window.requestAnimationFrame(applyState);
  };

  const reset = () => {
    visual.classList.remove("is-active");
    queueState({ rx: 0, ry: 0, tx: 0, ty: 0, gx: 50, gy: 38 });
  };

  visual.addEventListener("pointerenter", () => {
    rect = visual.getBoundingClientRect();
    visual.classList.add("is-active");
  });

  visual.addEventListener("pointermove", (event) => {
    rect = rect || visual.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;

    queueState({
      rx: +(py * -4.2).toFixed(2),
      ry: +(px * 5.2).toFixed(2),
      tx: +(px * 5).toFixed(2),
      ty: +(py * 5).toFixed(2),
      gx: +(50 + px * 18).toFixed(2),
      gy: +(38 + py * 18).toFixed(2),
    });
  });

  visual.addEventListener("pointerleave", reset);
  visual.addEventListener("pointercancel", reset);
}

function setupAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);

  gsap.set("[data-reveal]", { opacity: 0, y: 34 });

  const heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
  heroTimeline
    .from(".site-header", {
      opacity: 0,
      y: -24,
      duration: 0.75,
    })
    .to(
      ".hero [data-reveal]",
      {
        opacity: 1,
        y: 0,
        duration: 0.95,
        stagger: 0.12,
      },
      "-=0.3"
    )
    .from(
      ".hero__tags li",
      {
        opacity: 0,
        y: 20,
        stagger: 0.08,
        duration: 0.6,
      },
      "-=0.45"
    );

  gsap.utils.toArray("section:not(.hero) [data-reveal]").forEach((element) => {
    gsap.to(element, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 82%",
      },
    });
  });

  if (window.matchMedia("(min-width: 901px)").matches) {
    gsap.to(".portrait-card", {
      yPercent: -3,
      duration: 4.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(".sm-card", {
      yPercent: 3,
      duration: 4.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  gsap
    .utils
    .toArray(".stack-card img")
    .forEach((image) => {
      gsap.to(image, {
        scale: 1.08,
        ease: "none",
        scrollTrigger: {
          trigger: image,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
}

document.addEventListener("DOMContentLoaded", () => {
  hydrateWhatsAppLinks();
  hydrateYear();
  setupHeaderState();
  setupMobileNav();
  setupTiltCards();
  setupHeroImageFx();
  setupAnimations();
});
