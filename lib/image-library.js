import fs from "node:fs";
import path from "node:path";
import { cache } from "react";

const IMAGE_ROOT = path.join(process.cwd(), "public", "images");

const MEMBER_DIRS = {
  diana: "嘉然",
  eileen: "乃琳",
  bella: "贝拉",
  xinyi: "心宜",
  sinuo: "思诺",
};

const TEAM_DIRS = {
  asoul: "asoul",
  xiaoxinsi: "小心思",
};

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

function isImageFile(filename) {
  const lower = filename.toLowerCase();
  return [...IMAGE_EXTENSIONS].some((extension) => lower.endsWith(extension));
}

function toPublicUrl(...parts) {
  return `/${parts.map((part) => String(part).replace(/\\/g, "/")).join("/")}`;
}

function readImageUrls(directoryName) {
  const directoryPath = path.join(IMAGE_ROOT, directoryName);
  if (!fs.existsSync(directoryPath)) {
    return [];
  }

  return fs
    .readdirSync(directoryPath, { withFileTypes: true })
    .filter((entry) => entry.isFile() && isImageFile(entry.name))
    .map((entry) => toPublicUrl("images", directoryName, entry.name))
    .sort((left, right) => left.localeCompare(right, "zh-CN"));
}

const loadImageLibrary = cache(() => {
  const members = Object.fromEntries(
    Object.entries(MEMBER_DIRS).map(([memberId, directoryName]) => [memberId, readImageUrls(directoryName)]),
  );

  const teams = Object.fromEntries(
    Object.entries(TEAM_DIRS).map(([teamId, directoryName]) => [teamId, readImageUrls(directoryName)]),
  );

  return {
    members,
    teams,
    allGroups: [...teams.asoul, ...teams.xiaoxinsi],
  };
});

function hashSeed(seed) {
  let value = 0;
  for (let index = 0; index < seed.length; index += 1) {
    value = (value * 33 + seed.charCodeAt(index)) >>> 0;
  }
  return value;
}

function pickBySeed(items, seed, fallback = null) {
  if (!Array.isArray(items) || items.length === 0) {
    return fallback;
  }

  const pickedIndex = hashSeed(seed) % items.length;
  return items[pickedIndex];
}

export function getImageLibrarySnapshot() {
  return loadImageLibrary();
}

export function getDailyImageSet(seedDate) {
  const library = loadImageLibrary();
  const groupPool = library.allGroups.length > 0 ? library.allGroups : [...library.teams.asoul];

  return {
    members: Object.fromEntries(
      Object.entries(library.members).map(([memberId, images]) => [
        memberId,
        pickBySeed(images, `${seedDate}:${memberId}`, null),
      ]),
    ),
    groups: {
      hero: pickBySeed(groupPool, `${seedDate}:group:hero`, null),
      feature: pickBySeed(groupPool, `${seedDate}:group:feature`, null),
      feedback: pickBySeed(groupPool, `${seedDate}:group:feedback`, null),
      empty: pickBySeed(groupPool, `${seedDate}:group:empty`, null),
      asoul: pickBySeed(library.teams.asoul, `${seedDate}:team:asoul`, null),
      xiaoxinsi: pickBySeed(library.teams.xiaoxinsi, `${seedDate}:team:xiaoxinsi`, null),
    },
  };
}
