/* ============================================================
   MUKUL ENTERPRISES – app.js
   ============================================================ */

"use strict";

/* ─── Navbar: sticky shadow + mobile menu ─────────────────── */
const navbar    = document.getElementById("navbar");
const hamburger = document.getElementById("hamburger");
const navLinks  = document.getElementById("navLinks");

window.addEventListener("scroll", () => {
  if (window.scrollY > 60) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }

  // Back-to-top button visibility
  const btn = document.getElementById("backToTop");
  if (window.scrollY > 400) {
    btn.classList.add("visible");
  } else {
    btn.classList.remove("visible");
  }
});

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  navLinks.classList.toggle("open");
  document.body.style.overflow = navLinks.classList.contains("open") ? "hidden" : "";
});

// Close mobile menu on link click
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navLinks.classList.remove("open");
    document.body.style.overflow = "";
  });
});

/* ─── Back to top ──────────────────────────────────────────── */
document.getElementById("backToTop").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ─── Smooth scroll for all anchor links ──────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight + 8;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  });
});

/* ─── Animated Counter (hero stats) ───────────────────────── */
function animateCounter(el, target, duration = 1800) {
  let start     = 0;
  const step    = target / (duration / 16);
  const timer   = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(start).toLocaleString("en-IN");
  }, 16);
}

// Trigger counters once the hero section is visible
const heroSection = document.querySelector(".hero");
let countersStarted = false;

const heroObserver = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && !countersStarted) {
      countersStarted = true;
      document.querySelectorAll(".hero__stat-num").forEach((el) => {
        const target = parseInt(el.dataset.target, 10);
        animateCounter(el, target);
      });
    }
  },
  { threshold: 0.4 }
);

heroObserver.observe(heroSection);

/* ─── Scroll-reveal (fade-in) ─────────────────────────────── */
const fadeTargets = [
  ".product-card",
  ".why-card",
  ".brand-card",
  ".testimonial-card",
  ".highlight",
  ".contact__item",
  ".about__content",
  ".about__visual",
  ".section__header",
];

// Add fade-in class to all targets
fadeTargets.forEach((selector) => {
  document.querySelectorAll(selector).forEach((el) => {
    el.classList.add("fade-in");
  });
});

const fadeObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        fadeObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".fade-in").forEach((el) => {
  fadeObserver.observe(el);
});

/* ─── Product Filter ──────────────────────────────────────── */
const filterTabs   = document.querySelectorAll(".filter-tab");
const productCards = document.querySelectorAll(".product-card[data-category]");

filterTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    // Update active tab
    filterTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const filter = tab.dataset.filter;

    productCards.forEach((card) => {
      const cats = card.dataset.category.split(" ");

      if (filter === "all" || cats.includes(filter)) {
        card.classList.remove("hidden");
        // Re-trigger animation
        card.classList.remove("visible");
        void card.offsetWidth; // force reflow
        card.classList.add("visible");
      } else {
        card.classList.add("hidden");
      }
    });
  });
});

/* ─── Contact Form Validation ─────────────────────────────── */
const form         = document.getElementById("contactForm");
const formSuccess  = document.getElementById("formSuccess");

// localized validation messages
const errorTexts = {
  name: {
    en: "Please enter your full name.",
    hi: "कृपया अपना पूरा नाम दर्ज करें।"
  },
  phone: {
    en: "Please enter a valid 10-digit mobile number.",
    hi: "कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।"
  },
  message: {
    en: "Please describe your requirement (min. 10 characters).",
    hi: "कृपया अपनी आवश्यकता का वर्णन करें (न्यूनतम 10 वर्ण)।"
  }
};

function showError(inputId, errorId, key) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.add("error");
  const msgObj = errorTexts[key] || {};
  error.textContent = msgObj[currentLang] || msgObj.en || "";
  return false;
}

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  input.classList.remove("error");
  error.textContent = "";
}

form.querySelectorAll("input, textarea, select").forEach((el) => {
  el.addEventListener("input", () => {
    el.classList.remove("error");
    const errorEl = document.getElementById(el.id + "Error");
    if (errorEl) errorEl.textContent = "";
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let valid = true;

  const name    = document.getElementById("name").value.trim();
  const phone   = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();

  clearError("name",    "nameError");
  clearError("phone",   "phoneError");
  clearError("message", "messageError");

  if (!name || name.length < 2) {
    showError("name", "nameError", "name");
    valid = false;
  }

  if (!phone || !/^[6-9]\d{9}$/.test(phone.replace(/[\s\-+]/g, "").replace(/^91/, ""))) {
    showError("phone", "phoneError", "phone");
    valid = false;
  }

  if (!message || message.length < 10) {
    showError("message", "messageError", "message");
    valid = false;
  }

  if (!valid) return;

  // Simulate submission
  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending...';

  setTimeout(() => {
    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Enquiry';
    formSuccess.style.display = "flex";

    setTimeout(() => {
      formSuccess.style.display = "none";
    }, 6000);
  }, 1400);
});

/* ─── Active nav link highlight on scroll ─────────────────── */
const sections   = document.querySelectorAll("section[id]");
const navAnchors = document.querySelectorAll(".nav__links a[href^='#']");

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navAnchors.forEach((a) => a.classList.remove("active-link"));
        const active = document.querySelector(
          `.nav__links a[href="#${entry.target.id}"]`
        );
        if (active) active.classList.add("active-link");
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((section) => sectionObserver.observe(section));

// Add active-link style
const style = document.createElement("style");
style.textContent = `
  .nav__links a.active-link {
    color: var(--primary) !important;
    background: #fff3ed;
  }
`;
document.head.appendChild(style);

/* ─── Language switcher ───────────────────────────────────── */
// search for any language toggle buttons (topbar, nav, etc.)
const langToggles = document.querySelectorAll(".lang-btn");
let currentLang = localStorage.getItem("lang") || "en";

function updateLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  // update every toggle button's label
  langToggles.forEach((btn) => {
    if (lang === "hi") {
      btn.textContent = "EN";
      btn.classList.add("active");
      btn.setAttribute("aria-label", "Switch to English");
    } else {
      btn.textContent = "हिंदी";
      btn.classList.remove("active");
      btn.setAttribute("aria-label", "हिंदी में बदलें");
    }
  });

  document.documentElement.lang = lang === "hi" ? "hi" : "en";

  // translate text nodes (plain strings only)
  document.querySelectorAll("[data-en]").forEach((el) => {
    const key = lang === "hi" ? "data-hi" : "data-en";
    const val = el.getAttribute(key);
    if (val != null) el.innerHTML = val;
  });
  document.querySelectorAll("[data-en-placeholder]").forEach((el) => {
    const key = lang === "hi" ? "data-hi-placeholder" : "data-en-placeholder";
    const val = el.getAttribute(key);
    if (val != null) el.placeholder = val;
  });
  document.querySelectorAll("[data-en-alt]").forEach((el) => {
    const key = lang === "hi" ? "data-hi-alt" : "data-en-alt";
    const val = el.getAttribute(key);
    if (val != null) el.alt = val;
  });
}

// hook up click listeners on all toggles
langToggles.forEach((btn) => {
  btn.addEventListener("click", () => {
    updateLanguage(currentLang === "en" ? "hi" : "en");
  });
});

// apply initial language settings
updateLanguage(currentLang);
