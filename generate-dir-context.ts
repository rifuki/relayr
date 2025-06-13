import { readdirSync, statSync, writeFileSync } from "fs";
import { join, extname, relative } from "path";

const basePath = "/Users/rifuki/mgodonf/relayr/relayr-api";
const srcPath = join(basePath, "src");
const includeExtensions = [".rs"]; // hanya file TypeScript

function walk(dir: string): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);
  for (const file of list) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(walk(filePath));
    } else if (includeExtensions.includes(extname(file))) {
      results.push(filePath);
    }
  }
  return results;
}

function generateAnnotations(files: string[]): string {
  const relativePaths = files.map((fullPath) => relative(basePath, fullPath));
  const lines = [
    "#files:all",
    `#files:\`${basePath}/\``,
    ...relativePaths.map(
      (relPath) => `#file:\`src/${relPath.replace(/^src[\\/]/, "")}\``,
    ),
  ];
  return lines.join("\n");
}

const allFiles = walk(srcPath);
const output = generateAnnotations(allFiles);
writeFileSync("copilot-files.txt", output);

console.log("✅ File copilot-files.txt berhasil dibuat!");
