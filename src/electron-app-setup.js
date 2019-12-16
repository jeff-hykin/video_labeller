import { app, Menu, shell, BrowserWindow } from "electron"
import electron from "electron"
import defaultMenu from "electron-default-menu"
let settings = require("../package.json")

let mainWindow
let windowUrl


// 
// Main Application Setup
// 
let appActions = {
    // once the electron app is spun up
    ready: function createWindow() {
        // 
        // Window Options
        // 
        mainWindow = new BrowserWindow({
            height: 563,
            width: 1000,
            useContentSize: true,
            webPreferences: {
                webSecurity: false, // allows opening local files
                nodeIntegration: true,
            },
        })

        // Add the default menu items like copy and paste 
        Menu.setApplicationMenu(Menu.buildFromTemplate(defaultMenu(app, shell)))

        mainWindow.loadURL(windowUrl)

        mainWindow.on("closed", () => {
            mainWindow = null
        })
    },
    // whenever the app icon is clicked
    activate: ()=> {
        if (mainWindow === null) {
            createWindow()
        }
    },
    // when the last window is closed
    'windows-all-closed': () => {
        app.quit()
    },
}
// attach all the actions to the app
for (let each in appActions) {
    app.on(each, appActions[each])
}


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
    require("electron").app.on("ready", async () => {
        let installExtension = require("electron-devtools-installer")
        try {
            await installExtension.default(installExtension.VUEJS_DEVTOOLS)
        } catch (err) {
            console.log("Unable to install `vue-devtools`: \n", err)
        }
    })
}


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
