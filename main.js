const { app, BrowserWindow, ipcMain } = require('electron');

const fs = require('fs');

let win;

function createWindow() {
    // Create the browser window
    win = new BrowserWindow({
        width: 980,
        height: 600,
        backgroundColor: '#ffffff',
        webPreferences: { nodeIntegration: true }
    });

    win.loadURL(`file://${__dirname}/dist/sql-to-sit-editor/index.html`);

    win.on('closed', function() {
        // set win to null to avoid memory leak on close.
        win = null;
    })
}

ipcMain.on("getFiles", (event, arg) => {
    const files = fs.readdirSync(__dirname);
    win.webContents.send("getFilesResponse", files);
});

app.on('ready', createWindow);

app.on('window-all-closed', function() {
    // make sure the app is killed if all windows are closed
    if(process.platform !== 'darwin') { // macOS does not kill the app
        app.quit();
    }
});

app.on('activate', function() {
    // macOS specific open if the dock icon is clicked
    if(win === null) {
        createWindow();
    }
});