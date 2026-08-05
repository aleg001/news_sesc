#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, "..");
const newsPath = path.join(repositoryRoot, "news.json");
const expectedId = process.argv[2];
const expectedAsset = process.argv[3];
const rawAssetPrefix = "https://raw.githubusercontent.com/aleg001/news_sesc/main/assets/";
const errors = [];

let source;
let news;

try {
  source = fs.readFileSync(newsPath, "utf8");
  news = JSON.parse(source);
} catch (error) {
  console.error(`No se pudo leer news.json: ${error.message}`);
  process.exit(1);
}

if (!Array.isArray(news)) {
  console.error("news.json debe contener un arreglo.");
  process.exit(1);
}

const ids = new Set();

function isValidDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;
  const [, day, month, year] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

for (const [index, entry] of news.entries()) {
  const location = `Entrada ${index + 1}`;

  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    errors.push(`${location}: debe ser un objeto.`);
    continue;
  }

  for (const field of ["id", "title", "content", "date"]) {
    if (typeof entry[field] !== "string" || entry[field].trim() === "") {
      errors.push(`${location}: falta el campo de texto ${field}.`);
    }
  }

  if (typeof entry.id === "string") {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id)) {
      errors.push(`${location}: id inválido (${entry.id}).`);
    }
    if (ids.has(entry.id)) errors.push(`${location}: id duplicado (${entry.id}).`);
    ids.add(entry.id);
  }

  if (typeof entry.date === "string" && !isValidDate(entry.date)) {
    errors.push(`${location}: fecha inválida (${entry.date}).`);
  }

  if (typeof entry.content === "string" && !/^<p>[\s\S]*<\/p>$/.test(entry.content)) {
    errors.push(`${location}: content debe iniciar y terminar con párrafos HTML.`);
  }

  const isTikTok = entry.type === "tiktok";
  if (isTikTok) {
    if (typeof entry.tiktokUrl !== "string" || !entry.tiktokUrl.startsWith("https://www.tiktok.com/")) {
      errors.push(`${location}: tiktokUrl inválida.`);
    }
  } else if (typeof entry.imageUrl !== "string" || entry.imageUrl.trim() === "") {
    errors.push(`${location}: falta imageUrl.`);
  }

  if (typeof entry.imageUrl === "string" && entry.imageUrl.startsWith(rawAssetPrefix)) {
    const assetName = decodeURIComponent(entry.imageUrl.slice(rawAssetPrefix.length));
    if (assetName.includes("/") || assetName.includes("\\")) {
      errors.push(`${location}: nombre de asset inválido (${assetName}).`);
    } else if (!fs.existsSync(path.join(repositoryRoot, "assets", assetName))) {
      errors.push(`${location}: no existe assets/${assetName}.`);
    }
  }
}

if (expectedId) {
  const matches = news.filter((entry) => entry?.id === expectedId);
  if (matches.length !== 1) {
    errors.push(`Debe existir exactamente una entrada con id ${expectedId}.`);
  } else {
    const entry = matches[0];
    if (typeof entry.imageUrl !== "string" || !entry.imageUrl.startsWith(rawAssetPrefix)) {
      errors.push(`La noticia nueva ${expectedId} debe usar una imagen local de GitHub Raw.`);
    }
    if (typeof entry.title === "string" && /<[^>]+>/.test(entry.title)) {
      errors.push(`El título de ${expectedId} no debe contener HTML.`);
    }
    if (expectedAsset) {
      const normalizedAsset = expectedAsset.replace(/^assets\//, "");
      if (entry.imageUrl !== `${rawAssetPrefix}${normalizedAsset}`) {
        errors.push(`La imagen de ${expectedId} no coincide con ${expectedAsset}.`);
      }
    }
  }
}

if (!source.endsWith("\n")) {
  errors.push("news.json debe terminar con un salto de línea.");
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(`news.json válido: ${news.length} publicaciones${expectedId ? `; ${expectedId} lista para publicar` : ""}.`);
