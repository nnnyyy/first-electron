const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('electronAPI', {
    sendTestWorkerMessage: (msg)=> ipcRenderer.send('send-test-message', msg)
})