/* ═══════════════════════════════════════════════════════════════
   PORTFOLIO — main.js
   ───────────────────────────────────────────────────────────────
   Responsibilities:
     1. EmailJS init + dual-send (notify YOU + auto-reply to visitor)
     2. Mobile nav hamburger toggle + X animation
     3. Scroll-triggered fade-in animations (IntersectionObserver)
     4. Active nav link highlighting as user scrolls
     5. Dark/light theme toggle (persisted in localStorage)          [Level 3]
     6. Project filter pills (filters .project-card by data-category) [Level 3]
     7. Custom cursor label that follows the mouse over project cards [Level 3]
     8. Command palette (Cmd/Ctrl+K quick navigation)                [Level 4]
     9. Case study modal (per-project Problem/Process/Result)        [Level 4]
    10. Live GitHub stats (public REST API, no auth token)           [Level 4]
    11. Hero mouse-parallax                                          [Level 4]
   ───────────────────────────────────────────────────────────────
   Dependencies:
     • EmailJS Browser SDK v4 — loaded in index.html <head>
       https://www.emailjs.com/docs/sdk/installation/
   ═══════════════════════════════════════════════════════════════ */


/* ───────────────────────────────────────────────────────────────
   EMAILJS CONFIGURATION
   ───────────────────────────────────────────────────────────────
   How to set up (one-time, takes ~5 minutes):

   STEP 1 — Get your Public Key:
     emailjs.com → Account → API Keys → copy "Public Key"

   STEP 2 — Create an Email Service:
     emailjs.com → Email Services → Add New Service → connect Gmail/Outlook
     Copy the Service ID (looks like: service_xxxxxxx)

   STEP 3 — Create Template 1 "Notification" (sent TO YOU when someone fills form):
     emailjs.com → Email Templates → Create New
     To email:  your own email address
     Reply To:  {{reply_to}}      ← lets you hit Reply directly to the visitor
     Subject:   New message from {{from_name}}: {{subject}}
     Body:      Use {{from_name}}, {{reply_to}}, {{subject}}, {{message}}
     Save → copy Template ID

   STEP 4 — Create Template 2 "Auto-reply" (sent TO THE VISITOR automatically):
     emailjs.com → Email Templates → Create New
     To email:  {{reply_to}}      ← THIS is what sends it to the visitor's inbox
     From name: Your Name
     Subject:   Thank you for reaching out, {{from_name}} 👋
     Body:      Paste the HTML from autoreply-template.html
     Save → copy Template ID

   STEP 5 — Fill in the four constants below.

   ⚠️  TYPO CHECK: Template IDs start with "template_" (no extra/missing letters).
       Double-check yours before deploying. Example: 'template_abc123'
   ─────────────────────────────────────────────────────────────── */
const EMAILJS_PUBLIC_KEY      = 'cqJpoADP-jLCMbNar';       // Account → API Keys
const EMAILJS_SERVICE_ID      = 'service_14ae3x5';       // Email Services → your service
const EMAILJS_NOTIFY_TEMPLATE = 'template_5ezztvb';  // Template 1 → sends to YOU
const EMAILJS_REPLY_TEMPLATE  = 'template_gz347wb';   // Template 2 → sends to VISITOR

// Used by both initGithubStats() and applyThemedMedia() below —
// pulled up to module scope so there's exactly one place to change it.
const GITHUB_USERNAME = 'comsolodev-1';


/* ───────────────────────────────────────────────────────────────
   INIT — Entry point
   ───────────────────────────────────────────────────────────────
   DOMContentLoaded fires when the HTML is fully parsed but before
   images/fonts finish loading — perfect for attaching event listeners.
   We initialize EmailJS here so it's ready before the form is submitted.
   ─────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  // Initialize EmailJS with our public key.s
  // Must be called once before any emailjs.send() calls.
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  // Boot all features
  initNav();
  initScrollAnimations();
  initActiveNavLinks();
  initContactForm();
  initThemeToggle();
  initProjectFilters();
  initCustomCursor();
  initCommandPalette();
  initExperienceToggles();
  initCaseStudyModal();
  initGithubStats();
  initHeroParallax();
  initResumeDownload();
  initTestimonialsCarousel();
  initAchievementsReveal();
  initVisitorCounter();

});


/* ───────────────────────────────────────────────────────────────
   MOBILE NAV TOGGLE
   ───────────────────────────────────────────────────────────────
   On screens ≤ 768px (CSS breakpoint), the nav links are hidden
   and a hamburger button is shown instead. Clicking the hamburger:
     • Toggles the .open class on the <ul> (CSS shows/hides it)
     • Updates aria-expanded for screen reader announcements
     • Animates the 3 bars → X using inline transforms

   Clicking any nav link also closes the menu (good UX on mobile
   since single-page scrolling doesn't trigger a page reload).
   ─────────────────────────────────────────────────────────────── */
function initNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  // Guard: if elements don't exist (e.g. template partial), exit silently
  if (!hamburger || !navLinks) return;

  /* ── Hamburger click: open/close ── */
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');

    // Sync aria-expanded so screen readers announce "expanded" / "collapsed"
    hamburger.setAttribute('aria-expanded', String(isOpen));

    // Animate bars to X shape (or back to 3 bars)
    const bars = hamburger.querySelectorAll('span');
    if (isOpen) {
      // Top bar    → rotates 45° downward
      bars[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      // Middle bar → fades out (hidden in the X)
      bars[1].style.opacity   = '0';
      // Bottom bar → rotates -45° upward
      bars[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      // Reset all bars back to default state
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    }
  });

  /* ── Close menu when any nav link is clicked ── */
  // Needed because smooth-scroll doesn't reload the page, so the menu
  // would stay open after tapping a link without this handler.
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');

      // Reset hamburger bars back to 3-line state
      const bars = hamburger.querySelectorAll('span');
      bars[0].style.transform = '';
      bars[1].style.opacity   = '';
      bars[2].style.transform = '';
    });
  });
}


/* ───────────────────────────────────────────────────────────────
   SCROLL FADE-IN ANIMATIONS
   ───────────────────────────────────────────────────────────────
   Uses the IntersectionObserver API — a performant native browser
   API that fires a callback when an element enters/exits the viewport.
   Much better than scroll event listeners (no main-thread blocking).

   How it works:
     • Elements with class .fade-in start invisible (opacity:0, translateY)
       defined in style.css
     • When 10% of the element enters the viewport, we add .visible
       which CSS transitions to opacity:1 + translateY(0)
     • observer.unobserve() stops watching the element after it animates —
       no point tracking it further once it's visible

   threshold: 0.1 means "trigger when 10% of the element is visible"
   ─────────────────────────────────────────────────────────────── */
function initScrollAnimations() {
  const targets = document.querySelectorAll('.fade-in');

  // Exit early if no animated elements exist on the page
  if (!targets.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add .visible → triggers the CSS transition
          entry.target.classList.add('visible');
          // Stop observing — element is visible and won't need to animate again
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 } // Fire when 10% of the element is in viewport
  );

  // Attach observer to every .fade-in element
  targets.forEach(el => observer.observe(el));
}


/* ───────────────────────────────────────────────────────────────
   ACTIVE NAV LINK HIGHLIGHTING
   ───────────────────────────────────────────────────────────────
   As the user scrolls, the corresponding nav link for the section
   currently in view gets the .active CSS class (which makes it darker).

   How it works:
     • On every scroll event, we check scrollY + 100px offset against
       each section's offsetTop and offsetTop + offsetHeight range.
     • The 100px offset accounts for the fixed nav height (64px) plus
       a small buffer so the link activates slightly before the section
       reaches the very top of the viewport — feels more natural.
     • { passive: true } tells the browser this listener will never call
       preventDefault(), allowing scroll performance optimizations.
   ─────────────────────────────────────────────────────────────── */
function initActiveNavLinks() {
  // All sections that have an id (hero, skills, experience, projects, contact)
  const sections   = document.querySelectorAll('section[id]');
  // All nav links that point to page anchors (href="#...")
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const setActive = () => {
    // Add 100px offset: nav height (64px) + small buffer (36px)
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      // Find the matching nav link for this section by its id
      const link = document.querySelector(`.nav-links a[href="#${section.id}"]`);
      if (!link) return; // No nav link for this section (e.g. #hero has no nav item)

      // Check if current scroll position is within this section's vertical range
      const isInView = scrollPos >= section.offsetTop &&
                       scrollPos <  section.offsetTop + section.offsetHeight;

      if (isInView) {
        // Remove .active from all links first, then add to current
        navAnchors.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  };

  // Listen to scroll — passive for performance (no preventDefault needed)
  window.addEventListener('scroll', setActive, { passive: true });

  // Run once on page load to set the correct active link immediately
  setActive();
}


/* ───────────────────────────────────────────────────────────────
   EMAILJS CONTACT FORM
   ───────────────────────────────────────────────────────────────
   On valid submit, fires TWO emails in parallel using Promise.all():

     Email 1 — NOTIFY_TEMPLATE → to YOU
       Purpose: you receive the visitor's message in your inbox
       "Reply To" is set to the visitor's email in the template,
       so hitting Reply automatically addresses the visitor.

     Email 2 — REPLY_TEMPLATE → to THE VISITOR
       Purpose: visitor gets an instant confirmation with your
       response timeline, contact alternatives, and a recap
       of what they sent. See autoreply-template.html.

   Promise.all() sends both simultaneously — visitor waits for
   only one round-trip of latency, not two sequential ones.

   Error handling:
     • If EITHER email fails, the whole Promise.all rejects and
       the user sees an error message. Both succeed or we report failure.

   UX states managed:
     • setLoading(true)  → disables button + changes text to "Sending…"
     • showStatus(type)  → shows success (green) or error (red) pill
     • clearStatus()     → hides the status pill
     • form.reset()      → clears all fields after success
   ─────────────────────────────────────────────────────────────── */
function initContactForm() {
  // Cache all form-related DOM references
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const btnText    = document.getElementById('btnText');
  const btnIcon    = document.getElementById('btnIcon');
  const formStatus = document.getElementById('formStatus');

  // Exit if form not found (defensive: in case HTML changes)
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    // Prevent default browser form submission (would reload the page)
    e.preventDefault();

    // Extract and trim all field values
    const name    = form.from_name.value.trim();
    const email   = form.reply_to.value.trim();
    const subject = form.subject.value.trim();
    const message = form.message.value.trim();

    /* ── Client-side validation ── */
    // Check for empty fields first
    if (!name || !email || !subject || !message) {
      showStatus('error', 'Please fill in all fields.');
      return; // Stop here — don't attempt to send
    }

    // Validate email format with regex
    if (!isValidEmail(email)) {
      showStatus('error', 'Please enter a valid email address.');
      return;
    }

    /* ── Start loading state ── */
    setLoading(true);
    clearStatus(); // Clear any previous status message

    // Build the data object that maps to EmailJS template variables:
    //   {{from_name}} → visitor's name
    //   {{reply_to}}  → visitor's email (used as "To" in auto-reply template)
    //   {{subject}}   → form subject field
    //   {{message}}   → form message field
    const templateParams = {
      from_name: name,
      reply_to:  email,
      subject:   subject,
      message:   message,
    };

    try {
      // Fire both emails at the same time — parallel, not sequential
      await Promise.all([
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_NOTIFY_TEMPLATE, templateParams), // → you
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_REPLY_TEMPLATE,  templateParams), // → visitor
      ]);

      // Both succeeded
      showStatus('success', "Message sent! Check your inbox for a confirmation.");
      form.reset(); // Clear the form fields

    } catch (err) {
      // Log to console for debugging; show user-friendly message on page
      console.error('EmailJS send error:', err);
      showStatus('error', 'Something went wrong. Try reaching me directly.');

    } finally {
      // Always restore the button, whether success or failure
      setLoading(false);
    }
  });


  /* ── Helper: toggle button loading state ── */
  function setLoading(isLoading) {
    submitBtn.disabled    = isLoading;                               // Prevents double-submit
    btnText.textContent   = isLoading ? 'Sending…' : 'Send message'; // Updates button label
    btnIcon.style.opacity = isLoading ? '0.3' : '1';                 // Dims icon while sending
  }

  /* ── Helper: show a status pill below the button ── */
  // type: 'success' | 'error' — matches CSS class names
  function showStatus(type, msg) {
    formStatus.className     = `form-status ${type}`; // CSS handles color via .success / .error
    formStatus.textContent   = msg;
    formStatus.style.display = 'inline-block';        // Make visible (default is display:none)
  }

  /* ── Helper: hide the status pill ── */
  function clearStatus() {
    formStatus.style.display = 'none';
    formStatus.textContent   = '';
    formStatus.className     = 'form-status'; // Strip success/error modifier class
  }
}


/* ───────────────────────────────────────────────────────────────
   UTILITIES
   ─────────────────────────────────────────────────────────────── */

/**
 * isValidEmail — basic email format check
 * Regex breakdown:
 *   ^[^\s@]+   → one or more chars that aren't whitespace or @
 *   @          → literal @ symbol
 *   [^\s@]+    → domain name part
 *   \.         → literal dot
 *   [^\s@]+$   → TLD (com, net, org, etc.)
 *
 * This isn't RFC-5321 compliant but covers 99.9% of real-world addresses.
 * Full server-side validation happens in EmailJS / your email provider.
 *
 * @param  {string} email — the raw value from the email input
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 3 — DARK / LIGHT THEME TOGGLE
   ───────────────────────────────────────────────────────────────
   Sets a [data-theme="dark" | "light"] attribute on <html>, which
   every dark-mode override in style.css hooks into (see the
   [data-theme="dark"] block near the top of the file).

   Priority for the initial theme, first match wins:
     1. A previously saved choice in localStorage ('portfolio-theme')
     2. The visitor's OS-level preference (prefers-color-scheme)
     3. Falls back to light

   We only ever write to localStorage when the visitor actually
   clicks the toggle — if we never touch it, the site keeps following
   their OS preference even if they change it later (e.g. system
   switches to dark mode at sunset).
   ═══════════════════════════════════════════════════════════════ */
function initThemeToggle() {
  const toggle     = document.getElementById('themeToggle');
  const root       = document.documentElement;
  const STORAGE_KEY = 'portfolio-theme';

  if (!toggle) return;

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved        = localStorage.getItem(STORAGE_KEY); // 'dark' | 'light' | null

  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  toggle.addEventListener('click', () => {
    const isDark = root.getAttribute('data-theme') === 'dark';
    const next   = isDark ? 'light' : 'dark';
    applyTheme(next);
    // Only persist once the visitor has made an explicit choice
    localStorage.setItem(STORAGE_KEY, next);
  });

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme'); // absence of the attribute = light (default CSS)
    }
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    // The skillicons.dev logo rows are plain <img> tags pointed at a
    // theme-aware URL, so they need an explicit re-sync on toggle.
    // The contribution grid, by contrast, is now custom-built with plain
    // CSS classes (see .contrib-cell.lvl-* in style.css) that already
    // respond to [data-theme] automatically — nothing to sync here.
    syncSkillIcons();
  }
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 3 — PROJECT FILTER PILLS
   ───────────────────────────────────────────────────────────────
   Each .filter-pill has a data-filter (e.g. "frontend"). Each
   .project-card has a data-category string containing one or more
   space-separated categories (e.g. "frontend fullstack").

   Clicking a pill:
     • Marks that pill .active or, if it's "all", exact match on
       every card
     • Toggles .is-hidden on any card whose data-category doesn't
       contain the selected filter word
   ═══════════════════════════════════════════════════════════════ */
function initProjectFilters() {
  const pills = document.querySelectorAll('.filter-pill');
  const cards = document.querySelectorAll('.project-card');

  if (!pills.length || !cards.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const filter = pill.dataset.filter; // e.g. 'all', 'frontend', 'backend'…

      // Update active pill styling
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      // Show/hide cards based on whether their data-category matches
      cards.forEach(card => {
        const categories = (card.dataset.category || '').split(' ');
        const matches = filter === 'all' || categories.includes(filter);
        card.classList.toggle('is-hidden', !matches);
      });
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 3 — CUSTOM CURSOR LABEL
   ───────────────────────────────────────────────────────────────
   While the mouse hovers a .project-card, #cursorLabel follows the
   pointer and reads "View project" — replacing the native cursor
   (hidden via `cursor: none` in CSS, scoped to pointer:fine devices
   so touchscreens are completely unaffected — they never attach
   these listeners at all).

   Uses one shared mousemove listener on the card (not per-pixel
   document-wide tracking) to keep this cheap: the label only moves
   while actually over a card, and detaches cleanly on mouseleave.
   ═══════════════════════════════════════════════════════════════ */
function initCustomCursor() {
  const label = document.getElementById('cursorLabel');
  const cards = document.querySelectorAll('.project-card');

  // Guard: skip entirely on touch/coarse-pointer devices (matches the
  // @media (pointer: fine) block in CSS) — no point attaching listeners
  // that a touchscreen visitor would never trigger anyway.
  if (!label || !cards.length) return;
  if (!window.matchMedia('(pointer: fine)').matches) return;

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      label.classList.add('visible');
    });

    card.addEventListener('mousemove', (e) => {
      // Position the label directly at the cursor coordinates.
      // CSS's translate(-50%, -50%) (in .cursor-label) centers it on that point.
      label.style.left = `${e.clientX}px`;
      label.style.top  = `${e.clientY}px`;
    });

    card.addEventListener('mouseleave', () => {
      label.classList.remove('visible');
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 4 — COMMAND PALETTE
   ───────────────────────────────────────────────────────────────
   Opens via the #cmdkTrigger button or Cmd/Ctrl+K from anywhere on
   the page. Filters the .cmdk-item rows against the input using both
   the visible label and each item's data-keywords. Up/Down move the
   .active highlight, Enter activates the highlighted row, Esc (or a
   click on the overlay backdrop) closes it.

   Each item does ONE of two things on activation:
     • data-href set   → smooth-scrolls to that anchor
     • data-filter set → runs a named action (currently just "theme-toggle")
   ═══════════════════════════════════════════════════════════════ */
function initCommandPalette() {
  const trigger  = document.getElementById('cmdkTrigger');
  const overlay  = document.getElementById('cmdkOverlay');
  const input    = document.getElementById('cmdkInput');
  const list     = document.getElementById('cmdkList');
  const empty    = document.getElementById('cmdkEmpty');
  const items    = Array.from(document.querySelectorAll('.cmdk-item'));

  if (!trigger || !overlay || !input || !list) return;

  let activeIndex = 0;

  function visibleItems() {
    return items.filter(item => item.style.display !== 'none');
  }

  function open() {
    overlay.hidden = false;
    input.value = '';
    filterItems('');
    // Focus after the overlay is actually visible, otherwise some
    // browsers ignore the focus() call on a still-hidden element.
    requestAnimationFrame(() => input.focus());
    document.body.style.overflow = 'hidden'; // prevent background scroll while open
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    trigger.focus(); // return focus to the trigger for keyboard users
  }

  function filterItems(query) {
    const q = query.trim().toLowerCase();

    items.forEach(item => {
      const label = item.querySelector('.cmdk-item-label').textContent.toLowerCase();
      const keywords = (item.dataset.keywords || '').toLowerCase();
      const matches = q === '' || label.includes(q) || keywords.includes(q);
      item.style.display = matches ? '' : 'none';
    });

    const visible = visibleItems();
    empty.hidden = visible.length > 0;
    activeIndex = 0;
    highlightActive();
  }

  function highlightActive() {
    const visible = visibleItems();
    items.forEach(item => item.classList.remove('active'));
    if (visible[activeIndex]) {
      visible[activeIndex].classList.add('active');
      visible[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function activate(item) {
    if (!item) return;

    if (item.dataset.href) {
      const href = item.dataset.href;
      // MULTI-PAGE ADDITION (revision): three cases now —
      //   "#anchor"        → smooth-scroll within this page
      //   "index.html..."  → Home isn't a "dedicated page", so this
      //                      still navigates the CURRENT tab there
      //   anything else     → a dedicated page (projects.html,
      //                      experience.html, certifications.html) —
      //                      opens in a NEW TAB with rel=noopener, same
      //                      rule as the .teaser-cta-link buttons, so
      //                      using the palette to jump there never
      //                      loses your place on the current page.
      if (href.startsWith('#')) {
        close();
        // Native smooth scroll — style.css already sets scroll-behavior:
        // smooth on <html>, so a plain hash change is enough here.
        const target = document.querySelector(href);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      } else if (href.startsWith('index.html')) {
        window.location.href = href;
      } else {
        close();
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    } else if (item.dataset.filter === 'theme-toggle') {
      close();
      document.getElementById('themeToggle')?.click();
    }
  }

  // Open triggers
  trigger.addEventListener('click', open);
  document.addEventListener('keydown', (e) => {
    const isK = e.key === 'k' || e.key === 'K';
    if ((e.metaKey || e.ctrlKey) && isK) {
      e.preventDefault();
      overlay.hidden ? open() : close();
    }
  });

  // Close triggers
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close(); // only when clicking the backdrop itself
  });

  // In-palette keyboard nav
  input.addEventListener('keydown', (e) => {
    const visible = visibleItems();

    if (e.key === 'Escape') {
      close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, visible.length - 1);
      highlightActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      highlightActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activate(visible[activeIndex]);
    }
  });

  input.addEventListener('input', () => filterItems(input.value));

  // Mouse click on a row also activates it
  items.forEach(item => {
    item.addEventListener('click', () => activate(item));
    item.addEventListener('mouseenter', () => {
      activeIndex = visibleItems().indexOf(item);
      highlightActive();
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 4.1 — EXPERIENCE "KEY ACHIEVEMENTS" TOGGLES
   ───────────────────────────────────────────────────────────────
   Each .exp-item has a collapsed-by-default achievements list. Unlike
   the case study accordion, this content is static and present at
   page load (not re-injected on open), so it only needs to be wired
   up once here — no re-initialization logic needed.
   ═══════════════════════════════════════════════════════════════ */
function initExperienceToggles() {
  document.querySelectorAll('.exp-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const item = toggle.closest('.exp-item');
      const isOpen = item.classList.toggle('achievements-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
  });
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 4 — CASE STUDY MODAL
   ───────────────────────────────────────────────────────────────
   Each .project-card carries a hidden .case-study-content sibling
   (same data-project value links them). Clicking the card's
   .case-study-btn clones that hidden block's HTML into the shared
   #caseStudyBody and shows the modal. Keeping the content inline in
   each project card (rather than a separate JS data object) means
   editing a case study is just editing HTML, no JS knowledge needed.

   Level 4.1: the injected content is now an accordion (see .cs-step
   in style.css) — Problem/Process/Result stay collapsed until tapped,
   rather than all showing at once. Because bodyEl.innerHTML is
   replaced fresh on every open(), the accordion click listeners have
   to be re-attached each time too — old listeners die with the old
   DOM nodes they were bound to.
   ═══════════════════════════════════════════════════════════════ */
function initCaseStudyModal() {
  const overlay = document.getElementById('caseStudyOverlay');
  const closeBtn = document.getElementById('caseStudyClose');
  const titleEl = document.getElementById('caseStudyTitle');
  const bodyEl  = document.getElementById('caseStudyBody');
  const buttons = document.querySelectorAll('.case-study-btn');

  if (!overlay || !buttons.length) return;

  function open(projectKey) {
    const source = document.querySelector(`.case-study-content[data-project="${projectKey}"]`);
    const card = document.querySelector(`.project-card [data-project="${projectKey}"]`)
      ?.closest('.project-card');
    if (!source) return;

    titleEl.textContent = card?.querySelector('.project-title')?.textContent || 'Case study';
    bodyEl.innerHTML = source.innerHTML;
    initStepAccordion(bodyEl);
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => closeBtn.focus());
  }

  function close() {
    overlay.hidden = true;
    document.body.style.overflow = '';
  }

  // Wires up the Problem/Process/Result accordion inside whatever
  // content was just injected. First step opens by default (so the
  // modal doesn't look empty the instant it appears); the rest start
  // collapsed and wait for a tap. Also drives the .cs-progress dots —
  // each dot marks "seen" the first time its matching step is opened,
  // and stays marked even if the step is collapsed again afterward.
  function initStepAccordion(scope) {
    const steps = scope.querySelectorAll('.cs-step');
    const dots  = scope.querySelectorAll('.cs-progress-dot');

    steps.forEach((step, index) => {
      const header = step.querySelector('.cs-step-header');
      if (!header) return;

      const startOpen = index === 0;
      setStepOpen(step, header, startOpen);
      if (startOpen && dots[index]) dots[index].classList.add('seen');

      header.addEventListener('click', () => {
        const willOpen = !step.classList.contains('open');
        setStepOpen(step, header, willOpen);
        if (willOpen && dots[index]) dots[index].classList.add('seen');
      });
    });
  }

  function setStepOpen(step, header, shouldOpen) {
    step.classList.toggle('open', shouldOpen);
    header.setAttribute('aria-expanded', String(shouldOpen));
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => open(btn.dataset.project));
  });

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.hidden) close();
  });
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 4 — THEMED MEDIA HELPERS
   ───────────────────────────────────────────────────────────────
   Shared by initThemeToggle() and initGithubStats(). The skillicons.dev
   logo rows are <img> tags pointed at a service that accepts a
   color/theme in the query string — so "supporting dark mode" for them
   means rebuilding that URL, not writing any real theme-switching logic.
   (The contribution grid used to work the same way via ghchart.rshah.org,
   but is now custom-built — see renderContribGrid() below — and its
   dark-mode support lives entirely in style.css's .contrib-cell.lvl-*
   rules instead.)
   ═══════════════════════════════════════════════════════════════ */

function currentSiteTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function syncSkillIcons() {
  const theme = currentSiteTheme();

  document.querySelectorAll('.skill-row-icon').forEach(img => {
    const icon = img.dataset.icon;
    if (!icon) return;
    // data-fixed-theme (set on the Frontend card, which has a permanently
    // dark background) always wins over the page's current theme —
    // otherwise light-mode icons would go near-invisible on that card.
    const useTheme = img.dataset.fixedTheme || theme;
    img.src = `https://skillicons.dev/icons?i=${icon}&theme=${useTheme}`;
  });
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 4 — LIVE GITHUB STATS
   ───────────────────────────────────────────────────────────────
   Pulls public profile + repo data from the unauthenticated GitHub
   REST API (github.com/rest — no token needed, capped at 60 req/hr
   per IP, which a personal portfolio's traffic won't come close to).

   Two requests:
     GET /users/{username}            → avatar, name, followers, public repo count
     GET /users/{username}/repos      → used to compute total stars + top 3 repos

   On any failure (offline, rate-limited, typo'd username) we fall
   back to #githubError with a plain link to the profile — the section
   never just breaks or shows blank/stale data.
   ═══════════════════════════════════════════════════════════════ */
function initGithubStats() {
  const loading   = document.getElementById('githubLoading');
  const body      = document.getElementById('githubBody');
  const errorBox  = document.getElementById('githubError');
  const errorLink = document.getElementById('githubErrorLink');

  if (!loading || !body || !errorBox) return;

  errorLink.href = `https://github.com/${GITHUB_USERNAME}`;

  // Contribution calendar is a separate, self-contained feature —
  // see initContribGraph() further down.
  initContribGraph();

  Promise.all([
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`).then(r => {
      if (!r.ok) throw new Error('profile fetch failed');
      return r.json();
    }),
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated`).then(r => {
      if (!r.ok) throw new Error('repos fetch failed');
      return r.json();
    })
  ])
    .then(([profile, repos]) => {
      renderGithub(profile, repos);
      loading.hidden = true;
      body.hidden = false;
    })
    .catch(() => {
      loading.hidden = true;
      errorBox.hidden = false;
    });

  function renderGithub(profile, repos) {
    document.getElementById('githubAvatar').src = profile.avatar_url;
    document.getElementById('githubAvatar').alt = `${profile.login}'s GitHub avatar`;
    document.getElementById('githubName').textContent = profile.name || profile.login;

    const handleEl = document.getElementById('githubHandle');
    handleEl.textContent = `@${profile.login}`;
    handleEl.href = profile.html_url;

    document.getElementById('githubFollow').href = profile.html_url;
    document.getElementById('githubRepos').textContent = profile.public_repos ?? '—';
    document.getElementById('githubFollowers').textContent = profile.followers ?? '—';

    const totalStars = Array.isArray(repos)
      ? repos.reduce((sum, r) => sum + (r.stargazers_count || 0), 0)
      : 0;
    document.getElementById('githubStars').textContent = totalStars;

    // Top 3 repos by star count, excluding forks (forks aren't really "your" work)
    const topRepos = Array.isArray(repos)
      ? repos
          .filter(r => !r.fork)
          .sort((a, b) => b.stargazers_count - a.stargazers_count)
          .slice(0, 3)
      : [];

    const repoList = document.getElementById('githubRepoList');
    repoList.innerHTML = topRepos.map(repo => `
      <a class="github-repo" href="${repo.html_url}" target="_blank" rel="noopener">
        <span class="github-repo-name">${escapeHtml(repo.name)}</span>
        <span class="github-repo-meta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          ${repo.stargazers_count}
        </span>
      </a>
    `).join('');
  }

  // Minimal HTML-escaping for repo names before injecting via innerHTML —
  // repo names are attacker-controlled-ish (anyone can name a public repo
  // anything), so this is cheap insurance against a stray "<" breaking markup.
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 4.1 — CONTRIBUTION CALENDAR (custom-built, filterable)
   ───────────────────────────────────────────────────────────────
   One fetch gets a full year of daily contribution counts as JSON
   from github-contributions-api.jogruber.de (a free, public mirror —
   GitHub's own official contribution calendar is only available via
   authenticated GraphQL, which a static client-side site can't call
   safely). Everything after that — the 3M/6M/12M/custom filtering,
   the grid, the month labels — is done entirely in the browser with
   zero extra network requests, since we already have the full year
   of data sitting in memory.
   ═══════════════════════════════════════════════════════════════ */
function initContribGraph() {
  const skeleton   = document.getElementById('githubContribSkeleton');
  const calendar   = document.getElementById('contribCalendar');
  const gridEl     = document.getElementById('contribGrid');
  const monthsEl   = document.getElementById('contribMonths');
  const summaryEl  = document.getElementById('contribSummary');
  const fallback   = document.getElementById('githubContribFallback');
  const fallbackLink = document.getElementById('githubContribFallbackLink');
  const filterPills = document.querySelectorAll('.contrib-filter-pill');
  const customRow  = document.getElementById('contribCustomRange');
  const fromBtn    = document.getElementById('contribFromBtn');
  const toBtn      = document.getElementById('contribToBtn');
  const customApply = document.getElementById('contribApply');
  const popover    = document.getElementById('contribMonthPopover');
  const popoverYearLabel = document.getElementById('contribPopoverYear');
  const popoverGrid = document.getElementById('contribPopoverGrid');
  const yearPrevBtn = document.getElementById('contribYearPrev');
  const yearNextBtn = document.getElementById('contribYearNext');

  if (!gridEl) return;

  fallbackLink.href = `https://github.com/${GITHUB_USERNAME}`;

  const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let contributions = []; // populated once the fetch resolves, then reused by every re-render

  // ── Custom-range picker state ──
  const today = new Date();
  let fromValue = { month: today.getMonth() + 1, year: today.getFullYear() };
  let toValue   = { month: today.getMonth() + 1, year: today.getFullYear() };
  let activeField = null;    // 'from' | 'to' | null (which button opened the popover)
  let popoverYear = today.getFullYear(); // year currently shown in the open popover
  let minYear, maxYear;      // clamped once contributions data has loaded

  updateTriggerLabels();

  fetch(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`)
    .then(r => {
      if (!r.ok) throw new Error('contributions fetch failed');
      return r.json();
    })
    .then(data => {
      contributions = Array.isArray(data.contributions) ? data.contributions : [];
      skeleton.style.display = 'none';
      calendar.hidden = false;

      // Default view on load: 6 months
      render(6);

      // Pre-set the custom-range picker to a sensible default (6 months
      // ago → this month) so Apply works even before either button is touched.
      const sixAgo = new Date(today);
      sixAgo.setMonth(sixAgo.getMonth() - 6);
      fromValue = { month: sixAgo.getMonth() + 1, year: sixAgo.getFullYear() };
      toValue   = { month: today.getMonth() + 1, year: today.getFullYear() };
      updateTriggerLabels();

      // Clamp the popover's year navigation to whatever range the fetched
      // data actually covers, so people can't page to a year with nothing in it.
      if (contributions.length) {
        minYear = new Date(contributions[0].date).getFullYear();
        maxYear = new Date(contributions[contributions.length - 1].date).getFullYear();
      }
    })
    .catch(() => {
      skeleton.style.display = 'none';
      fallback.hidden = false;
    });

  // ── Filter pill clicks ──
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const range = pill.dataset.range;
      if (range === 'custom') {
        customRow.hidden = false;
      } else {
        customRow.hidden = true;
        closePopover();
        render(parseInt(range, 10));
      }
    });
  });

  customApply.addEventListener('click', () => {
    closePopover();
    const fromStr = `${fromValue.year}-${String(fromValue.month).padStart(2, '0')}`;
    const toStr   = `${toValue.year}-${String(toValue.month).padStart(2, '0')}`;
    render(null, fromStr, toStr);
  });

  // ── Popover open/close ──
  fromBtn.addEventListener('click', () => openPopover('from'));
  toBtn.addEventListener('click', () => openPopover('to'));

  yearPrevBtn.addEventListener('click', () => {
    popoverYear -= 1;
    renderPopoverGrid();
  });
  yearNextBtn.addEventListener('click', () => {
    popoverYear += 1;
    renderPopoverGrid();
  });

  function openPopover(field) {
    activeField = field;
    const current = field === 'from' ? fromValue : toValue;
    popoverYear = current.year;
    fromBtn.classList.toggle('active', field === 'from');
    toBtn.classList.toggle('active', field === 'to');
    popover.hidden = false;
    renderPopoverGrid();
  }

  function closePopover() {
    activeField = null;
    popover.hidden = true;
    fromBtn.classList.remove('active');
    toBtn.classList.remove('active');
  }

  // Tapping anywhere outside the popover/trigger buttons closes it —
  // standard picker behavior, and matters on mobile where there's no
  // hover state to rely on for "did they move on already".
  document.addEventListener('click', (e) => {
    if (popover.hidden) return;
    if (popover.contains(e.target) || e.target === fromBtn || e.target === toBtn) return;
    closePopover();
  });

  function renderPopoverGrid() {
    popoverYearLabel.textContent = popoverYear;

    if (minYear !== undefined) {
      yearPrevBtn.disabled = popoverYear <= minYear;
      yearNextBtn.disabled = popoverYear >= maxYear;
    }

    const selected = activeField === 'from' ? fromValue : toValue;

    popoverGrid.innerHTML = MONTH_ABBR.map((name, i) => {
      const monthNum = i + 1;
      const isSelected = selected.year === popoverYear && selected.month === monthNum;
      const outOfRange = minYear !== undefined && !isMonthInDataRange(monthNum, popoverYear);
      return `<button type="button"
        class="contrib-popover-month-btn${isSelected ? ' selected' : ''}"
        data-month="${monthNum}" ${outOfRange ? 'disabled' : ''}>${name}</button>`;
    }).join('');

    popoverGrid.querySelectorAll('.contrib-popover-month-btn:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const month = parseInt(btn.dataset.month, 10);
        if (activeField === 'from') {
          fromValue = { month, year: popoverYear };
        } else if (activeField === 'to') {
          toValue = { month, year: popoverYear };
        }
        updateTriggerLabels();
        closePopover();
      });
    });
  }

  function isMonthInDataRange(month, year) {
    if (!contributions.length) return true;
    const target = new Date(year, month - 1, 1).getTime();
    const first = new Date(contributions[0].date);
    const last = new Date(contributions[contributions.length - 1].date);
    const firstOfMonth = new Date(first.getFullYear(), first.getMonth(), 1).getTime();
    const lastOfMonth = new Date(last.getFullYear(), last.getMonth(), 1).getTime();
    return target >= firstOfMonth && target <= lastOfMonth;
  }

  function updateTriggerLabels() {
    fromBtn.textContent = `${MONTH_ABBR[fromValue.month - 1]} ${fromValue.year}`;
    toBtn.textContent = `${MONTH_ABBR[toValue.month - 1]} ${toValue.year}`;
  }

  /**
   * Renders the grid for either:
   *   - the last `months` months (rolling from today), or
   *   - an explicit `fromMonthValue` → `toMonthValue` range
   *     (values are "YYYY-MM", straight from <input type="month">)
   */
  function render(months, fromMonthValue, toMonthValue) {
    if (!contributions.length) return;

    let startDate, endDate;

    if (fromMonthValue && toMonthValue) {
      startDate = new Date(`${fromMonthValue}-01T00:00:00`);
      // End at the last day of the "to" month
      endDate = new Date(`${toMonthValue}-01T00:00:00`);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
    }

    const filtered = contributions.filter(d => {
      const t = new Date(d.date).getTime();
      return t >= startDate.getTime() && t <= endDate.getTime();
    });

    if (!filtered.length) {
      gridEl.innerHTML = '';
      monthsEl.innerHTML = '';
      summaryEl.textContent = 'No contribution data for this range.';
      summaryEl.hidden = false;
      return;
    }

    // Group into calendar weeks (Sun–Sat), padding the first week so
    // day-of-week alignment matches a real calendar rather than just
    // chunking every 7 items.
    const weeks = [];
    let week = [];
    const firstWeekday = new Date(filtered[0].date).getDay();
    for (let i = 0; i < firstWeekday; i++) week.push(null);

    filtered.forEach(day => {
      week.push(day);
      if (week.length === 7) { weeks.push(week); week = []; }
    });
    if (week.length) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }

    // Day cells
    gridEl.innerHTML = weeks.map(w =>
      w.map(day => {
        if (!day) return `<span class="contrib-cell contrib-cell--empty"></span>`;
        const level = day.level ?? levelFromCount(day.count);
        const label = `${day.count} contribution${day.count === 1 ? '' : 's'} on ${formatDate(day.date)}`;
        return `<button type="button" class="contrib-cell lvl-${level}" data-date="${day.date}" data-count="${day.count}" aria-label="${label}"></button>`;
      }).join('')
    ).join('');

    // Month labels — one per week-column, only drawn where the month
    // actually changes so labels don't repeat every single week.
    let lastMonth = null;
    monthsEl.innerHTML = weeks.map(w => {
      const firstDay = w.find(d => d);
      const month = firstDay ? new Date(firstDay.date).getMonth() : lastMonth;
      if (firstDay && month !== lastMonth) {
        lastMonth = month;
        return `<span class="contrib-month-label">${MONTH_ABBR[month]}</span>`;
      }
      return `<span class="contrib-month-label"></span>`;
    }).join('');

    // Tapping/clicking a cell surfaces its exact count in the summary
    // line — the main way this is readable at all on mobile, since
    // there's no hover to rely on for the native title tooltip there.
    gridEl.querySelectorAll('.contrib-cell:not(.contrib-cell--empty)').forEach(cell => {
      cell.addEventListener('click', () => {
        const count = cell.dataset.count;
        const date = formatDate(cell.dataset.date);
        summaryEl.textContent = `${count} contribution${count === '1' ? '' : 's'} on ${date}`;
      });
    });

    const total = filtered.reduce((sum, d) => sum + d.count, 0);
    const rangeLabel = fromMonthValue
      ? `${formatMonthInput(fromMonthValue)} – ${formatMonthInput(toMonthValue)}`
      : `the last ${months} month${months === 1 ? '' : 's'}`;
    summaryEl.textContent = `${total} contribution${total === 1 ? '' : 's'} in ${rangeLabel}`;
    summaryEl.hidden = false;
  }

  function levelFromCount(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 9) return 3;
    return 4;
  }

  function formatDate(isoDate) {
    return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  function formatMonthInput(monthValue) {
    const [y, m] = monthValue.split('-');
    return `${MONTH_ABBR[parseInt(m, 10) - 1]} ${y}`;
  }
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 4 — HERO MOUSE PARALLAX
   ───────────────────────────────────────────────────────────────
   Tracks the mouse position within the hero section and writes it as
   --parallax-x / --parallax-y custom properties on #hero, in a small
   ±px range. The actual transform + easing lives entirely in CSS
   (see the pointer:fine block in style.css) — this function only ever
   sets two numbers, so it stays cheap even on mousemove.

   Skipped entirely on touch/coarse-pointer devices and when the
   visitor has prefers-reduced-motion on.
   ═══════════════════════════════════════════════════════════════ */
function initHeroParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (prefersReducedMotion || !isFinePointer) return;

  const MAX_OFFSET_PX = 10; // how far elements are allowed to drift from center

  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    // Position within the hero, from -1 (left/top edge) to 1 (right/bottom edge)
    const relX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const relY = ((e.clientY - rect.top) / rect.height) * 2 - 1;

    hero.style.setProperty('--parallax-x', `${relX * MAX_OFFSET_PX}px`);
    hero.style.setProperty('--parallax-y', `${relY * MAX_OFFSET_PX}px`);
  });

  hero.addEventListener('mouseleave', () => {
    hero.style.setProperty('--parallax-x', '0px');
    hero.style.setProperty('--parallax-y', '0px');
  });
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 5 — DOWNLOAD RESUME (real generated CV, not a page printout)
   ───────────────────────────────────────────────────────────────
   This used to just call window.print() on the live marketing page —
   but a résumé isn't a screenshot of a portfolio site, it's its own
   document. So instead: #resumeDocument (in index.html) is a proper
   single-column Harvard-format résumé template, hidden on-screen at
   all times, that populateResumeDocument() fills in by reading the
   REAL content already sitting in the page (name, role, contact links,
   each experience entry + its achievements, every skill, every
   certification) — so the résumé can't silently drift out of sync
   with what the site itself says.

   No PDF library involved — window.print() (browser's native
   "Save as PDF") still does the actual export. The @media print rules
   in style.css hide the entire live page and show ONLY #resumeDocument,
   styled as a plain black-on-white document regardless of the site's
   current dark/light theme — a résumé being read by a recruiter or an
   ATS system shouldn't depend on which mode you happened to be
   browsing in.
   ═══════════════════════════════════════════════════════════════ */
function initResumeDownload() {
  const btn = document.getElementById('downloadResumeBtn');
  if (!btn) return;

  // Populated once at page load — the source content (experience,
  // skills, etc.) is static, so there's no need to re-read the DOM
  // on every click.
  populateResumeDocument();

  btn.addEventListener('click', () => {
    window.print();
  });
}

function populateResumeDocument() {
  const nameSource = document.getElementById('hero-name');
  const roleSource = document.querySelector('.hero-role');
  const resumeName = document.getElementById('resumeName');
  const resumeRole = document.getElementById('resumeRole');

  if (nameSource && resumeName) {
    resumeName.textContent = nameSource.textContent.replace(/\s+/g, ' ').trim();
  }
  if (roleSource && resumeRole) {
    resumeRole.textContent = roleSource.textContent.replace(/\s+/g, ' ').trim();
  }

  // Contact line — reuses the visible link text already in the Contact
  // section (email address, github.com/username, linkedin.com/in/username)
  // rather than re-typing any of it here.
  // MULTI-PAGE NOTE: on the Experience page, the Contact form itself
  // lives on Home, not here — so this looks for a `.contact-social`
  // list anywhere on the current page. Experience.html carries a
  // hidden `#resumeSourceData` block with the same markup for exactly
  // this reason (see that block in experience.html). Only overwrite
  // the static placeholder text if we actually found real links.
  const contactLinks = document.querySelectorAll('.contact-social a');
  const resumeContact = document.getElementById('resumeContact');
  if (resumeContact && contactLinks.length) {
    resumeContact.textContent = Array.from(contactLinks)
      .map(a => a.textContent.replace(/\s+/g, ' ').trim())
      .join('   ·   ');
  }

  // Experience — one .resume-entry per .exp-item. Only the top 2
  // achievements per role make it in (a résumé should read as "here's
  // the best of it", not a full copy of the site's expanded detail) —
  // falls back to the summary paragraph as a single bullet if a role
  // has no itemized achievements yet.
  const MAX_BULLETS_PER_ROLE = 2;
  const resumeExperience = document.getElementById('resumeExperience');
  if (resumeExperience) {
    const expItems = document.querySelectorAll('.exp-item');
    resumeExperience.innerHTML = Array.from(expItems).map(item => {
      // .exp-role's first text node only — excludes the nested
      // "Current" <span> tag so it doesn't get glued onto the title.
      const roleNode = item.querySelector('.exp-role');
      const role = roleNode ? roleNode.childNodes[0].textContent.replace(/\s+/g, ' ').trim() : '';
      const company = item.querySelector('.exp-company')?.textContent.replace(/\s+/g, ' ').trim() || '';
      const period = item.querySelector('.exp-period')?.textContent.replace(/\s+/g, ' ').trim() || '';
      const achievementEls = item.querySelectorAll('.exp-achievements li');
      const desc = item.querySelector('.exp-desc')?.textContent.replace(/\s+/g, ' ').trim() || '';

      const bullets = achievementEls.length
        ? Array.from(achievementEls).slice(0, MAX_BULLETS_PER_ROLE).map(li => li.textContent.replace(/\s+/g, ' ').trim())
        : [desc];

      return `
        <div class="resume-entry">
          <div class="resume-entry-row">
            <strong>${escapeResumeText(role)}</strong>
            <span>${escapeResumeText(period)}</span>
          </div>
          <p class="resume-entry-sub">${escapeResumeText(company)}</p>
          <ul>${bullets.map(b => `<li>${escapeResumeText(b)}</li>`).join('')}</ul>
        </div>
      `;
    }).join('');
  }

  // Skills — grouped by category, flattened to "Category: item, item, item"
  // lines rather than the site's visual icon-row treatment, which has
  // no equivalent in a plain-text document.
  const resumeSkills = document.getElementById('resumeSkills');
  if (resumeSkills) {
    const skillCards = document.querySelectorAll('.skill-card');
    resumeSkills.textContent = Array.from(skillCards).map(card => {
      const category = card.querySelector('.skill-category')?.textContent.trim() || '';
      const names = Array.from(card.querySelectorAll('.skill-row-name')).map(s => s.textContent.trim());
      return `${category}: ${names.join(', ')}`;
    }).join('   |   ');
  }

  // Certifications — only the top 3 make it in (same "best of, not all
  // of" reasoning as the experience bullets above). Whole section hides
  // itself if there are none yet, rather than printing an empty heading.
  const MAX_CERTIFICATIONS = 3;
  const resumeCertifications = document.getElementById('resumeCertifications');
  const resumeCertSection = document.getElementById('resumeCertSection');
  if (resumeCertifications && resumeCertSection) {
    const certCards = Array.from(document.querySelectorAll('.cert-card')).slice(0, MAX_CERTIFICATIONS);
    resumeCertifications.innerHTML = certCards.map(card => {
      const title = card.querySelector('.cert-title')?.textContent.trim() || '';
      const issuer = card.querySelector('.cert-issuer')?.textContent.replace(/\s+/g, ' ').trim() || '';
      return `<div class="resume-entry-row"><strong>${escapeResumeText(title)}</strong><span>${escapeResumeText(issuer)}</span></div>`;
    }).join('');

    resumeCertSection.style.display = certCards.length ? '' : 'none';
  }
}

// Minimal HTML-escaping before injecting page-sourced text via
// innerHTML — the content originates from this same site's own DOM
// rather than user input, but it costs nothing to be defensive here.
function escapeResumeText(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 5 — TESTIMONIALS CAROUSEL
   ───────────────────────────────────────────────────────────────
   Simple index-based carousel: one .testimonial-slide visible at a
   time (toggled via the .active class, not display:none/block, so the
   opacity transition in CSS actually has something to animate between
   states), plus prev/next arrows and a row of dot indicators that
   double as direct-jump controls.
   ═══════════════════════════════════════════════════════════════ */
function initTestimonialsCarousel() {
  const track = document.getElementById('testimonialsTrack');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.testimonial-slide'));
  const dotsWrap = document.getElementById('testimonialsDots');
  const prevBtn = document.getElementById('testimonialPrev');
  const nextBtn = document.getElementById('testimonialNext');

  if (!slides.length) return;

  let index = 0;

  // Build one dot per slide
  dotsWrap.innerHTML = slides
    .map((_, i) => `<button type="button" class="testimonial-dot" aria-label="Go to testimonial ${i + 1}"></button>`)
    .join('');
  const dots = Array.from(dotsWrap.querySelectorAll('.testimonial-dot'));

  function goTo(newIndex) {
    index = (newIndex + slides.length) % slides.length; // wraps both directions
    slides.forEach((slide, i) => slide.classList.toggle('active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

  // Basic swipe support — matters since this is meant to be demoed on mobile
  let touchStartX = null;
  track.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(deltaX) > 40) goTo(deltaX < 0 ? index + 1 : index - 1);
    touchStartX = null;
  }, { passive: true });

  goTo(0);
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 5 — ACHIEVEMENTS "UNLOCK" REVEAL
   ───────────────────────────────────────────────────────────────
   Separate from the generic .fade-in IntersectionObserver used
   elsewhere on the page (initScrollAnimations) because badges get
   their own slightly different animation (a small pop/scale rather
   than a plain fade+slide) and a staggered per-badge delay based on
   their position in the strip, to read as "unlocking" one after another.
   ═══════════════════════════════════════════════════════════════ */
function initAchievementsReveal() {
  const badges = document.querySelectorAll('.achievement-badge');
  if (!badges.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    badges.forEach(b => b.classList.add('unlocked'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('unlocked');
        observer.unobserve(entry.target); // only ever "unlocks" once
      }
    });
  }, { threshold: 0.3 });

  badges.forEach(badge => observer.observe(badge));
}


/* ═══════════════════════════════════════════════════════════════
   LEVEL 5 — VISITOR COUNTER
   ───────────────────────────────────────────────────────────────
   The <img> in the footer already points at visitorbadge.io — a free,
   no-signup image-based hit counter (same pattern as the skillicons/
   ghchart images elsewhere). This function just reveals it once it's
   actually loaded, and keeps it hidden if the service is ever down —
   same "fail silently, don't show a broken state" approach used for
   the GitHub contribution graph.
   ═══════════════════════════════════════════════════════════════ */
function initVisitorCounter() {
  const el = document.getElementById('visitorCounter');
  if (!el) return;

  el.addEventListener('load', () => { el.hidden = false; });
  el.addEventListener('error', () => { el.hidden = true; });

  // If the image was already served from cache before this listener
  // attached, `load` may never fire — .complete + naturalWidth catches
  // that case and reveals it immediately instead of staying hidden forever.
  if (el.complete && el.naturalWidth > 0) {
    el.hidden = false;
  }
}