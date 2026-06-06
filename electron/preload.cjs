const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  loadConfigs: () => ipcRenderer.invoke("config:load"),
  saveConfigs: (payload) => ipcRenderer.invoke("config:save", payload),
  getConfigPath: () => ipcRenderer.invoke("config:getPath"),
  focusWindow: () => ipcRenderer.invoke("window:focus"),
  createTempFile: (ext) => ipcRenderer.invoke("file:createTemp", { ext }),
  writeTempChunk: (opts) => ipcRenderer.invoke("file:writeTempChunk", opts),
  saveFileWithDialog: (opts) => ipcRenderer.invoke("file:saveWithDialog", opts),
  printToPDF: (opts) => ipcRenderer.invoke("file:printToPDF", opts),
  printResume: () => ipcRenderer.invoke("print:resume"),
});
