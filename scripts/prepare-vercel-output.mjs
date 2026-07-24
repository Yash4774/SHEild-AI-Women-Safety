import { cpSync, existsSync, rmSync } from "node:fs";

const copies = [
  ["apps/web/build", "build"],
  ["apps/web/.vercel", ".vercel"],
];

for (const [source, target] of copies) {
  if (!existsSync(source)) {
    throw new Error(`Expected Vercel output source missing: ${source}`);
  }
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
  }
  cpSync(source, target, { recursive: true, force: true });
}
