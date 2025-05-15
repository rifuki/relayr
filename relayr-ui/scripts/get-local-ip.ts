import os from "os";

function getLocalExternalIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface!) {
      if (config.family === "IPv4" && !config.internal) {
        console.log(config.address);
        return;
      }
    }
  }
}

getLocalExternalIP();
