// Фрагмент electron/main.cjs — IPC file:printToPDF
// preload: printToPDF: (opts) => ipcRenderer.invoke("file:printToPDF", opts)

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
    const data = await win.webContents.printToPDF({
      pageSize: "A4",
      printBackground: true,
      margins: { marginType: "none" },
      preferCSSPageSize: true,
    });
    fs.writeFileSync(filePath, data);
    return { canceled: false, filePath };
  } catch (err) {
    return { canceled: false, error: String(err) };
  }
});
