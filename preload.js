const { contextBridge, ipcRenderer } = require('electron');

// Expose functions to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    generateNumbers: (data) => ipcRenderer.invoke('generate-numbers', data),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
    readFileData: (filePath) => ipcRenderer.invoke('read-file-data', filePath),
});
