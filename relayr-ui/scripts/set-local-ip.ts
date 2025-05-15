import os from "os";
import fs from "fs";
import path from "path";

const PORT = 9001;
const ENV_PATH = path.resolve(__dirname, "../.env.local");

function getLocalExternalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface!) {
      if (config.family === "IPv4" && !config.internal) {
        console.log(config.address);
        return config.address;
      }
    }
  }
  return "localhost";
}

function updateEnvFile(ip: string) {
  const newLine = `NEXT_PUBLIC_API_SOCKET_ADDRESS=${ip}:${PORT}`;

  let content = "";

  if (fs.existsSync(ENV_PATH)) {
    const lines = fs.readFileSync(ENV_PATH, "utf-8").split("\n");

    const filtered = lines.filter(
      (line) => !line.startsWith("NEXT_PUBLIC_API_SOCKET_ADDRESS="),
    );
    filtered.push(newLine);
    content = filtered.join("\n");
  } else {
    content = newLine;
  }

  fs.writeFileSync(ENV_PATH, content);
  console.log(`✅ .env.local updated: ${newLine}`);
}

const ip = getLocalExternalIP();
updateEnvFile(ip);
