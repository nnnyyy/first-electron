// 파일 드래그 앤 드랍 
// https://www.geeksforgeeks.org/drag-and-drop-files-in-electronjs/

// 일렉트론에서 백그라운드 작업 스레드 만드는 방법
// https://www.electronjs.org/docs/latest/tutorial/multithreading
// https://medium.com/swlh/how-to-run-background-worker-processes-in-an-electron-app-e0dc310a93cc
// 1. Web workers - 렌더러의 DOM에 접근 불가. 어떤 종류의 UI 조작도 불가, 파일시스템 등 로컬 리소스에 접근 불가
// 2. hidden renderers - DOM 접근 가능.  IPC 를 통해 보이는 렌더러 프로세스와 통신 가능. 

const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron')
// BrowserWindow : 응용 프로그램 창을 만들고 관리
// app : Electron 의 수명 주기 제어
const path = require('path')

async function handleFileOpen() {
    const { canceled, filePaths } = await dialog.showOpenDialog()
    if( canceled ) return
    else return filePaths[0]
}

function onCounterValue(e, val) {
    console.log('counter value:', val)
}

let mainRenderer, workerRenderer
function createMainWindow() {
    return new BrowserWindow({ 
        width: 800, height: 600, 
        webPreferences: { 
            preload: path.join(__dirname, 'preload.js')
        },
        //  frame: false // 프레임 없는 창 생성
     })    
}

function createWorkerWindow() {
    return new BrowserWindow({ 
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preloadForWorker.js'),
            nodeIntegration: true
        }
    })
}

const createWindow = () => {

    //  하나의 렌더러 프로세스 생성
    mainRenderer = createMainWindow()
    workerRenderer = createWorkerWindow()

    const menu = Menu.buildFromTemplate([
        {
            label: app.name,
            submenu: [
                {
                    label: 'Increment',
                    click: ()=>mainRenderer.webContents.send('update-counter', 1),
                    accelerator: process.platform === 'darwin' ? 'Alt+Cmd+I' : 'Alt+Shift+I'
                }
            ]
        }
    ])
    Menu.setApplicationMenu(menu)
    mainRenderer.loadFile('index.html')
    workerRenderer.loadFile('worker.html')

    //  디버그 창
    mainRenderer.webContents.openDevTools() 
}

// hot reload
// 5 이하 버전에서는 electron-reload 를 쓰는 듯 하다
if( process.env !== 'production' ) {
    require('electron-reloader')(module, {
        debug: true, watchRenderer: true
    })
}

//  앱 진입점
(async ()=> {
    console.log('start app')
    await app.whenReady()
    ipcMain.on('counter-value', onCounterValue)
    ipcMain.on('set-title', (event, title) => {
        const webContents = event.sender
        const win = BrowserWindow.fromWebContents(webContents)
        win.setTitle(title)
    })
    ipcMain.on('ondragstart', (event, name)=> {
        const webContents = event.sender
        webContents.startDrag({
            file: path.join(__dirname, name),
            icon: 'testIcon.jpg'
        })
    })
    ipcMain.on('send-test-message', (event, msg)=>  {
        mainRenderer.setTitle(msg)
    })
    ipcMain.handle('dialog:openFile', handleFileOpen)
    createWindow()

    app.on('window-all-closed', ()=> {
        if( process.platform !== 'darwin' ) app.quit()
    })
})()

