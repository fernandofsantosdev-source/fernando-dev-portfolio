document.body.classList.add("has-js");

const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const navigationLinks = [...navigation.querySelectorAll(".nav-link")];
const railLinks = [...document.querySelectorAll(".rail-link")];
const sectionLinks = [...navigationLinks, ...railLinks];
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon use");
const announcement = document.querySelector("#announcement");
const pageProgress = document.querySelector(".page-progress span");
const scrollAtmosphere = document.querySelector(".scroll-atmosphere");
const certificateDialog = document.querySelector("#certificate-dialog");
const certificateTitle = document.querySelector("#certificate-title");
const certificateViewer = document.querySelector(".certificate-viewer");
const certificateOpenLink = document.querySelector(".certificate-open-link");
const formationCards = document.querySelector(".formation-cards");
const skillsTabs = [...document.querySelectorAll(".skills-tab")];
const skillsPanels = skillsTabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));
const skillsTabList = document.querySelector('[role="tablist"][aria-label="Tecnologias e formação"]');
const skillsPanelHideTimers = new Map();
let activeSkillsPanel = skillsPanels.find((panel) => !panel.hidden);
const cinematicSections = [...document.querySelectorAll(".cinematic-section")];
const welcomeScreen = document.querySelector("#welcome-screen");
const welcomeSkip = document.querySelector(".welcome-skip");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const welcomeFadeDuration = reducedMotion ? 1 : 450;

function setActiveNavigation(hash) {
  sectionLinks.forEach((link) => {
    const isActive = link.hash === hash;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "location");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function dismissWelcome() {
  if (!welcomeScreen.open || welcomeScreen.classList.contains("is-leaving")) {
    return;
  }

  window.clearTimeout(welcomeTimer);
  welcomeScreen.classList.add("is-leaving");
  window.setTimeout(() => welcomeScreen.close(), welcomeFadeDuration);
}

function openCertificate(link) {
  const title = link.dataset.certificateTitle;
  const source = link.dataset.certificateSrc;

  if (!title || !source) {
    throw new Error("Os dados do certificado selecionado estão incompletos.");
  }

  certificateTitle.textContent = title;
  certificateViewer.title = `Certificado: ${title}`;
  certificateViewer.src = source;
  certificateOpenLink.href = source;
  certificateDialog.showModal();
}

function closeCertificate() {
  certificateViewer.removeAttribute("src");
  certificateDialog.close();
}

function activateSkillsTab(selectedTab, moveFocus = false) {
  const selectedIndex = skillsTabs.indexOf(selectedTab);
  if (selectedIndex === -1) {
    return;
  }

  const nextPanel = skillsPanels[selectedIndex];

  if (activeSkillsPanel !== nextPanel && activeSkillsPanel) {
    const activePanel = activeSkillsPanel;
    activePanel.inert = true;
    activePanel.setAttribute("aria-hidden", "true");

    const pendingTimer = skillsPanelHideTimers.get(activePanel);
    if (pendingTimer) {
      window.clearTimeout(pendingTimer);
      skillsPanelHideTimers.delete(activePanel);
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      activePanel.hidden = true;
      activePanel.classList.remove("is-exiting");
    } else {
      activePanel.classList.add("is-exiting");
      const timer = window.setTimeout(() => {
        if (activePanel.inert) {
          activePanel.hidden = true;
          activePanel.classList.remove("is-exiting");
        }
        skillsPanelHideTimers.delete(activePanel);
      }, 180);
      skillsPanelHideTimers.set(activePanel, timer);
    }
  }

  const pendingTimer = skillsPanelHideTimers.get(nextPanel);
  if (pendingTimer) {
    window.clearTimeout(pendingTimer);
    skillsPanelHideTimers.delete(nextPanel);
  }
  nextPanel.hidden = false;
  nextPanel.inert = false;
  nextPanel.removeAttribute("aria-hidden");
  nextPanel.classList.remove("is-exiting");
  activeSkillsPanel = nextPanel;

  skillsTabs.forEach((tab, index) => {
    const isSelected = index === selectedIndex;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  skillsTabList.classList.toggle("is-formation-active", selectedIndex === 1);
  if (moveFocus) {
    selectedTab.focus();
  }
}

skillsTabs.forEach((tab) => {
  tab.addEventListener("click", () => activateSkillsTab(tab));
  tab.addEventListener("keydown", (event) => {
    const currentIndex = skillsTabs.indexOf(tab);
    let nextIndex;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % skillsTabs.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + skillsTabs.length) % skillsTabs.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = skillsTabs.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    activateSkillsTab(skillsTabs[nextIndex], true);
  });
});

function renderFormationCertificates(certificates) {
  if (!Array.isArray(certificates)) {
    const error = new Error("O catálogo de certificados não foi carregado corretamente.");
    console.error(error);
    formationCards.textContent = "Não foi possível carregar os certificados.";
    return;
  }

  const cards = certificates.map((certificate) => {
    const card = document.createElement("article");
    card.className = "formation-card";

    const isCompletedCourse = certificate.status === "Concluído";
    const status = document.createElement("p");
    status.className = `formation-status ${isCompletedCourse ? "formation-status-complete" : "formation-status-available"}`;
    status.textContent = certificate.status ?? "Certificado disponível";

    const provider = document.createElement("div");
    provider.className = "formation-provider";

    if (certificate.institutionLogo) {
      const logo = document.createElement("img");
      logo.className = "formation-provider-logo";
      logo.src = certificate.institutionLogo;
      logo.alt = "";
      logo.loading = "lazy";
      logo.decoding = "async";
      provider.append(logo);
    } else {
      const mark = document.createElement("span");
      mark.className = "formation-provider-mark";
      mark.setAttribute("aria-hidden", "true");
      mark.textContent = "PDF";
      provider.append(mark);
    }

    const institution = document.createElement("span");
    institution.className = "formation-institution";
    institution.textContent = certificate.institution ?? "Instituição não informada";
    provider.append(institution);

    const title = document.createElement("h4");
    title.textContent = certificate.title;

    const description = document.createElement("p");
    description.className = "formation-description";
    description.textContent = [certificate.workload, certificate.description]
      .filter(Boolean)
      .join(" · ");

    const link = document.createElement("a");
    link.className = "button button-outline certificate-link";
    link.href = certificate.source;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.setAttribute("aria-haspopup", "dialog");
    link.setAttribute("aria-controls", "certificate-dialog");
    link.dataset.certificateTitle = certificate.dialogTitle;
    link.dataset.certificateSrc = certificate.source;
    link.textContent = "Ver certificado";

    card.append(provider, status, title);
    if (description.textContent) {
      card.append(description);
    }
    card.append(link);
    return card;
  });

  if (cards.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "formation-empty";
    emptyState.textContent = "Os certificados adicionados à pasta aparecerão aqui.";
    cards.push(emptyState);
  }

  formationCards.replaceChildren(...cards);
}

const publishedCertificates = Array.isArray(window.portfolioCertificates)
  ? window.portfolioCertificates
  : [];
renderFormationCertificates(window.portfolioCertificates);

function titleFromCertificateFile(fileName) {
  const title = fileName
    .replace(/\.pdf$/i, "")
    .replace(/^certificados?(?:[\s_-]+de)?[\s_-]+/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|[\s([{])\p{L}/gu, (match) => match.toLocaleUpperCase("pt-BR"))
    .replace(/\b(De|Da|Do|Das|Dos|E|Em|Para|Com)\b/g, (word) => word.toLowerCase());

  return title
    .replace(/\bJavascript\b/gi, "JavaScript")
    .replace(/\bGithub\b/gi, "GitHub")
    .replace(/\bQa\b/gi, "QA")
    .replace(/\bSql\b/gi, "SQL")
    .replace(/\bHtml\b/gi, "HTML")
    .replace(/\bCss\b/gi, "CSS");
}

async function readCertificatesFromLocalServer() {
  const directoryUrl = new URL("certificados/", window.location.href);
  directoryUrl.searchParams.set("certificate-refresh", String(Date.now()));

  const response = await fetch(directoryUrl, { cache: "no-store" });
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) {
    return null;
  }

  const directoryPage = new DOMParser().parseFromString(await response.text(), "text/html");
  if (!directoryPage.title.toLowerCase().includes("listing directory")) {
    return null;
  }

  return [...directoryPage.querySelectorAll("a[href]")]
    .map((link) => new URL(link.getAttribute("href"), directoryUrl))
    .filter((url) => /\.pdf$/i.test(url.pathname))
    .map((url) => {
      const fileName = decodeURIComponent(url.pathname.split("/").pop());
      const source = `certificados/${encodeURIComponent(fileName)}`;
      const existing = publishedCertificates.find(
        (certificate) => decodeURIComponent(certificate.source) === `certificados/${fileName}`,
      );
      const title = existing?.title ?? titleFromCertificateFile(fileName);

      return existing ?? {
        title,
        dialogTitle: title,
        kind: "Certificado",
        description: "Certificado em PDF",
        institution: null,
        institutionLogo: null,
        workload: null,
        status: "Certificado disponível",
        source,
      };
    });
}

async function startLocalCertificateDiscovery() {
  let localCertificates;

  try {
    localCertificates = await readCertificatesFromLocalServer();
  } catch (error) {
    if (window.location.protocol !== "file:") {
      console.warn("Não foi possível verificar novos certificados; o catálogo disponível foi mantido.", error);
    }
    return;
  }

  if (!localCertificates) {
    return;
  }

  renderFormationCertificates(localCertificates);

  const discoveryTimer = window.setInterval(async () => {
    if (document.visibilityState === "hidden") {
      return;
    }

    try {
      const latestCertificates = await readCertificatesFromLocalServer();
      if (!latestCertificates) {
        window.clearInterval(discoveryTimer);
        return;
      }

      const currentSources = [...formationCards.querySelectorAll(".certificate-link")]
        .map((link) => link.dataset.certificateSrc);
      const latestSources = latestCertificates.map((certificate) => certificate.source);

      if (JSON.stringify(currentSources) !== JSON.stringify(latestSources)) {
        renderFormationCertificates(latestCertificates);
      }
    } catch (error) {
      window.clearInterval(discoveryTimer);
      console.error("A descoberta automática de certificados foi interrompida.", error);
    }
  }, 3000);
}

startLocalCertificateDiscovery();

const welcomeTimer = window.setTimeout(dismissWelcome, reducedMotion ? 500 : 1500);

welcomeScreen.addEventListener("cancel", () => window.clearTimeout(welcomeTimer));
welcomeScreen.addEventListener("close", () => welcomeScreen.remove());
welcomeSkip.addEventListener("click", dismissWelcome);
welcomeScreen.showModal();
welcomeSkip.focus();

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menu" : "Fechar menu");
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  const link = event.target.closest(".nav-link");
  if (!link) {
    return;
  }

  setActiveNavigation(link.hash);
  navigation.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  document.querySelectorAll(".reveal, .cinematic-section").forEach((element) => {
    revealObserver.observe(element);
  });

} else {
  document.querySelectorAll(".reveal, .cinematic-section").forEach((element) => {
    element.classList.add("is-visible");
  });
}

let scrollFrame = 0;
function updateScrollEffects() {
  if (scrollFrame) {
    return;
  }

  scrollFrame = window.requestAnimationFrame(() => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
    const viewportCenter = window.innerHeight / 2;
    const activeSection = cinematicSections.reduce((closest, section) => {
      const bounds = section.getBoundingClientRect();
      const distance = Math.abs(bounds.top + bounds.height / 2 - viewportCenter);
      return !closest || distance < closest.distance ? { section, distance } : closest;
    }, null);

    pageProgress.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    scrollAtmosphere.style.setProperty("--parallax-offset", `${window.scrollY * -0.035}px`);
    if (activeSection) {
      setActiveNavigation(`#${activeSection.section.id}`);
    }
    scrollFrame = 0;
  });
}

window.addEventListener("scroll", updateScrollEffects, { passive: true });
window.addEventListener("resize", updateScrollEffects);
window.addEventListener("hashchange", updateScrollEffects);
window.addEventListener("load", updateScrollEffects, { once: true });
updateScrollEffects();

const videoInput = document.querySelector(".video-file-input");
const presentationVideo = document.querySelector(".presentation-video");
const videoPlaceholder = document.querySelector(".video-placeholder");
let localVideoUrl;

videoInput.addEventListener("change", () => {
  const [file] = videoInput.files;
  if (!file) {
    return;
  }

  if (localVideoUrl) {
    URL.revokeObjectURL(localVideoUrl);
  }

  localVideoUrl = URL.createObjectURL(file);
  presentationVideo.src = localVideoUrl;
  presentationVideo.hidden = false;
  videoPlaceholder.hidden = true;
  presentationVideo.load();
});

window.addEventListener("pagehide", () => {
  if (localVideoUrl) {
    URL.revokeObjectURL(localVideoUrl);
  }
});

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light-theme");
  themeIcon.setAttribute("href", isLight ? "#icon-sun" : "#icon-moon");
  themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
  document.querySelector('meta[name="theme-color"]').content = isLight ? "#f5f6f8" : "#08090b";
  announcement.textContent = isLight ? "Tema claro ativado." : "Tema escuro ativado.";
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) {
    return;
  }

  const link = event.target.closest(".certificate-link");
  if (!link || !certificateDialog.showModal) {
    return;
  }

  event.preventDefault();
  openCertificate(link);
});

document.querySelector(".certificate-close").addEventListener("click", closeCertificate);

certificateDialog.addEventListener("click", (event) => {
  if (event.target === certificateDialog) {
    closeCertificate();
  }
});

certificateDialog.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeCertificate();
  }
});

certificateDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeCertificate();
});

certificateDialog.addEventListener("close", () => {
  certificateViewer.removeAttribute("src");
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
