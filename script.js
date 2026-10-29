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
const cinematicSections = [...document.querySelectorAll(".cinematic-section")];
const welcomeScreen = document.querySelector("#welcome-screen");
const welcomeSkip = document.querySelector(".welcome-skip");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const welcomeFadeDuration = reducedMotion ? 1 : 450;
const portfolioConfig = {
  resumeUrl: "",
  email: "",
  linkedin: "",
  presentation: {
    type: "",
    src: "",
    alt: "",
  },
};

function setConfiguredUrl(link, value, label) {
  const configuredValue = value.trim();
  if (!configuredValue) {
    return false;
  }

  try {
    const url = new URL(configuredValue, window.location.href);
    if (!["https:", "http:"].includes(url.protocol)) {
      console.error(`O link de ${label} precisa usar HTTP ou HTTPS.`);
      return false;
    }

    link.href = url.href;
    link.hidden = false;
    return true;
  } catch (error) {
    console.error(`O link configurado para ${label} não é uma URL válida.`, error);
    return false;
  }
}

function configurePortfolioLinks() {
  setConfiguredUrl(document.querySelector("#resume-link"), portfolioConfig.resumeUrl, "currículo");

  document.querySelectorAll(".project-showcase-card").forEach((card) => {
    const repositoryLink = card.querySelector(".project-repository-link");
    setConfiguredUrl(repositoryLink, card.dataset.repository ?? "", "repositório do projeto");
  });

  const email = portfolioConfig.email.trim();
  if (email) {
    const emailLink = document.querySelector(".contact-email");
    emailLink.href = `mailto:${email}`;
    emailLink.hidden = false;
  }

  setConfiguredUrl(document.querySelector(".contact-linkedin"), portfolioConfig.linkedin, "LinkedIn");
}

function configurePresentationMedia() {
  const presentationPlayer = document.querySelector(".presentation-player");
  const placeholder = presentationPlayer.querySelector(".video-placeholder");
  const { type, src, alt } = portfolioConfig.presentation;

  if (!src) {
    return;
  }

  let mediaUrl;
  try {
    mediaUrl = new URL(src, window.location.href);
  } catch (error) {
    console.error("O caminho do vídeo ou da foto de apresentação não é válido.", error);
    return;
  }

  if (!["http:", "https:", "file:"].includes(mediaUrl.protocol)) {
    console.error("A mídia de apresentação precisa usar um arquivo local ou uma URL HTTP/HTTPS.");
    return;
  }

  if (type === "video") {
    const video = presentationPlayer.querySelector(".presentation-video");
    video.src = mediaUrl.href;
    video.hidden = false;
  } else if (type === "photo") {
    if (!alt.trim()) {
      console.error("Informe um texto alternativo para a foto de apresentação.");
      return;
    }

    const photo = presentationPlayer.querySelector(".presentation-photo");
    photo.src = mediaUrl.href;
    photo.alt = alt.trim();
    photo.hidden = false;
  } else {
    console.error('O tipo de mídia de apresentação deve ser "video" ou "photo".');
    return;
  }

  placeholder.hidden = true;
  presentationPlayer.querySelector(".video-caption").hidden = false;
}

configurePortfolioLinks();
configurePresentationMedia();

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

  skillsTabs.forEach((tab, index) => {
    const isSelected = index === selectedIndex;
    tab.setAttribute("aria-selected", String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
    skillsPanels[index].hidden = !isSelected;
  });

  skillsTabList.dataset.activeTab = String(selectedIndex);
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

    const isCompleted = certificate.status === "Concluído";
    const status = document.createElement("p");
    status.className = `formation-status ${isCompleted ? "formation-status-complete" : "formation-status-available"}`;
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

    if (certificate.institution) {
      const institution = document.createElement("span");
      institution.className = "formation-institution";
      institution.textContent = certificate.institution;
      provider.append(institution);
    }

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
