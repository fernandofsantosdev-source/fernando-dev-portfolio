import { watch, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDirectory = fileURLToPath(new URL("../", import.meta.url));
const certificatesDirectory = join(projectDirectory, "certificados");
const catalogPath = join(certificatesDirectory, "catalogo.js");
const isOneShot = process.argv.includes("--once");

const certificateDetails = new Map([
  [
    "git-e-github.pdf",
    {
      title: "Git e GitHub",
      dialogTitle: "Git e GitHub — Curso em Vídeo",
      kind: "Versionamento",
      institution: "Curso em Vídeo",
      institutionLogo: "assets/curso-em-video-logo.png",
      workload: "20 horas",
      status: "Concluído",
    },
  ],
  [
    "jornada-profissional-qa.pdf",
    {
      title: "A Jornada do Profissional de QA",
      dialogTitle: "A Jornada do Profissional de QA",
      kind: "Qualidade de software",
      description: "Certificado em PDF",
      status: "Certificado disponível",
    },
  ],
]);

function escapeCatalogScript(catalog) {
  return `window.portfolioCertificates = ${JSON.stringify(catalog).replaceAll("<", "\\u003c")};\n`;
}

function titleFromFileName(fileName) {
  const name = basename(fileName, extname(fileName))
    .replace(/^certificados?(?:[\s_-]+de)?[\s_-]+/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLocaleLowerCase("pt-BR")
    .replace(/(^|[\s([{])\p{L}/gu, (match) => match.toLocaleUpperCase("pt-BR"));

  return name
    .replace(/\b(De|Da|Do|Das|Dos|E|Em|Para|Com)\b/g, (word) => word.toLowerCase())
    .replace(/\bJavascript\b/gi, "JavaScript")
    .replace(/\bGithub\b/gi, "GitHub")
    .replace(/\bQa\b/gi, "QA")
    .replace(/\bSql\b/gi, "SQL")
    .replace(/\bHtml\b/gi, "HTML")
    .replace(/\bCss\b/gi, "CSS");
}

async function updateCatalog() {
  const entries = await readdir(certificatesDirectory, { withFileTypes: true });
  const pdfFiles = entries
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".pdf")
    .map((entry) => entry.name)
    .sort((first, second) => first.localeCompare(second, "pt-BR", { sensitivity: "base" }));

  const catalog = pdfFiles.map((fileName) => {
    const details = certificateDetails.get(fileName.toLowerCase());
    const title = details?.title ?? titleFromFileName(fileName);
    const source = `certificados/${encodeURIComponent(fileName)}`;

    return {
      title,
      dialogTitle: details?.dialogTitle ?? title,
      kind: details?.kind ?? "Certificado",
      description: details ? details.description ?? null : "Certificado em PDF",
      institution: details?.institution ?? null,
      institutionLogo: details?.institutionLogo ?? null,
      workload: details?.workload ?? null,
      status: details?.status ?? "Certificado disponível",
      source,
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
    console.log(`Catálogo atualizado: ${catalog.length} certificado(s).`);
    return;
  }

  console.log(`Catálogo conferido: ${catalog.length} certificado(s).`);
}

await updateCatalog();

if (!isOneShot) {
  const watcher = await watch(certificatesDirectory);
  console.log(`Monitorando novos PDFs em ${certificatesDirectory}`);

  let debounceTimer;
  for await (const { eventType, filename: fileName } of watcher) {
    if (fileName && extname(String(fileName)).toLowerCase() !== ".pdf") {
      continue;
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateCatalog().catch((error) => {
        console.error("Erro ao atualizar o catálogo de certificados:", error);
      });
    }, eventType === "rename" ? 300 : 500);
  }
}
