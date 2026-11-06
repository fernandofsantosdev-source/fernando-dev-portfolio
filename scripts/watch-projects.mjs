import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = fileURLToPath(new URL("../", import.meta.url));
const projectsDirectory = join(projectDirectory, "projetos");
const catalogPath = join(projectsDirectory, "catalogo.js");
const isOneShot = process.argv.includes("--once");

const projectDetails = new Map([
  [
    "apresentacao_projeto_cashsave.pdf",
    {
      title: "Cash Save",
      description: "Aplicação financeira com fluxo organizado em interface, estado e serviços. A apresentação mostra autenticação e dados via Xano, relatórios em PDF com ReportLab e integração opcional com Ollama local.",
      status: "Concluído",
      tags: ["Python", "Reflex", "Xano", "ReportLab", "Ollama (opcional)"],
      repository: "",
    },
  ],
  [
    "assistente-financeiro-local.pdf",
    {
      title: "Assistente Financeiro Local",
      description: "Aplicação desktop para controle financeiro pessoal, com análise de gastos e metas.",
      status: "Em desenvolvimento",
      tags: ["Python", "SQLite", "PyQt", "Pandas"],
    },
  ],
  [
    "dashboard-de-vendas.pdf",
    {
      title: "Dashboard de Vendas",
      description: "Painel para visualização de dados de vendas com gráficos e indicadores de desempenho.",
      status: "Planejado",
      tags: ["Python", "Power BI", "SQL", "Matplotlib"],
    },
  ],
  [
    "sistema-de-testes-web.pdf",
    {
      title: "Sistema de Testes Web",
      description: "Plataforma para criação e execução de testes manuais e automatizados, com relatórios e exemplos de testes.",
      status: "Em desenvolvimento",
      tags: ["Python", "Selenium", "HTML", "CSS"],
    },
  ],
]);

function escapeCatalogScript(catalog) {
  return `window.portfolioProjects = ${JSON.stringify(catalog).replaceAll("<", "\\u003c")};\n`;
}

function normalizeProjectName(value) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromFileName(fileName) {
  const rawName = basename(fileName, extname(fileName));
  const normalized = normalizeProjectName(rawName)
    .replace(/^apresentacao(?:[\s_-]+do)?[\s_-]+projeto[\s_-]+/i, "")
    .replace(/^projeto[\s_-]+/i, "")
    .replace(/^apresentacao[\s_-]+/i, "")
    .trim();

  const title = normalized
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|\s)\p{L}/gu, (match) => match.toLocaleUpperCase("pt-BR"))
    .replace(/\b(De|Da|Do|Das|Dos|E|Em|Para|Com|Do|A|As|Os)\b/g, (word) => word.toLowerCase())
    .replace(/\bJavascript\b/gi, "JavaScript")
    .replace(/\bGithub\b/gi, "GitHub")
    .replace(/\bQa\b/gi, "QA")
    .replace(/\bSql\b/gi, "SQL")
    .replace(/\bHtml\b/gi, "HTML")
    .replace(/\bCss\b/gi, "CSS")
    .replace(/\bPowerbi\b/gi, "Power BI")
    .replace(/\bPyqt\b/gi, "PyQt")
    .replace(/\bPandas\b/gi, "Pandas")
    .replace(/\s+/g, " ")
    .trim();

  return title || "Projeto em PDF";
}

function inferStatus(fileName, title) {
  const haystack = `${fileName} ${title}`.toLocaleLowerCase("pt-BR");

  if (/planejado|dashboard|vendas|futuro|roadmap|backlog/.test(haystack)) {
    return "Planejado";
  }

  return "Em desenvolvimento";
}

function inferTags(title, fileName) {
  const normalizedKey = basename(fileName, extname(fileName)).toLowerCase();
  const details = projectDetails.get(normalizedKey + ".pdf") ?? projectDetails.get(normalizedKey.toLowerCase() + ".pdf");

  if (details?.tags) {
    return details.tags;
  }

  return ["Python", "JavaScript", "SQL"];
}

function inferDescription(title, fileName) {
  const normalizedKey = basename(fileName, extname(fileName)).toLowerCase();
  const details = projectDetails.get(normalizedKey + ".pdf") ?? projectDetails.get(normalizedKey.toLowerCase() + ".pdf");

  if (details?.description) {
    return details.description;
  }

  return `Projeto em PDF sobre ${title}.`;
}

async function updateCatalog() {
  const entries = await readdir(projectsDirectory, { withFileTypes: true });
  const pdfFiles = entries
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".pdf")
    .map((entry) => entry.name)
    .filter((fileName) => fileName.toLowerCase() !== "catalogo.js")
    .sort((first, second) => first.localeCompare(second, "pt-BR", { sensitivity: "base" }));

  const catalog = pdfFiles.map((fileName) => {
    const normalizedKey = basename(fileName, extname(fileName)).toLowerCase();
    const explicitDetails = projectDetails.get(normalizedKey + ".pdf") ?? projectDetails.get(normalizedKey.toLowerCase() + ".pdf");
    const title = explicitDetails?.title ?? titleFromFileName(fileName);
    const source = `projetos/${encodeURIComponent(fileName)}`;
    const status = explicitDetails?.status ?? inferStatus(fileName, title);

    return {
      title,
      dialogTitle: title,
      description: explicitDetails?.description ?? inferDescription(title, fileName),
      source,
      status,
      tags: explicitDetails?.tags ?? inferTags(title, fileName),
      repository: explicitDetails?.repository ?? "",
    };
  });

  const generatedCatalog = escapeCatalogScript(catalog);
  let existingCatalog;

  try {
    existingCatalog = await readFile(catalogPath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  if (existingCatalog !== generatedCatalog) {
    await writeFile(catalogPath, generatedCatalog, "utf8");
    console.log(`Catálogo atualizado: ${catalog.length} projeto(s).`);
    return;
  }

  console.log(`Catálogo conferido: ${catalog.length} projeto(s).`);
}

await updateCatalog();

if (!isOneShot) {
  const watcher = await import("node:fs/promises").then((fs) => fs.watch(projectsDirectory));
  console.log(`Monitorando novos PDFs em ${projectsDirectory}`);

  let debounceTimer;
  for await (const { eventType, filename: fileName } of watcher) {
    if (fileName && extname(String(fileName)).toLowerCase() !== ".pdf") {
      continue;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateCatalog().catch((error) => {
        console.error("Erro ao atualizar o catálogo de projetos:", error);
      });
    }, eventType === "rename" ? 300 : 500);
  }
}
