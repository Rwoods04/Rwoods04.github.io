const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

const toggle = document.querySelector(".menu-toggle");
const links = document.getElementById("nav-links");
if (toggle && links) {
  const mobile = window.matchMedia("(max-width: 900px)");
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.textContent = open ? "Close menu" : "Menu";
    links.hidden = mobile.matches && !open;
  };
  const syncMenu = () => {
    const focusedLink = links.contains(document.activeElement);
    const focusedToggle = document.activeElement === toggle;
    toggle.hidden = !mobile.matches;
    setOpen(false);
    if (mobile.matches && focusedLink) toggle.focus();
    if (!mobile.matches && focusedToggle) links.querySelector("a")?.focus();
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobile.matches && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false);
      toggle.focus();
    }
  });
  mobile.addEventListener("change", syncMenu);
  syncMenu();
}

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        if (!motionPreference.matches) entry.target.classList.add("reveal-in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".card, .education-entry, [data-story-reveal]").forEach((element) => observer.observe(element));
}

/* Project archive: HTML is the source of truth; without JS every preview is visible. */
const archive = document.querySelector("[data-project-archive]");
if (archive) {
  const projectLinks = Array.from(archive.querySelectorAll("[data-project-link]"));
  const previews = Array.from(archive.querySelectorAll(".project-preview"));
  const filters = Array.from(archive.querySelectorAll("[data-project-filter]"));
  const filterBar = archive.querySelector(".archive-filters");
  const feedback = archive.querySelector(".archive-feedback");
  let category = "All Projects";
  let selected = null;
  const matchesCategory = (preview) => category === "All Projects" || preview.dataset.category === category;
  const selectProject = (preview) => {
    selected = preview;
    previews.forEach((item) => { item.hidden = item !== preview; });
    projectLinks.forEach((link) => {
      if (link.hash === "#" + preview.id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });
    const count = previews.filter(matchesCategory).length;
    feedback.textContent = count + (count === 1 ? " project" : " projects") + " / " + category + " — Selected: " + preview.querySelector("h2").textContent;
  };
  const filterProjects = (nextCategory) => {
    category = nextCategory;
    filters.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.projectFilter === category)));
    projectLinks.forEach((link, index) => { link.closest("li").hidden = !matchesCategory(previews[index]); });
    if (!selected || !matchesCategory(selected)) selectProject(previews.find(matchesCategory));
    else selectProject(selected);
  };
  projectLinks.forEach((link, index) => {
    link.addEventListener("click", (event) => {
      // Preserve modified clicks and normal links when opening another tab.
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selectProject(previews[index]);
    });
  });
  filters.forEach((button) => button.addEventListener("click", () => filterProjects(button.dataset.projectFilter)));
  const followHash = () => {
    const target = previews.find((preview) => "#" + preview.id === window.location.hash);
    if (target) {
      if (!matchesCategory(target)) filterProjects("All Projects");
      selectProject(target);
    }
  };
  archive.classList.add("archive-enhanced");
  filterBar.hidden = false;
  feedback.hidden = false;
  filterProjects("All Projects");
  followHash();
  window.addEventListener("hashchange", followHash);
}

/* A fixed contact command directory, not a shell or code interpreter. */
const contactTerminal = document.querySelector("[data-contact-terminal]");
if (contactTerminal) {
  const history = contactTerminal.querySelector("[data-terminal-history]");
  const screen = contactTerminal.querySelector(".terminal-screen");
  const form = contactTerminal.querySelector("form");
  const input = contactTerminal.querySelector("input");
  const status = document.querySelector("[data-terminal-status]");
  const responses = {
    help: "Available commands: help (commands), about (introduction), github (profile link), email, linkedin, resume (availability), clear (history).",
    about: "I'm Robert Woods, a Computer Information Technology student at Western Kentucky University. My bachelor's degree is in progress, and I'm developing skills in software development, networking, and IT systems.",
    github: "Explore my work on GitHub:",
    email: "Professional email contact will be added later.",
    linkedin: "A LinkedIn profile will be added later.",
    resume: "A résumé download will be added when an actual PDF is available."
  };
  let responseNumber = 0;
  const runCommand = (raw) => {
    const entered = raw.trim().slice(0, 80);
    const command = entered.toLowerCase();
    if (!command) {
      status.textContent = "Enter a command or choose one of the command buttons.";
      return;
    }
    if (command === "clear") {
      history.replaceChildren();
      input.value = "";
      status.textContent = "Terminal command history cleared.";
      return;
    }
    const known = Object.prototype.hasOwnProperty.call(responses, command);
    const message = known ? responses[command] : 'Unknown command "' + entered + '". Type help to see available commands.';
    const entry = document.createElement("div");
    entry.className = "terminal-entry";
    const prompt = document.createElement("p");
    prompt.className = "terminal-prompt";
    prompt.textContent = "❯ " + entered;
    const output = document.createElement("p");
    output.textContent = message;
    entry.append(prompt, output);
    if (command === "github") {
      const link = document.createElement("a");
      link.href = "https://github.com/Rwoods04";
      link.textContent = "github.com/Rwoods04 (opens in a new tab)";
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "text-link";
      entry.append(link);
    }
    history.append(entry);
    while (history.children.length > 20) history.firstElementChild.remove();
    screen.scrollTop = screen.scrollHeight;
    input.value = "";
    // A sequence distinguishes repeated commands for live-region announcements.
    responseNumber += 1;
    status.textContent = "Response " + responseNumber + ": " + message + (command === "github" ? " github.com/Rwoods04. Link added to command history." : "");
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    runCommand(input.value);
  });
  contactTerminal.querySelectorAll("[data-terminal-command]").forEach((button) => {
    button.addEventListener("click", () => runCommand(button.dataset.terminalCommand));
  });
  contactTerminal.querySelector(".terminal-controls").hidden = false;
}
