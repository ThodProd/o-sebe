const fs = require("fs");
const path = require("path");
const { app } = require("electron");

const APP_FOLDER = "О себе";
const CONFIG_FILE = "config.json";
const CONFIG_VERSION = 1;

function getConfigDir() {
  return path.join(app.getPath("documents"), APP_FOLDER);
}

function getConfigPath() {
  return path.join(getConfigDir(), CONFIG_FILE);
}

function ensureConfigDir() {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function readConfigFile() {
  ensureConfigDir();
  const configPath = getConfigPath();

  if (!fs.existsSync(configPath)) {
    return {
      version: CONFIG_VERSION,
      savedResumes: [],
      activeDraft: null,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const raw = fs.readFileSync(configPath, "utf-8");
    const parsed = JSON.parse(raw);

    return {
      version: CONFIG_VERSION,
      savedResumes: Array.isArray(parsed.savedResumes) ? parsed.savedResumes : [],
      activeDraft: parsed.activeDraft && typeof parsed.activeDraft === "object" ? parsed.activeDraft : null,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return {
      version: CONFIG_VERSION,
      savedResumes: [],
      activeDraft: null,
      updatedAt: new Date().toISOString(),
    };
  }
}

function writeConfigFile(payload) {
  ensureConfigDir();
  const savedResumes = Array.isArray(payload?.savedResumes) ? payload.savedResumes : [];
  const activeDraft = payload?.activeDraft && typeof payload.activeDraft === "object" ? payload.activeDraft : null;
  const config = {
    version: CONFIG_VERSION,
    savedResumes,
    activeDraft,
    updatedAt: new Date().toISOString(),
  };

  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), "utf-8");
  return getConfigPath();
}

module.exports = {
  getConfigDir,
  getConfigPath,
  readConfigFile,
  writeConfigFile,
};
