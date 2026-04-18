const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 960,
    minHeight: 600,
    title: '翔躍後台管理',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.setMenuBarVisibility(false);
  win.loadFile(path.join(__dirname, '後台管理.html'));

  // 允許後台頁面之間互相導覽，外部連結用瀏覽器開
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('file://')) return { action: 'allow' };
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win.on('close', () => {
    // 視窗關閉時立即強制結束，不留殘留
    forceQuit();
  });
}

function forceQuit() {
  // 先嘗試正常關閉
  if (win && !win.isDestroyed()) {
    win.destroy();
    win = null;
  }
  // 設定 200ms 保險：若正常退出失敗則強制 kill
  const killer = setTimeout(() => {
    process.exit(0);
  }, 200);
  killer.unref(); // 不讓這個 timer 阻止退出

  app.exit(0);   // app.exit 比 app.quit 更強制，跳過所有 before-quit 攔截
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  forceQuit();
});

// 捕捉 Ctrl+C 或系統終止訊號
process.on('SIGINT',  () => forceQuit());
process.on('SIGTERM', () => forceQuit());
process.on('SIGHUP',  () => forceQuit());
