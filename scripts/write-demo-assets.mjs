import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function write(rel, contents) {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
}

function svg(view, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}" role="img">${body}</svg>\n`;
}

write(
  "public/demo/avatars/luna.svg",
  svg(
    "0 0 200 200",
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F97316"/><stop offset="1" stop-color="#FB7185"/></linearGradient></defs><rect width="200" height="200" fill="#111827"/><circle cx="100" cy="100" r="78" fill="url(#g)"/><circle cx="70" cy="84" r="10" fill="#fff"/><circle cx="126" cy="84" r="10" fill="#fff"/><path d="M70 128c18 18 42 18 60 0" stroke="#fff" stroke-width="8" fill="none"/>`,
  ),
);
write(
  "public/demo/avatars/cafe.svg",
  svg(
    "0 0 200 200",
    `<rect width="200" height="200" fill="#1c1917"/><rect x="48" y="70" width="104" height="78" rx="16" fill="#F59E0B"/><rect x="86" y="42" width="28" height="28" fill="#FBBF24"/><path d="M152 88c18 0 18 42 0 42" stroke="#FDE68A" stroke-width="10" fill="none"/>`,
  ),
);
write(
  "public/demo/avatars/city.svg",
  svg(
    "0 0 200 200",
    `<rect width="200" height="200" fill="#0f172a"/><rect x="28" y="70" width="36" height="110" fill="#38bdf8"/><rect x="78" y="40" width="44" height="140" fill="#818cf8"/><rect x="136" y="88" width="36" height="92" fill="#22d3ee"/>`,
  ),
);
write(
  "public/demo/avatars/garden.svg",
  svg(
    "0 0 200 200",
    `<rect width="200" height="200" fill="#052e16"/><circle cx="100" cy="92" r="36" fill="#4ade80"/><rect x="94" y="92" width="12" height="70" fill="#166534"/><circle cx="64" cy="118" r="18" fill="#86efac"/><circle cx="136" cy="118" r="18" fill="#86efac"/>`,
  ),
);
write(
  "public/demo/avatars/private.svg",
  svg(
    "0 0 200 200",
    `<rect width="200" height="200" fill="#1f2937"/><rect x="58" y="92" width="84" height="64" rx="12" fill="#9ca3af"/><path d="M74 92v-18a26 26 0 0 1 52 0v18" stroke="#d1d5db" stroke-width="10" fill="none"/>`,
  ),
);
write(
  "public/demo/avatars/down.svg",
  svg(
    "0 0 200 200",
    `<rect width="200" height="200" fill="#450a0a"/><path d="M40 140 L100 48 L160 140Z" fill="#f87171"/><rect x="92" y="88" width="16" height="32" fill="#450a0a"/><circle cx="100" cy="132" r="8" fill="#450a0a"/>`,
  ),
);
write(
  "public/demo/avatars/fallback.svg",
  svg(
    "0 0 200 200",
    `<rect width="200" height="200" fill="#e7e5e4"/><circle cx="100" cy="80" r="28" fill="#a8a29e"/><ellipse cx="100" cy="150" rx="52" ry="28" fill="#a8a29e"/>`,
  ),
);

const stories = {
  "luna-sunrise": ["#0ea5e9", "Восход"],
  "luna-market": ["#f97316", "Рынок"],
  "luna-train": ["#6366f1", "Поезд"],
  "cafe-pour": ["#b45309", "Кортадо"],
  "cafe-window": ["#1e3a8a", "Дождь"],
  "city-bridge": ["#0f766e", "Мост"],
  "city-metro": ["#6d28d9", "Метро"],
  "city-skyline": ["#1e293b", "Туман"],
  "private-hidden": ["#111827", "Скрыто"],
};

for (const [name, [color, label]] of Object.entries(stories)) {
  write(
    `public/demo/stories/${name}.svg`,
    svg(
      "0 0 720 1280",
      `<rect width="720" height="1280" fill="${color}"/><circle cx="360" cy="520" r="160" fill="#fff" fill-opacity=".16"/><text x="360" y="900" text-anchor="middle" font-size="48" fill="#fff" font-family="sans-serif">${label}</text>`,
    ),
  );
}

console.log("Wrote demo SVG assets");
