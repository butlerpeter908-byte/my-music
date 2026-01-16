* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #000; color: white; font-family: 'Segoe UI', sans-serif; overflow: hidden; transition: 0.3s; }
.hidden { display: none !important; }
body.light-theme { background: #f9f9f9; color: #121212; }

/* Navigation */
.top-nav { display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #000; border-bottom: 1px solid #222; position: sticky; top: 0; z-index: 100; }
.nav-left button { background: none; border: none; color: #b3b3b3; font-weight: bold; font-size: 14px; margin-right: 12px; cursor: pointer; }
.nav-left button.active { color: #1DB954; border-bottom: 2px solid #1DB954; }
.nav-right i { font-size: 20px; color: #b3b3b3; cursor: pointer; margin-right: 15px; }

/* Content Area */
.content-area { padding: 20px; height: calc(100vh - 150px); overflow-y: auto; padding-bottom: 100px; }
.playlist-row { display: flex; overflow-x: auto; gap: 15px; padding: 10px 0; scrollbar-width: none; }
.playlist-card { min-width: 140px; background: #181818; padding: 12px; border-radius: 8px; cursor: pointer; }
.playlist-card img { width: 100%; border-radius: 6px; margin-bottom: 8px; }

/* Library Folder UI */
.folder-container { display: flex; flex-direction: column; gap: 12px; }
.folder-card { display: flex; align-items: center; background: #181818; padding: 12px; border-radius: 8px; cursor: pointer; }
.folder-icon { width: 50px; height: 50px; background: #282828; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 22px; color: #1DB954; margin-right: 15px; }

/* Player Overlay Fixes */
.full-player-overlay { position: fixed; top: 100%; left: 0; width: 100%; height: 100%; background: linear-gradient(#444, #121212); z-index: 2000; transition: 0.4s ease-out; padding: 25px; }
.full-player-overlay.active { top: 0; }
.full-player-header { display: flex; justify-content: space-between; width: 100%; align-items: center; }
.options-trigger { font-size: 28px; color: white; padding: 5px; cursor: pointer; }

/* Central Popup */
.options-popup { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) scale(0.8); width: 85%; max-width: 320px; background: #282828; border-radius: 15px; opacity: 0; visibility: hidden; transition: 0.3s; z-index: 4000; padding: 20px; box-shadow: 0 10px 40px rgba(0,0,0,0.8); }
.options-popup.show { opacity: 1; visibility: visible; transform: translate(-50%, -50%) scale(1); }
.menu-item { padding: 15px; border-bottom: 1px solid #333; display: flex; align-items: center; gap: 15px; cursor: pointer; }

/* Player Bar */
.player-bar { position: fixed; bottom: 0; width: 100%; height: 85px; background: #000; display: flex; align-items: center; justify-content: space-between; padding: 0 15px; border-top: 1px solid #222; }
.main-play-btn { background: white; border: none; width: 42px; height: 42px; border-radius: 50%; font-size: 18px; }
             
