import { app, Menu, shell, BrowserWindow } from "electron"
import electron from "electron"
import defaultMenu from "electron-default-menu"
let settings = require("../../package.json")

let mainWindow
let windowUrl

// 
// When in Production only
// 
if (process.env.NODE_ENV !== "development") {
    // source code for the window 
    windowUrl = `file://${__dirname}/index.html`

    /**
     * Set `__static` path to static files in production
     * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
     */
    global.__static = require("path")
        .join(__dirname, "/static")
        .replace(/\\/g, "\\\\")
// 
//  When in Developer only
// 
} else if (process.env.NODE_ENV == "development") {
    // source is a local server
    windowUrl = `http://localhost:${settings.vueElectronSettings.devPortNumber}`

    // Install `electron-debug` with `devtron`
    require("electron-debug")()

    // Install `vue-devtools`
    require("electron").app.on("ready", () => {
        let installExtension = require("electron-devtools-installer")
        installExtension
            .default(installExtension.VUEJS_DEVTOOLS)
            .then(() => {})
            .catch(err => {
                console.log("Unable to install `vue-devtools`: \n", err)
            })
    })
}


const winURL = process.env.NODE_ENV === "development" ? `http://localhost:9080` : `file://${__dirname}/index.html`

function createWindow() {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 563,
        useContentSize: true,
        width: 1000,
        webPreferences: {
            webSecurity: false,
        },
    })

    // Add the default menu
    Menu.setApplicationMenu(Menu.buildFromTemplate(defaultMenu(app, shell)))

    mainWindow.loadURL(winURL)

    mainWindow.on("closed", () => {
        mainWindow = null
    })
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", () => {
    if (mainWindow === null) {
        createWindow()
    }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
