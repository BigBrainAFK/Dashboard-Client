'use strict';
const { app, BrowserWindow, Menu } = require('electron');
const config = require('./config.json');

let win;
const menuTemplate = [
	{
		label: 'Interface',
		submenu: [
			{ role: 'Reload' },
		],
	},
];

function createWindow() {
	// Create the browser window.
	win = new BrowserWindow({ width: 800, height: 700 });
	win.webContents.executeJavaScript('localStorage.removeItem("token");', true);
	win.webContents.session.clearCache();
	win.setMinimumSize(300, 300);
	win.setSize(800, 700);
	win.maximize();
	win.resizable = true;
	const menu = Menu.buildFromTemplate(menuTemplate);
	Menu.setApplicationMenu(menu);
	win.setMenuBarVisibility(false);
	win.loadURL(`${config.url}/auth`,
		{ userAgent: `Service-Client ${require('./package.json').version}` });
	win.on('closed', () => {
		win = null;
	});
	win.on('page-title-updated', e => {
		e.preventDefault();
		win.setTitle(`${config.appName} - v${require('./package.json').version}`);
	});
}

app.on('browser-window-created', (e, window) => {
	window.setMenuBarVisibility(false);
	const url = window.webContents.getURL();
	const filename = url.replace(/^.*[\\\/]/, '');

	if (filename.startsWith('print?')) {
		window.webContents.print({
			printBackground: false,
			deviceName: config.printerName,
		}, success => {
			if (!success) require('electron').shell.openExternal(url);
		});
	}
});

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	app.quit();
});

app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
});
