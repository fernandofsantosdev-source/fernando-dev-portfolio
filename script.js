const menuToggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const themeToggle = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon use");
const announcement = document.querySelector("#announcement");
const projectDialog = document.querySelector(".project-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector(".dialog-description");
const dialogTags = document.querySelector(".dialog-tags");
const certificateDialog = document.querySelector("#certificate-dialog");

const projects = {
  testes: {
    title: "Sistema de Testes Web",
    description:
      "Projeto de portfólio com casos de teste, relatórios de bugs e evidências de testes em uma aplicação web. A proposta é demonstrar organização de cenários e atenção à qualidade do produto.",
    tags: ["QA", "Testes", "Web"],
  },
  financeiro: {
    title: "Assistente Financeiro Local",
    description:
      "Aplicação em Python com IA local (Ollama) para apoiar o controle financeiro. A ideia inclui acompanhamento de gastos, gráficos e metas usando armazenamento local.",
    tags: ["Python", "IA", "SQLite", "Streamlit"],
  },
  vendas: {
    title: "Dashboard de Vendas",
    description:
      "Dashboard interativo em Power BI para explorar dados de vendas, visualizar indicadores e apresentar insights que apoiem a tomada de decisão.",
    tags: ["Power BI", "Excel", "SQL"],
  },
};

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute("aria-label", isExpanded ? "Abrir menu" : "Fechar menu");
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    navigation.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menu");
  }
});

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.toggle("light-theme");
  themeIcon.setAttribute("href", isLight ? "#icon-sun" : "#icon-moon");
  themeToggle.setAttribute("aria-label", isLight ? "Ativar tema escuro" : "Ativar tema claro");
  document.querySelector('meta[name="theme-color"]').content = isLight ? "#f5f6f8" : "#08090b";
  announcement.textContent = isLight ? "Tema claro ativado." : "Tema escuro ativado.";
});

document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("click", () => {
    const project = projects[card.dataset.project];
    if (!project) {
      return;
    }

    dialogTitle.textContent = project.title;
    dialogDescription.textContent = project.description;
    dialogTags.replaceChildren(
      ...project.tags.map((tag) => {
        const element = document.createElement("i");
        element.textContent = tag;
        return element;
      }),
    );
    projectDialog.showModal();
  });
});

document.querySelector(".dialog-close").addEventListener("click", () => {
  projectDialog.close();
});

projectDialog.addEventListener("click", (event) => {
  if (event.target === projectDialog) {
    projectDialog.close();
  }
});

document.querySelector(".skill-certificate").addEventListener("click", () => {
  certificateDialog.showModal();
});

document.querySelector(".certificate-close").addEventListener("click", () => {
  certificateDialog.close();
});

certificateDialog.addEventListener("click", (event) => {
  if (event.target === certificateDialog) {
    certificateDialog.close();
  }
});

document.querySelector(".download-cv").addEventListener("click", () => {
  const resume = [
    "Fernando Santos",
    "Estudante de Análise e Desenvolvimento de Sistemas",
    "",
    "OBJETIVO",
    "Busco minha primeira oportunidade na área de tecnologia, com interesse em desenvolvimento de software e QA.",
    "",
    "HABILIDADES",
    "Python, JavaScript, SQL, Git e GitHub, QA e testes, HTML e CSS, Power BI, Excel e lógica de programação.",
    "",
    "PROJETOS",
    ...Object.values(projects).flatMap((project) => [
      project.title,
      project.description,
      "",
    ]),
    "Localização: Brasil",
  ].join("\n");
  const file = new Blob([resume], { type: "text/plain;charset=utf-8" });
  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = "curriculo-fernando-santos.txt";
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
  announcement.textContent = "Currículo em texto baixado.";
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
