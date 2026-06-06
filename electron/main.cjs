const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { readConfigFile, writeConfigFile, getConfigPath } = require("./configStore.cjs");

const isDev = process.env.ELECTRON_DEV === "1";
const iconPath = path.join(__dirname, "../ICON.ico");

function registerConfigHandlers() {
  ipcMain.handle("config:load", () => {
    const config = readConfigFile();
    return {
      savedResumes: config.savedResumes,
      activeDraft: config.activeDraft,
    };
  });

  ipcMain.handle("config:save", (_event, payload) => {
    return writeConfigFile(payload);
  });

  ipcMain.handle("config:getPath", () => getConfigPath());

  ipcMain.handle("window:focus", (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (win) {
      win.show();
      win.focus();
      win.webContents.focus();
    }
  });

  ipcMain.handle("file:saveWithDialog", async (event, { defaultName, filters, tempPath }) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const safeName = path.basename(String(defaultName || "resume"));
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: "Сохранить файл",
      defaultPath: path.join(app.getPath("documents"), safeName),
      filters: Array.isArray(filters) && filters.length > 0 ? filters : [{ name: "Все файлы", extensions: ["*"] }],
    });

    if (canceled || !filePath) {
      if (tempPath) {
        try {
          fs.unlinkSync(tempPath);
        } catch {
          // ignore
        }
      }
      return { canceled: true };
    }

    try {
      fs.copyFileSync(tempPath, filePath);
      fs.unlinkSync(tempPath);
      return { canceled: false, filePath };
    } catch (err) {
      return { canceled: false, error: String(err) };
    }
  });

  ipcMain.handle("file:writeTempChunk", async (_event, { tempPath, chunk, append }) => {
    try {
      const buffer = Buffer.from(Array.isArray(chunk) ? chunk : []);
      if (append) {
        fs.appendFileSync(tempPath, buffer);
      } else {
        fs.writeFileSync(tempPath, buffer);
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: String(err) };
    }
  });

  ipcMain.handle("file:createTemp", async (_event, { ext }) => {
    const extension = String(ext || ".bin");
    const tempPath = path.join(os.tmpdir(), `resume_export_${Date.now()}${extension}`);
    return { tempPath };
  });

  ipcMain.handle("print:resume", async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) return { success: false, failureReason: "Окно не найдено" };

    return new Promise((resolve) => {
      win.webContents.print(
        {
          silent: false,
          printBackground: true,
          pageSize: "A4",
        },
        (success, failureReason) => {
          resolve({ success, failureReason: failureReason || null });
        }
      );
    });
  });

  ipcMain.handle("file:printToPDF", async (event, { defaultName }) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const safeName = path.basename(String(defaultName || "resume.pdf"));
    const { canceled, filePath } = await dialog.showSaveDialog(win, {
      title: "Сохранить PDF",
      defaultPath: path.join(app.getPath("documents"), safeName),
      filters: [
        { name: "PDF", extensions: ["pdf"] },
        { name: "Все файлы", extensions: ["*"] },
      ],
    });

    if (canceled || !filePath) return { canceled: true };

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const data = await win.webContents.printToPDF({
        pageSize: "A4",
        printBackground: true,
        margins: { marginType: "none" },
        preferCSSPageSize: false,
        displayHeaderFooter: false,
      });
      fs.writeFileSync(filePath, data);
      return { canceled: false, filePath };
    } catch (err) {
      return { canceled: false, error: String(err) };
    }
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: "О себе",
    icon: iconPath,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  registerConfigHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
