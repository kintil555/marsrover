<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>MARS EXPLORER — Rover Mission</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --mars:#c1440e;--mars2:#8b2500;--mars3:#e8651a;
  --cyan:#00ffe7;--cyan2:#00b8a9;
  --gold:#ffd166;--red:#ff4d4d;
  --panel:rgba(10,5,2,0.88);
  --border:rgba(193,68,14,0.5);
}
html,body{width:100%;height:100%;overflow:hidden;background:#0a0200;font-family:'Share Tech Mono',monospace}

/* ===== LOADING SCREEN ===== */
#loadingScreen{
  position:fixed;inset:0;z-index:9999;
  background:radial-gradient(ellipse at center,#1a0800 0%,#0a0200 60%,#000 100%);
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;
  transition:opacity 0.8s;
}
.load-planet{
  width:160px;height:160px;border-radius:50%;
  background:radial-gradient(circle at 35% 35%,#e8651a,#c1440e 40%,#8b2500 70%,#4a1200);
  box-shadow:0 0 60px rgba(193,68,14,0.6),0 0 120px rgba(193,68,14,0.2),inset -20px -20px 40px rgba(0,0,0,0.5);
  animation:pulsePlanet 3s ease-in-out infinite;
  position:relative;overflow:hidden;
}
.load-planet::before{
  content:'';position:absolute;inset:0;border-radius:50%;
  background:repeating-linear-gradient(
    170deg,transparent 0%,transparent 18%,
    rgba(0,0,0,0.15) 18%,rgba(0,0,0,0.15) 22%,
    transparent 22%,transparent 40%,
    rgba(139,37,0,0.3) 40%,rgba(139,37,0,0.3) 45%
  );
}
@keyframes pulsePlanet{0%,100%{box-shadow:0 0 60px rgba(193,68,14,0.6),0 0 120px rgba(193,68,14,0.2)}50%{box-shadow:0 0 90px rgba(232,101,26,0.8),0 0 160px rgba(193,68,14,0.3)}}
.load-rings{position:absolute;width:240px;height:70px;border-radius:50%;border:1.5px solid rgba(193,68,14,0.35);top:50%;left:50%;transform:translate(-50%,-50%) rotateX(75deg);pointer-events:none}
.load-title{font-family:'Orbitron',monospace;font-weight:900;font-size:clamp(22px,5vw,42px);letter-spacing:0.15em;color:#fff;text-shadow:0 0 30px var(--mars3)}
.load-sub{font-size:11px;letter-spacing:0.35em;color:var(--mars3);text-transform:uppercase}
.load-bar-wrap{width:min(360px,80vw);height:5px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden}
.load-bar{height:100%;width:0%;background:linear-gradient(90deg,var(--mars),var(--mars3),var(--gold));border-radius:3px;transition:width 0.4s ease;box-shadow:0 0 10px var(--mars3)}
.load-status{font-size:10px;letter-spacing:0.2em;color:rgba(255,255,255,0.45);min-height:16px}

/* ===== MAIN MENU ===== */
#mainMenu{
  position:fixed;inset:0;z-index:1000;display:none;
  background:radial-gradient(ellipse at 20% 50%,#1a0800 0%,#080100 50%,#000 100%);
  overflow:hidden;
}
#menuStars{position:absolute;inset:0;pointer-events:none}
.menu-planet{
  position:absolute;right:-100px;top:50%;transform:translateY(-50%);
  width:clamp(280px,48vw,580px);height:clamp(280px,48vw,580px);border-radius:50%;
  background:radial-gradient(circle at 30% 30%,#e8651a,#c1440e 35%,#8b2500 65%,#3a0e00);
  box-shadow:0 0 100px rgba(193,68,14,0.5),-80px 0 100px rgba(0,0,0,0.8);
  overflow:hidden;animation:menuPlanetPulse 6s ease-in-out infinite;
}
.menu-planet::after{
  content:'';position:absolute;inset:0;border-radius:50%;
  background:repeating-linear-gradient(
    160deg,transparent 0%,transparent 15%,
    rgba(0,0,0,0.1) 15%,rgba(0,0,0,0.1) 20%,
    transparent 20%,transparent 35%,
    rgba(100,20,0,0.22) 35%,rgba(100,20,0,0.22) 42%
  );
}
@keyframes menuPlanetPulse{0%,100%{filter:brightness(1)}50%{filter:brightness(1.08)}}
.menu-left{
  position:absolute;left:0;top:0;bottom:0;
  width:min(500px,100%);
  display:flex;flex-direction:column;justify-content:center;
  padding:clamp(20px,5vw,80px);gap:18px;
}
.menu-logo-top{font-family:'Orbitron',monospace;font-weight:400;font-size:clamp(9px,1.5vw,13px);letter-spacing:0.55em;color:var(--mars3);text-transform:uppercase;margin-bottom:2px}
.menu-logo-main{font-family:'Orbitron',monospace;font-weight:900;font-size:clamp(30px,6vw,68px);letter-spacing:0.04em;color:#fff;line-height:0.88;text-shadow:0 0 40px var(--mars)}
.menu-logo-sub{font-family:'Orbitron',monospace;font-weight:400;font-size:clamp(11px,1.8vw,17px);letter-spacing:0.45em;color:var(--mars3)}
.menu-desc{font-size:11px;line-height:1.9;color:rgba(255,255,255,0.35);max-width:380px;letter-spacing:0.04em}
.menu-divider{width:50px;height:1px;background:linear-gradient(90deg,var(--mars),transparent)}
.menu-buttons{display:flex;flex-direction:column;gap:10px}
.menu-btn{
  position:relative;font-family:'Orbitron',monospace;font-weight:700;font-size:12px;
  letter-spacing:0.2em;text-transform:uppercase;padding:15px 28px;
  background:rgba(193,68,14,0.08);border:1px solid var(--border);color:#fff;cursor:pointer;
  transition:all 0.18s;overflow:hidden;text-align:left;
  clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));
}
.menu-btn::before{content:'';position:absolute;inset:0;background:var(--mars);transform:translateX(-101%);transition:transform 0.18s;z-index:0}
.menu-btn:hover::before{transform:translateX(0)}
.menu-btn:hover{border-color:var(--mars3);box-shadow:0 0 18px rgba(193,68,14,0.35)}
.menu-btn span{position:relative;z-index:1}
.menu-btn .bi{margin-right:10px;color:var(--mars3)}
.menu-btn:hover .bi{color:#fff}
.btn-primary{border-color:rgba(232,101,26,0.7);background:rgba(193,68,14,0.18)}
.menu-stats{display:flex;gap:28px;margin-top:4px}
.stat-item{display:flex;flex-direction:column;gap:2px}
.stat-val{font-family:'Orbitron',monospace;font-size:20px;font-weight:700;color:var(--mars3)}
.stat-lbl{font-size:9px;letter-spacing:0.18em;color:rgba(255,255,255,0.28);text-transform:uppercase}
.menu-version{position:absolute;bottom:20px;left:clamp(20px,5vw,80px);font-size:9px;letter-spacing:0.2em;color:rgba(255,255,255,0.18)}
.menu-controls{font-size:9px;letter-spacing:0.1em;color:rgba(255,255,255,0.25);line-height:1.8}

/* ===== MULTIPLAYER PANEL ===== */
#mpPanel{
  position:fixed;inset:0;z-index:1001;display:none;
  background:rgba(0,0,0,0.88);backdrop-filter:blur(10px);
  align-items:center;justify-content:center;
}
.mp-box{
  background:var(--panel);border:1px solid var(--border);
  width:min(460px,94vw);padding:32px;
  clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,22px 100%,0 calc(100% - 22px));
  position:relative;
}
.mp-title{font-family:'Orbitron',monospace;font-weight:700;font-size:16px;letter-spacing:0.15em;color:var(--mars3);margin-bottom:20px}
.mp-tabs{display:flex;gap:0;margin-bottom:20px;border:1px solid var(--border);overflow:hidden}
.mp-tab{flex:1;padding:11px;text-align:center;font-family:'Orbitron',monospace;font-size:10px;letter-spacing:0.15em;cursor:pointer;border:none;background:transparent;color:rgba(255,255,255,0.35);transition:all 0.18s}
.mp-tab.active{background:var(--mars);color:#fff}
.mp-section{display:none;flex-direction:column;gap:12px}
.mp-section.active{display:flex}
.mp-label{font-size:9px;letter-spacing:0.22em;color:rgba(255,255,255,0.38);text-transform:uppercase;margin-bottom:3px}
.mp-input{
  width:100%;padding:11px 14px;background:rgba(255,255,255,0.04);
  border:1px solid var(--border);color:#fff;font-family:'Share Tech Mono',monospace;
  font-size:15px;letter-spacing:0.3em;text-transform:uppercase;outline:none;text-align:center;
  transition:border-color 0.2s;
}
.mp-input:focus{border-color:var(--mars3)}
.mp-input::placeholder{color:rgba(255,255,255,0.18);letter-spacing:0.2em;font-size:11px}
.mp-name{letter-spacing:0.05em;text-align:left;text-transform:none;font-size:14px}
.mp-btn{
  padding:13px;background:linear-gradient(135deg,var(--mars),var(--mars2));
  border:none;color:#fff;font-family:'Orbitron',monospace;font-weight:700;font-size:12px;
  letter-spacing:0.2em;cursor:pointer;transition:all 0.18s;text-transform:uppercase;
}
.mp-btn:hover{filter:brightness(1.18);box-shadow:0 0 18px rgba(193,68,14,0.45)}
.mp-btn:disabled{opacity:0.35;cursor:not-allowed}
.mp-status{font-size:11px;color:var(--cyan);letter-spacing:0.1em;text-align:center;min-height:18px;margin-top:4px}
.mp-room-display{
  background:rgba(0,255,231,0.07);border:1px solid rgba(0,255,231,0.25);
  padding:18px;text-align:center;display:none;
}
.mp-room-code{font-family:'Orbitron',monospace;font-size:30px;font-weight:900;letter-spacing:0.5em;color:var(--cyan);text-shadow:0 0 20px rgba(0,255,231,0.5)}
.mp-room-hint{font-size:10px;color:rgba(255,255,255,0.35);margin-top:5px;letter-spacing:0.1em}
.mp-back{background:none;border:none;color:rgba(255,255,255,0.35);cursor:pointer;font-family:'Share Tech Mono',monospace;font-size:11px;letter-spacing:0.1em;margin-top:6px;padding:4px 0;transition:color 0.18s;display:flex;align-items:center;gap:6px}
.mp-back:hover{color:rgba(255,255,255,0.7)}

/* ===== GAME ===== */
#gameContainer{position:fixed;inset:0;display:none}
#c{width:100%;height:100%;display:block;touch-action:none;cursor:crosshair}

/* ===== HUD ===== */
#hud{position:fixed;inset:0;pointer-events:none;z-index:100}

.hud-top{
  position:absolute;top:0;left:0;right:0;
  display:flex;align-items:center;flex-wrap:wrap;
  background:linear-gradient(180deg,rgba(0,0,0,0.72) 0%,transparent 100%);
  padding:8px 14px;gap:6px;
}
.hud-brand{font-family:'Orbitron',monospace;font-size:clamp(9px,1.6vw,13px);font-weight:700;letter-spacing:0.15em;color:var(--mars3);display:flex;align-items:center;gap:5px}
.hud-sep{width:1px;height:20px;background:rgba(255,255,255,0.1)}
.hud-stat{display:flex;align-items:center;gap:5px;padding:0 8px}
.hud-stat-ico{font-size:14px}
.hud-stat-val{font-family:'Orbitron',monospace;font-size:clamp(11px,1.8vw,15px);font-weight:700;color:#fff}
.hud-stat-lbl{font-size:8px;letter-spacing:0.15em;color:rgba(255,255,255,0.38);text-transform:uppercase}
.hud-mission{margin-left:auto;display:flex;align-items:center;gap:7px;font-size:9px;letter-spacing:0.12em;color:rgba(255,255,255,0.45)}
.hud-pbar{width:72px;height:3px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden}
.hud-pfill{height:100%;background:linear-gradient(90deg,var(--cyan2),var(--cyan));border-radius:2px;transition:width 0.5s}
.hud-ppct{font-family:'Orbitron',monospace;font-size:10px;font-weight:700;color:var(--cyan)}

/* Side panels */
.hud-left-panel{position:absolute;top:56px;left:12px;display:flex;flex-direction:column;gap:6px}
.hud-right-panel{position:absolute;top:56px;right:12px;display:flex;flex-direction:column;gap:6px;align-items:flex-end}
.hud-pill{
  background:var(--panel);border:1px solid var(--border);
  padding:5px 10px;display:flex;flex-direction:column;gap:1px;
}
.pill-val{font-family:'Orbitron',monospace;font-size:12px;font-weight:700;color:var(--gold)}
.pill-lbl{font-size:8px;letter-spacing:0.15em;color:rgba(255,255,255,0.3);text-transform:uppercase}
.hud-compass-row{display:flex;gap:6px;align-items:stretch}
.hud-dir{
  background:var(--panel);border:1px solid var(--border);
  padding:5px 10px;font-family:'Orbitron',monospace;font-size:14px;font-weight:700;
  color:var(--mars3);display:flex;align-items:center;
}

/* Bottom panels */
.hud-bottom-left{position:absolute;bottom:12px;left:12px;display:flex;flex-direction:column;gap:6px}
.hud-bottom-right{position:absolute;bottom:12px;right:12px;display:flex;flex-direction:column;gap:6px;align-items:flex-end}
.hud-map-wrap{background:var(--panel);border:1px solid var(--border);padding:6px;display:flex;flex-direction:column;gap:4px;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))}
.hud-map-lbl{font-size:8px;letter-spacing:0.25em;color:var(--mars3);text-align:center;text-transform:uppercase}
.hud-radar-wrap{background:var(--panel);border:1px solid rgba(0,255,231,0.28);padding:6px;display:flex;flex-direction:column;gap:4px;clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px))}
.hud-radar-lbl{font-size:8px;letter-spacing:0.25em;color:var(--cyan2);text-align:center;text-transform:uppercase}
.radar-legend{display:flex;gap:8px;justify-content:center}
.rl{display:flex;align-items:center;gap:3px;font-size:7px;letter-spacing:0.08em;color:rgba(255,255,255,0.45)}
.rldot{width:5px;height:5px;border-radius:50%}

/* Collect prompt */
#collectPrompt{
  position:absolute;bottom:calc(50% - 30px);left:50%;transform:translateX(-50%);
  background:var(--panel);border:1px solid rgba(0,255,231,0.4);
  padding:9px 18px;display:none;align-items:center;gap:9px;
  font-size:11px;letter-spacing:0.1em;color:var(--cyan);
  animation:cpulse 1.2s ease-in-out infinite;white-space:nowrap;
}
@keyframes cpulse{0%,100%{box-shadow:0 0 6px rgba(0,255,231,0.2)}50%{box-shadow:0 0 18px rgba(0,255,231,0.55)}}
.ckey{background:rgba(0,255,231,0.14);border:1px solid rgba(0,255,231,0.5);padding:2px 8px;font-family:'Orbitron',monospace;font-size:11px;font-weight:700;color:var(--cyan)}

/* Toast */
#toast{
  position:absolute;top:72px;left:50%;transform:translateX(-50%);
  background:var(--panel);border:1px solid var(--mars3);
  padding:9px 18px;font-size:11px;letter-spacing:0.08em;color:var(--gold);
  display:none;text-align:center;white-space:nowrap;pointer-events:none;
  clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px));
}

/* Mission complete */
#missionComplete{
  position:absolute;inset:0;background:rgba(0,0,0,0.86);
  display:none;flex-direction:column;align-items:center;justify-content:center;gap:18px;
  backdrop-filter:blur(5px);pointer-events:all;
}
.mc-title{font-family:'Orbitron',monospace;font-weight:900;font-size:clamp(22px,5vw,46px);letter-spacing:0.14em;color:var(--gold);text-shadow:0 0 40px rgba(255,209,102,0.6)}
.mc-sub{font-size:12px;letter-spacing:0.2em;color:rgba(255,255,255,0.45);text-transform:uppercase}
.mc-stats{display:flex;gap:28px;margin:6px 0}
.mc-stat{display:flex;flex-direction:column;align-items:center;gap:3px}
.mc-stat-val{font-family:'Orbitron',monospace;font-size:26px;font-weight:700;color:var(--mars3)}
.mc-stat-lbl{font-size:9px;letter-spacing:0.15em;color:rgba(255,255,255,0.38);text-transform:uppercase}
.mc-btn{padding:13px 38px;background:linear-gradient(135deg,var(--mars),var(--mars2));border:none;color:#fff;font-family:'Orbitron',monospace;font-weight:700;font-size:12px;letter-spacing:0.2em;cursor:pointer;margin-top:6px;transition:all 0.18s;pointer-events:all;text-transform:uppercase}
.mc-btn:hover{filter:brightness(1.2);box-shadow:0 0 22px rgba(193,68,14,0.5)}

/* MP badge + conn */
#mpBadge{position:absolute;top:52px;left:50%;transform:translateX(-50%);background:var(--panel);border:1px solid rgba(0,255,231,0.25);padding:4px 12px;font-size:9px;letter-spacing:0.15em;color:var(--cyan);display:none;white-space:nowrap}
#connIndicator{position:absolute;bottom:12px;left:50%;transform:translateX(-50%);background:var(--panel);border:1px solid var(--border);padding:4px 12px;font-size:8px;letter-spacing:0.15em;display:none;gap:5px;align-items:center;white-space:nowrap}
.cndot{width:5px;height:5px;border-radius:50%;background:var(--cyan);animation:blink 1.2s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0.2}}

/* Mobile controls */
#mobileControls{position:fixed;inset:0;pointer-events:none;z-index:200;display:none}
#joystickZone{position:absolute;bottom:16px;left:16px;width:130px;height:130px;pointer-events:all}
#mobileCollect{
  position:absolute;bottom:48px;right:24px;
  width:64px;height:64px;border-radius:50%;
  background:rgba(0,255,231,0.12);border:2px solid rgba(0,255,231,0.4);
  color:var(--cyan);font-family:'Orbitron',monospace;font-size:9px;font-weight:700;
  display:flex;align-items:center;justify-content:center;text-align:center;
  cursor:pointer;pointer-events:all;letter-spacing:0.04em;
  transition:background 0.15s;
}
#mobileCollect:active{background:rgba(0,255,231,0.3)}
#touchLook{position:absolute;right:0;top:0;width:55%;height:85%;pointer-events:all}


/* ===== LEADERBOARD ===== */
#lbPanel{
  position:fixed;inset:0;z-index:1002;display:none;
  background:rgba(0,0,0,0.9);backdrop-filter:blur(10px);
  align-items:center;justify-content:center;
}
.lb-box{
  background:var(--panel);border:1px solid var(--border);
  width:min(520px,95vw);padding:32px;max-height:90vh;overflow-y:auto;
  clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,22px 100%,0 calc(100% - 22px));
}
.lb-title{font-family:'Orbitron',monospace;font-weight:700;font-size:16px;letter-spacing:0.15em;color:var(--gold);margin-bottom:20px;display:flex;align-items:center;gap:8px}
.lb-table{width:100%;border-collapse:collapse}
.lb-table th{font-size:8px;letter-spacing:0.2em;color:rgba(255,255,255,0.3);text-transform:uppercase;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,0.08);text-align:left}
.lb-table td{padding:10px 8px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;color:rgba(255,255,255,0.8)}
.lb-table tr:first-child td{color:var(--gold)}
.lb-table tr:nth-child(2) td{color:rgba(200,200,200,0.9)}
.lb-table tr:nth-child(3) td{color:rgba(180,120,60,0.9)}
.lb-rank{font-family:'Orbitron',monospace;font-weight:700;color:rgba(255,255,255,0.3);font-size:11px}
.lb-name{font-family:'Orbitron',monospace;font-size:11px}
.lb-water{color:var(--cyan)!important;font-family:'Orbitron',monospace;font-weight:700}
.lb-iron{color:rgba(180,90,47,0.9)!important}
.lb-time{color:rgba(255,255,255,0.5)!important;font-size:10px}
.lb-empty{text-align:center;padding:32px;font-size:11px;color:rgba(255,255,255,0.25);letter-spacing:0.1em}
.lb-loading{text-align:center;padding:24px;font-size:11px;color:var(--cyan);letter-spacing:0.15em;animation:cpulse 1.5s ease-in-out infinite}

/* Scrollbar hide */
::-webkit-scrollbar{display:none}
</style>
</head>
<body>

<!-- LOADING -->
<div id="loadingScreen">
  <div style="position:relative;display:flex;align-items:center;justify-content:center;width:200px;height:200px">
    <div class="load-planet"></div>
    <div class="load-rings"></div>
  </div>
  <div class="load-title">MARS EXPLORER</div>
  <div class="load-sub">Rover Mission · Red Planet Expedition</div>
  <div class="load-bar-wrap"><div class="load-bar" id="loadBar"></div></div>
  <div class="load-status" id="loadStatus">Initializing systems...</div>
</div>

<!-- MAIN MENU -->
<div id="mainMenu">
  <canvas id="menuStars"></canvas>
  <div class="menu-planet"></div>
  <div class="menu-left">
    <div>
      <div class="menu-logo-top">NASA × ROVER DIVISION</div>
      <div class="menu-logo-main">MARS<br>EXPLORER</div>
      <div class="menu-logo-sub">ROVER MISSION</div>
    </div>
    <div class="menu-desc">Two rovers deployed to the Martian surface. Locate water-bearing mineral deposits using iron radar arrays. Scale Olympus Mons. Survive the red dust.</div>
    <div class="menu-divider"></div>
    <div class="menu-buttons">
      <button class="menu-btn btn-primary" onclick="startSinglePlayer()">
        <span><span class="bi">▶</span>SINGLE PLAYER</span>
      </button>
      <button class="menu-btn" onclick="showMpPanel()">
        <span><span class="bi">⬡</span>MULTIPLAYER CO-OP</span>
      </button>
      <button class="menu-btn" onclick="showLeaderboard()">
        <span><span class="bi">◆</span>LEADERBOARD</span>
      </button>
    </div>
    <div class="menu-stats">
      <div class="stat-item"><div class="stat-val">2</div><div class="stat-lbl">Rovers</div></div>
      <div class="stat-item"><div class="stat-val">15</div><div class="stat-lbl">Water Minerals</div></div>
      <div class="stat-item"><div class="stat-val">30</div><div class="stat-lbl">Iron Nodes</div></div>
    </div>
    <div class="menu-controls">
      WASD / Arrow Keys — Move &nbsp;|&nbsp; Right-click drag — Camera &nbsp;|&nbsp; Scroll — Zoom &nbsp;|&nbsp; E — Collect
    </div>
  </div>
  <div class="menu-version">v2.0 · MARS EXPLORER · MISSION ARES</div>
</div>

<!-- MULTIPLAYER PANEL -->
<div id="mpPanel">
  <div class="mp-box">
    <div class="mp-title">◈ MULTIPLAYER CO-OP</div>
    <div style="margin-bottom:14px">
      <div class="mp-label">Your Call Sign</div>
      <input class="mp-input mp-name" id="playerName" placeholder="Enter your name" maxlength="16">
    </div>
    <div class="mp-tabs">
      <button class="mp-tab active" onclick="switchMpTab('create')">CREATE ROOM</button>
      <button class="mp-tab" onclick="switchMpTab('join')">JOIN ROOM</button>
    </div>
    <div class="mp-section active" id="mpCreate">
      <div style="font-size:11px;color:rgba(255,255,255,0.38);letter-spacing:0.04em;line-height:1.9">Create a mission room and share the code with your co-pilot. Two rovers, one mission.</div>
      <button class="mp-btn" id="btnCreateRoom" onclick="createRoom()">⊕ CREATE ROOM</button>
      <div class="mp-room-display" id="roomDisplay">
        <div class="mp-label">Room Code</div>
        <div class="mp-room-code" id="roomCodeDisplay">----</div>
        <div class="mp-room-hint">Share this code with your co-pilot</div>
        <div style="margin-top:10px;font-size:10px;color:var(--cyan);letter-spacing:0.1em" id="waitingStatus">⌛ Waiting for co-pilot...</div>
      </div>
    </div>
    <div class="mp-section" id="mpJoin">
      <div class="mp-label">Room Code</div>
      <input class="mp-input" id="roomCodeInput" placeholder="XXXX" maxlength="4" oninput="this.value=this.value.toUpperCase()">
      <button class="mp-btn" id="btnJoinRoom" onclick="joinRoom()">→ JOIN MISSION</button>
    </div>
    <div class="mp-status" id="mpStatus"></div>
    <button class="mp-back" onclick="hideMpPanel()">← Back to Menu</button>
  </div>
</div>


<!-- LEADERBOARD PANEL -->
<div id="lbPanel">
  <div class="lb-box">
    <div class="lb-title">◆ MISSION LEADERBOARD</div>
    <div id="lbContent"><div class="lb-loading">Loading mission records...</div></div>
    <button class="mp-back" onclick="hideLb()" style="margin-top:16px">← Back to Menu</button>
  </div>
</div>

<!-- GAME -->
<div id="gameContainer">
  <canvas id="c"></canvas>
  <div id="hud">
    <!-- Top bar -->
    <div class="hud-top">
      <div class="hud-brand">
        <svg width="12" height="12" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#c1440e"/><circle cx="12" cy="12" r="4" fill="#8b2500"/></svg>
        MARS
      </div>
      <div class="hud-sep"></div>
      <div class="hud-stat">
        <span class="hud-stat-ico">⬡</span>
        <div><div class="hud-stat-val" id="ironCount">0</div><div class="hud-stat-lbl">Iron</div></div>
      </div>
      <div class="hud-stat">
        <span class="hud-stat-ico" style="color:var(--cyan)">◈</span>
        <div><div class="hud-stat-val" id="waterCount">0</div><div class="hud-stat-lbl">Water Minerals</div></div>
      </div>
      <div class="hud-mission">
        <span>MISSION</span>
        <div class="hud-pbar"><div class="hud-pfill" id="missionFill" style="width:0%"></div></div>
        <div class="hud-ppct" id="missionPct">0%</div>
      </div>
    </div>
    <!-- Left side: altitude + compass -->
    <div class="hud-left-panel">
      <div class="hud-compass-row">
        <div class="hud-dir" id="compassDir">N</div>
        <div class="hud-pill"><div class="pill-val" id="speedVal">0.0</div><div class="pill-lbl">m/s</div></div>
      </div>
      <div class="hud-pill"><div class="pill-val" id="altVal">0m</div><div class="pill-lbl">Altitude</div></div>
    </div>
    <!-- Bottom left: minimap -->
    <div class="hud-bottom-left">
      <div class="hud-map-wrap">
        <div class="hud-map-lbl">SURFACE MAP</div>
        <canvas id="minimapCanvas" width="128" height="128"></canvas>
      </div>
    </div>
    <!-- Bottom right: radar -->
    <div class="hud-bottom-right">
      <div class="hud-radar-wrap">
        <div class="hud-radar-lbl">RADAR</div>
        <canvas id="radarCanvas" width="128" height="128"></canvas>
        <div class="radar-legend">
          <div class="rl"><div class="rldot" style="background:#b05a2f"></div>Fe</div>
          <div class="rl"><div class="rldot" style="background:#00ffe7"></div>H₂O</div>
          <div class="rl"><div class="rldot" style="background:#4488ff"></div>P2</div>
        </div>
      </div>
    </div>
    <!-- Collect prompt -->
    <div id="collectPrompt"><span class="ckey">E</span><span id="collectText">Collect</span></div>
    <!-- Toast -->
    <div id="toast"></div>
    <!-- MP badge -->
    <div id="mpBadge">◈ MULTIPLAYER — CO-OP MISSION</div>
    <!-- Conn indicator -->
    <div id="connIndicator"><div class="cndot"></div><span>CO-PILOT ONLINE</span></div>
    <!-- Mission complete -->
    <div id="missionComplete">
      <div class="mc-title">MISSION COMPLETE</div>
      <div class="mc-sub">All water minerals located</div>
      <div class="mc-stats">
        <div class="mc-stat"><div class="mc-stat-val" id="mcIron">0</div><div class="mc-stat-lbl">Iron Scanned</div></div>
        <div class="mc-stat"><div class="mc-stat-val" id="mcWater">0</div><div class="mc-stat-lbl">Water Found</div></div>
        <div class="mc-stat"><div class="mc-stat-val" id="mcTime">0:00</div><div class="mc-stat-lbl">Mission Time</div></div>
      </div>
      <button class="mc-btn" onclick="returnToMenu()">RETURN TO BASE</button>
    </div>
  </div>
  <!-- Mobile controls -->
  <div id="mobileControls">
    <div id="joystickZone"></div>
    <div id="mobileCollect" onclick="collectNearest()">COLLECT</div>
    <div id="touchLook"></div>
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/nipplejs@0.9.0/dist/nipplejs.min.js"></script>
<script>

'use strict';
// ================================================================
//  MARS EXPLORER v3 — Spherical Planet Engine
//
//  Architecture:
//  - Planet represented as sphere (radius PLANET_R) in world space
//  - Rover walks on sphere surface — position stored as lat/lon
//  - Terrain = chunked LOD sphere mesh with proper equirectangular UV
//  - Equirectangular texture mapped ONCE across full sphere (kutub ke kutub)
//  - Frustum culling per chunk — invisible chunks removed from scene
//  - Distance-based LOD: near=64 segs, mid=16 segs, far=4 segs
//  - Shadow maps disabled on mobile for performance
// ================================================================

const isMobile=/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)||window.innerWidth<768;

// Planet constants — Mars radius scaled for gameplay feel
const PLANET_R    = 1200;       // world-space radius (large = curvature visible)
const CHUNK_COUNT = 8;          // grid: CHUNK_COUNT x CHUNK_COUNT patches over visible hemisphere
const CHUNK_ARC   = Math.PI/5;  // angular size of one chunk (~36°)
const VIEW_CHUNKS = 5;          // chunks visible in each direction
const LOD_HIGH_D  = 120;        // chunk distance thresholds (world units from rover)
const LOD_MED_D   = 300;
const LOD_SEGS_H  = isMobile?24:48;
const LOD_SEGS_M  = isMobile?10:18;
const LOD_SEGS_L  = 4;

const RADAR_R     = 3000;       // radar range in surface arc-length units
const TOTAL_WATER = 15;
const TOTAL_IRON  = 30;
const ROVER_SPEED = isMobile ? 28 : 38;  // surface arc speed (units/s)
const ROVER_FRICTION = 0.05;

// ── Scene globals ──────────────────────────────────────────────
let scene, camera, renderer, clock;
let marsTexture = null;
let chunkMap = new Map();       // "cx_cy" → ChunkMesh
let lodMat;                     // shared terrain material
let roverGroup, remoteGroup;
let minerals = [], collected = new Set();
let ironCount = 0, waterCount = 0;

// Rover state on sphere surface
let roverLat = 0;               // latitude  (radians, -PI/2 .. PI/2)
let roverLon = 0;               // longitude (radians, -PI   .. PI)
let roverLatVel = 0;
let roverLonVel = 0;
let roverFacing = 0;            // angle on local tangent plane
let roverSpeed  = 0;
let roverSurfacePos = new THREE.Vector3(); // 3D position on planet surface
let roverUp       = new THREE.Vector3(0,1,0); // surface normal at rover

// Camera
let camYaw = 0, camPitch = 0.38, camDist = 14;
let camTarget = new THREE.Vector3();

// Controls
let keys = {}, mouseDown = false, lastMX = 0, lastMY = 0;
let joystickDir = {x:0, y:0};
let nearestMineral = null;
let animId = null;
let gameStartTime = 0;

// Frustum culling
let frustum = new THREE.Frustum();
let frustumMat = new THREE.Matrix4();

// ── Worker/MP globals (preserved from previous version) ────────
const WORKER_URL = (()=>{
  if(location.hostname==='localhost'||location.hostname==='127.0.0.1')
    return 'http://localhost:8787';
  return '';
})();
let ws=null, isMP=false, mySid=-1, myRole='host';
let syncT=0;
let playerName='ROVER-1';
let roomCode='';

// ================================================================
//  SPHERICAL MATH HELPERS
// ================================================================

// Convert lat/lon to 3D point on sphere surface
function latLonToVec3(lat, lon, r) {
  r = r || PLANET_R;
  const cosLat = Math.cos(lat);
  return new THREE.Vector3(
    r * cosLat * Math.sin(lon),
    r * Math.sin(lat),
    r * cosLat * Math.cos(lon)
  );
}

// Convert 3D point to lat/lon
function vec3ToLatLon(v) {
  const r = v.length();
  return {
    lat: Math.asin(v.y / r),
    lon: Math.atan2(v.x, v.z)
  };
}

// Great-circle distance between two lat/lon points (radians)
function gcDist(lat1, lon1, lat2, lon2) {
  const dlat = lat2 - lat1, dlon = lon2 - lon1;
  const a = Math.sin(dlat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dlon/2)**2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

// Surface height noise (used to displace sphere vertices outward)
// Returns extra radius in world units
function surfaceHeight(lat, lon) {
  // Multi-octave "noise" using trig — deterministic, no library needed
  const x = Math.cos(lat)*Math.sin(lon);
  const y = Math.sin(lat);
  const z = Math.cos(lat)*Math.cos(lon);
  let h = 0;
  // Octave 1 — large features
  h += Math.sin(x*4.1 + y*2.3 + z*3.7) * Math.cos(y*5.2 + x*1.8) * 18;
  // Octave 2 — medium
  h += Math.sin(x*9.3 + z*8.7) * Math.cos(y*10.1 + z*6.4) * 7;
  // Octave 3 — detail
  h += Math.sin(x*22 + y*19 + z*17) * Math.cos(z*24 + x*21) * 2.5;
  // Octave 4 — fine
  h += Math.sin(x*50 + y*47) * Math.cos(z*53 + y*44) * 0.8;
  // Olympus Mons — massive shield volcano at lat=18°N lon=226°E (Tharsis region)
  const olat = 0.314, olon = -2.29;  // radians
  const od = gcDist(lat, lon, olat, olon);
  if (od < 0.52) {
    const p = Math.max(0, 1 - od/0.52);
    h += p*p*(3-2*p) * 85;  // 85 world-unit peak
  }
  // Valles Marineris — canyon at lat=-14° lon=310°E
  const vlat=-0.244, vlon=1.222;
  const vd = gcDist(lat, lon, vlat, vlon);
  if(vd < 0.4){
    const p=Math.max(0,1-vd/0.4);
    h -= p*p*22;  // deep canyon
  }
  // Craters — 8 impact craters
  const craters=[
    [0.5,0.8,0.08,12],[-0.3,2.1,0.06,9],[0.8,-1.4,0.07,11],
    [-0.6,0.3,0.09,14],[0.1,-2.5,0.05,8],[-0.8,1.9,0.07,10],
    [0.4,-0.7,0.06,9],[-0.2,-1.1,0.08,12]
  ];
  for(const[clat,clon,cr,cd] of craters){
    const d=gcDist(lat,lon,clat,clon);
    if(d<cr){ const p=d/cr; h-=cd*(1-p*p*p); }
  }
  return h;
}

// Full radius at given lat/lon (planet_r + terrain displacement)
function totalRadius(lat, lon) {
  return PLANET_R + surfaceHeight(lat, lon);
}

// Get rover 3D surface position from lat/lon
function roverWorldPos() {
  return latLonToVec3(roverLat, roverLon, totalRadius(roverLat, roverLon));
}

// ================================================================
//  LOADING
// ================================================================
const setLoad=(pct,msg)=>{
  document.getElementById('loadBar').style.width=pct+'%';
  document.getElementById('loadStatus').textContent=msg;
};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function bootGame(){
  setLoad(5,'Booting renderer...');
  await sleep(80);
  initRenderer();
  setLoad(12,'Loading Mars texture...');
  await sleep(60);
  await loadMarsTexture();
  setLoad(28,'Building terrain material...');
  await sleep(60);
  buildTerrainMaterial();
  setLoad(38,'Generating initial chunks...');
  await sleep(60);
  buildSky();
  buildLights();
  setLoad(52,'Placing mineral deposits...');
  await sleep(60);
  placeMinerals();
  setLoad(66,'Building dust system...');
  await sleep(60);
  buildDust();
  setLoad(76,'Loading rover model...');
  await sleep(80);
  await loadRover();
  setLoad(90,'Binding controls...');
  await sleep(60);
  bindControls();
  window.addEventListener('resize', onResize);
  setLoad(100,'Liftoff!');
  await sleep(350);
  const ls=document.getElementById('loadingScreen');
  ls.style.opacity='0';
  setTimeout(()=>{ ls.style.display='none'; showMenu(); }, 700);
}

function initRenderer(){
  const canvas=document.getElementById('c');
  renderer=new THREE.WebGLRenderer({canvas, antialias:!isMobile, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile?1.2:2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = false;  // disabled for perf — baked lighting instead
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  scene = new THREE.Scene();
  // Fog based on arc distance — shorter range on mobile
  scene.fog = new THREE.Fog(0x6b1e00, isMobile?600:900, isMobile?1200:2000);
  camera = new THREE.PerspectiveCamera(68, window.innerWidth/window.innerHeight, 0.5, 4000);
  clock = new THREE.Clock();
}

function onResize(){
  camera.aspect=window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
}

// ================================================================
//  TEXTURE — Equirectangular mapping onto sphere
// ================================================================
async function loadMarsTexture(){
  return new Promise(res=>{
    new THREE.TextureLoader().load(
      '1773986894497_image.png',
      tex=>{
        // Equirectangular: wrapS=ClampToEdge, wrapT=ClampToEdge
        // NO repeat — the UVs on the sphere will map [0,1]x[0,1] to full planet
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        tex.generateMipmaps = true;
        tex.needsUpdate = true;
        marsTexture = tex;
        res();
      },
      undefined,
      ()=>{ marsTexture=null; res(); }
    );
  });
}

// Shared material for all terrain chunks
// UV is computed per-vertex as equirectangular: u=lon/2pi+0.5, v=lat/pi+0.5
function buildTerrainMaterial(){
  lodMat = new THREE.MeshStandardMaterial({
    map: marsTexture,
    roughness: 0.92,
    metalness: 0.03,
    // Fallback color if no texture
    color: marsTexture ? 0xffffff : 0xb85020,
  });
}

// ================================================================
//  CHUNK SYSTEM — LOD terrain tiles on sphere surface
// ================================================================

// A chunk covers a rectangle of lat/lon space
// chunkKey: "latIdx_lonIdx"
function chunkKey(latI, lonI){ return `${latI}_${lonI}`; }

// Build a single chunk mesh for a lat/lon patch
function buildChunk(latCenter, lonCenter, segs) {
  const dArc = CHUNK_ARC;       // angular half-size of chunk
  const latMin = latCenter - dArc/2;
  const latMax = latCenter + dArc/2;
  const lonMin = lonCenter - dArc/2;
  const lonMax = lonCenter + dArc/2;

  const positions = [];
  const normals   = [];
  const uvs       = [];
  const indices   = [];

  const S = segs;
  for(let j=0; j<=S; j++){
    for(let i=0; i<=S; i++){
      const u = i/S, v = j/S;
      const lat = latMin + v*(latMax-latMin);
      const lon = lonMin + u*(lonMax-lonMin);
      const r   = totalRadius(lat, lon);

      const cosLat=Math.cos(lat), sinLat=Math.sin(lat);
      const cosLon=Math.cos(lon), sinLon=Math.sin(lon);

      // Position on sphere
      const px=r*cosLat*sinLon;
      const py=r*sinLat;
      const pz=r*cosLat*cosLon;
      positions.push(px,py,pz);

      // Normal = outward radial direction (sphere normal)
      const nr=Math.sqrt(px*px+py*py+pz*pz);
      normals.push(px/nr, py/nr, pz/nr);

      // Equirectangular UV: maps full planet texture across sphere
      // u_tex = (lon + PI) / (2*PI)
      // v_tex = (lat + PI/2) / PI
      const uTex = (lon + Math.PI) / (2*Math.PI);
      const vTex = (lat + Math.PI/2) / Math.PI;
      uvs.push(uTex, vTex);
    }
  }

  // Triangles
  for(let j=0; j<S; j++){
    for(let i=0; i<S; i++){
      const a=(j*(S+1))+i;
      const b=a+1;
      const c=a+(S+1);
      const d=c+1;
      indices.push(a,c,b, b,c,d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals,3));
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs,2));
  geo.setIndex(indices);
  geo.computeBoundingSphere();

  const mesh = new THREE.Mesh(geo, lodMat);
  mesh.userData = { latCenter, lonCenter, segs };
  return mesh;
}

// Determine LOD segs based on angular distance from rover
function lodSegs(dArc) {
  const dWorld = dArc * PLANET_R;
  if(dWorld < LOD_HIGH_D) return LOD_SEGS_H;
  if(dWorld < LOD_MED_D)  return LOD_SEGS_M;
  return LOD_SEGS_L;
}

// Called every frame — update which chunks exist and their LOD
function updateChunks() {
  // Update frustum
  camera.updateMatrixWorld();
  frustumMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(frustumMat);

  const VIEW_R = 4.5;            // chunks in each direction from rover (angular steps)
  const newKeys = new Set();

  for(let dLat=-VIEW_R; dLat<=VIEW_R; dLat++){
    for(let dLon=-VIEW_R; dLon<=VIEW_R; dLon++){
      // Skip corners to make roughly circular visible area
      if(Math.hypot(dLat,dLon)>VIEW_R+0.5) continue;

      const latC = roverLat + dLat * CHUNK_ARC;
      const lonC = roverLon + dLon * CHUNK_ARC;
      // Clamp lat
      if(latC < -Math.PI/2 + CHUNK_ARC/2 || latC > Math.PI/2 - CHUNK_ARC/2) continue;

      // Snap to grid
      const latIdx = Math.round(latC / CHUNK_ARC);
      const lonIdx = Math.round(((lonC % (Math.PI*2)) + Math.PI*2) % (Math.PI*2) / CHUNK_ARC);
      const key = chunkKey(latIdx, lonIdx);
      const latSnap = latIdx * CHUNK_ARC;
      const lonSnap = (lonIdx * CHUNK_ARC - Math.PI);

      // Angular dist from rover
      const dArc = gcDist(roverLat, roverLon, latSnap, lonSnap);
      const segs = lodSegs(dArc);

      newKeys.add(key);

      const existing = chunkMap.get(key);

      // Frustum cull: check chunk center point
      const centerVec = latLonToVec3(latSnap, lonSnap, PLANET_R);
      const inFrustum = frustum.containsPoint(centerVec);

      if(!inFrustum){
        // Hide but don't destroy (might come back into view)
        if(existing) existing.visible = false;
        continue;
      }

      if(!existing){
        // Build new chunk
        const mesh = buildChunk(latSnap, lonSnap, segs);
        scene.add(mesh);
        chunkMap.set(key, mesh);
      } else {
        // Show and maybe upgrade/downgrade LOD
        existing.visible = true;
        if(existing.userData.segs !== segs){
          // Rebuild with new LOD
          scene.remove(existing);
          existing.geometry.dispose();
          const mesh = buildChunk(latSnap, lonSnap, segs);
          scene.add(mesh);
          chunkMap.set(key, mesh);
        }
      }
    }
  }

  // Remove chunks that are too far
  for(const [key, mesh] of chunkMap){
    if(!newKeys.has(key)){
      scene.remove(mesh);
      mesh.geometry.dispose();
      chunkMap.delete(key);
    }
  }
}

// ================================================================
//  SKY
// ================================================================
let skyMesh;
function buildSky(){
  const geo=new THREE.SphereGeometry(3500,24,12);
  const mat=new THREE.ShaderMaterial({
    uniforms:{
      topColor:{value:new THREE.Color(0x060100)},
      horizColor:{value:new THREE.Color(0x9e3d10)},
    },
    vertexShader:`
      varying vec3 vPos;
      void main(){ vPos=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader:`
      uniform vec3 topColor, horizColor;
      varying vec3 vPos;
      void main(){
        float t=clamp(vPos.y*2.0,0.0,1.0);
        gl_FragColor=vec4(mix(horizColor,topColor,pow(t,0.5)),1.0);
      }`,
    side:THREE.BackSide,depthWrite:false
  });
  skyMesh=new THREE.Mesh(geo,mat);
  scene.add(skyMesh);

  // Stars (only above horizon, sparse)
  const N=800, sp=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    const th=Math.random()*Math.PI*2;
    const ph=Math.random()*Math.PI*0.5;  // upper hemisphere only
    const r=3300;
    sp[i*3]=r*Math.sin(ph)*Math.cos(th);
    sp[i*3+1]=r*Math.cos(ph)+100;
    sp[i*3+2]=r*Math.sin(ph)*Math.sin(th);
  }
  const sg=new THREE.BufferGeometry();
  sg.setAttribute('position',new THREE.BufferAttribute(sp,3));
  scene.add(new THREE.Points(sg,new THREE.PointsMaterial({color:0xffffff,size:1.8,sizeAttenuation:true,transparent:true,opacity:0.7})));

  // Phobos moon
  const pm=new THREE.Mesh(
    new THREE.SphereGeometry(12,8,6),
    new THREE.MeshStandardMaterial({color:0x888880,roughness:1})
  );
  pm.position.set(-1200,800,-2000);
  scene.add(pm);
}

// ================================================================
//  LIGHTING
// ================================================================
function buildLights(){
  // Mars sun is 43% as bright as Earth's
  scene.add(new THREE.AmbientLight(0xff9966, 0.55));
  const sun=new THREE.DirectionalLight(0xffcc88, 1.6);
  // Sun position fixed in world space — roughly "from south-east"
  sun.position.set(2000, 1200, 800);
  scene.add(sun);
  // Weak fill from red ground reflection
  scene.add(new THREE.HemisphereLight(0xcc5522, 0x3a0a00, 0.3));
}

// ================================================================
//  DUST PARTICLES (local to rover)
// ================================================================
let dustGroup;
function buildDust(){
  dustGroup=new THREE.Group();
  const N=isMobile?400:700;
  const pos=new Float32Array(N*3);
  for(let i=0;i<N;i++){
    pos[i*3]=(Math.random()-0.5)*80;
    pos[i*3+1]=Math.random()*15;
    pos[i*3+2]=(Math.random()-0.5)*80;
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const mat=new THREE.PointsMaterial({
    color:0xcc6633,size:isMobile?0.28:0.18,
    transparent:true,opacity:0.35,sizeAttenuation:true
  });
  dustGroup.add(new THREE.Points(geo,mat));
  scene.add(dustGroup);
}

function tickDust(dt){
  if(!dustGroup) return;
  const geo=dustGroup.children[0].geometry;
  const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){
    let y=pos.getY(i)+dt*(0.3+Math.sin(i)*0.08);
    if(y>16) y=-0.5;
    pos.setY(i,y);
  }
  pos.needsUpdate=true;
  // Keep dust anchored to rover in world space
  dustGroup.position.copy(roverSurfacePos);
  // Orient dust group to planet surface normal (so particles float "up" from surface)
  const up = roverUp.clone();
  dustGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), up);
}

// ================================================================
//  MINERALS — placed at lat/lon positions on sphere
// ================================================================
function placeMinerals(){
  // Iron deposit lat/lon positions (spread across Mars)
  const ironPositions = [
    [0.4,0.5],[0.42,0.55],[0.38,0.48],[0.44,0.52],[0.41,0.46],
    [-0.3,1.8],[-0.28,1.85],[-0.32,1.75],[-0.29,1.82],[-0.31,1.78],
    [0.7,-1.2],[0.68,-1.18],[0.72,-1.22],[0.69,-1.25],[0.71,-1.15],
    [-0.5,-0.4],[-0.48,-0.42],[-0.52,-0.38],[-0.49,-0.44],[-0.51,-0.36],
    [0.2,2.8],[0.22,2.82],[0.18,2.78],[0.21,2.84],[0.19,2.76],
    [-0.6,0.9],[-0.58,0.92],[-0.62,0.88],[-0.59,0.95],[-0.61,0.85],
  ];
  // Water mineral positions — near iron clusters
  const waterPositions = [
    [0.41,0.51],[-0.30,1.81],[0.70,-1.20],[-0.50,-0.41],[0.20,2.81],
    [-0.60,0.91],[0.15,-0.6],[-0.15,0.3],[0.55,2.0],[-0.45,-1.5],
    [0.35,-2.1],[-0.25,-1.0],[0.60,-0.5],[-0.70,2.4],[0.10,1.2],
  ];

  for(let i=0;i<ironPositions.length;i++){
    const[lat,lon]=ironPositions[i];
    spawnMineral(lat, lon, 'iron', i);
  }
  for(let i=0;i<waterPositions.length;i++){
    const[lat,lon]=waterPositions[i];
    spawnMineral(lat, lon, 'water', ironPositions.length+i);
  }
}

function spawnMineral(lat, lon, type, id){
  const g = new THREE.Group();
  // Position on sphere surface
  const r = totalRadius(lat, lon) + 1.5;
  const worldPos = latLonToVec3(lat, lon, r);
  g.position.copy(worldPos);

  // Orient to sphere surface normal (up = outward radial)
  const up = worldPos.clone().normalize();
  g.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), up);

  g.userData = { type, id, collected:false, lat, lon, baseR:r, seed:Math.random()*Math.PI*2 };

  if(type==='iron'){
    const mat=new THREE.MeshStandardMaterial({
      color:0xb05a2f, roughness:0.55, metalness:0.75,
      emissive:0x4a1a08, emissiveIntensity:0.35
    });
    const m=new THREE.Mesh(new THREE.OctahedronGeometry(0.65,0), mat);
    m.castShadow=false;
    g.add(m);
    const s=new THREE.Mesh(new THREE.OctahedronGeometry(0.3,0), mat.clone());
    s.position.set(0.8,0.3,0); s.rotation.set(0.5,0.8,0);
    g.add(s);
    g.add(new THREE.PointLight(0xb05a2f, 0.5, 16));
  } else {
    const mat=new THREE.MeshStandardMaterial({
      color:0x00ffe7, roughness:0.08, metalness:0.25,
      emissive:0x00ffe7, emissiveIntensity:0.7,
      transparent:true, opacity:0.88, side:THREE.DoubleSide
    });
    g.add(new THREE.Mesh(new THREE.OctahedronGeometry(0.85,1), mat));
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(1.25,0.055,8,26),
      new THREE.MeshBasicMaterial({color:0x00ffe7, transparent:true, opacity:0.45})
    );
    ring.rotation.x=Math.PI/2;
    g.add(ring);
    const ring2=new THREE.Mesh(
      new THREE.TorusGeometry(1.0,0.04,6,20),
      new THREE.MeshBasicMaterial({color:0x88ffee, transparent:true, opacity:0.3})
    );
    ring2.rotation.set(0.6,0.4,0);
    g.add(ring2);
    g.add(new THREE.PointLight(0x00ffe7, 1.2, 24));
  }
  minerals.push(g);
  scene.add(g);
}

// ================================================================
//  ROVER
// ================================================================
async function loadRover(){
  // Initialize position on sphere
  roverSurfacePos = roverWorldPos();
  roverUp = roverSurfacePos.clone().normalize();

  roverGroup = new THREE.Group();
  roverGroup.position.copy(roverSurfacePos);
  scene.add(roverGroup);

  remoteGroup = new THREE.Group();
  remoteGroup.visible = false;
  scene.add(remoteGroup);

  return new Promise(res=>{
    if(typeof THREE.GLTFLoader === 'undefined'){
      buildProceduralRover(roverGroup, false);
      buildProceduralRover(remoteGroup, true);
      return res();
    }
    const loader = new THREE.GLTFLoader();
    loader.load('low_poly_rover__1_.glb',
      gltf=>{
        const model=gltf.scene;
        model.scale.setScalar(2.6);
        model.traverse(n=>{ if(n.isMesh){ n.castShadow=false; n.receiveShadow=false; } });
        roverGroup.add(model);
        const clone=gltf.scene.clone(true);
        clone.scale.setScalar(2.6);
        clone.traverse(n=>{
          if(n.isMesh){
            n.material=n.material.clone();
            n.material.color.setHex(0x4488ff);
            n.material.emissive=new THREE.Color(0x001133);
            n.material.emissiveIntensity=0.35;
          }
        });
        remoteGroup.add(clone);
        remoteGroup.add(new THREE.PointLight(0x4488ff,1,18));
        res();
      },
      undefined,
      ()=>{ buildProceduralRover(roverGroup,false); buildProceduralRover(remoteGroup,true); res(); }
    );
  });
}

function buildProceduralRover(g, isRemote){
  const bodyColor=isRemote?0x4466cc:0xccaa66;
  const body=new THREE.Mesh(
    new THREE.BoxGeometry(3.2,0.7,2.0),
    new THREE.MeshStandardMaterial({color:bodyColor,roughness:0.55,metalness:0.45})
  );
  body.position.y=0.9;
  g.add(body);
  const panel=new THREE.Mesh(
    new THREE.BoxGeometry(1.6,0.04,1.1),
    new THREE.MeshStandardMaterial({color:0x162238,roughness:0.25,metalness:0.9,emissive:0x0a1530,emissiveIntensity:0.6})
  );
  panel.position.set(0,1.32,0); panel.rotation.x=0.28;
  g.add(panel);
  g.add(Object.assign(new THREE.Mesh(
    new THREE.CylinderGeometry(0.06,0.06,1.9,6),
    new THREE.MeshStandardMaterial({color:0x888880,roughness:0.3,metalness:0.9})
  ),{position:new THREE.Vector3(-0.5,2.15,0)}));
  const wm=new THREE.MeshStandardMaterial({color:isRemote?0x223366:0x333330,roughness:0.95,metalness:0.3});
  const wg=new THREE.CylinderGeometry(0.48,0.48,0.38,10);
  [[-1.75,0.48,1.1],[-1.75,0.48,-1.1],[0,0.48,1.2],[0,0.48,-1.2],[1.75,0.48,1.1],[1.75,0.48,-1.1]].forEach(([wx,wy,wz])=>{
    const w=new THREE.Mesh(wg,wm); w.rotation.z=Math.PI/2; w.position.set(wx,wy,wz); g.add(w);
  });
  if(isRemote){ const gl=new THREE.PointLight(0x4488ff,1,16); gl.position.y=2; g.add(gl); }
}

// ================================================================
//  CONTROLS
// ================================================================
function bindControls(){
  document.addEventListener('keydown',e=>{
    keys[e.code]=true;
    if(e.code==='KeyE') collectNearest();
    if(e.code==='Escape') returnToMenu();
  });
  document.addEventListener('keyup',e=>{ keys[e.code]=false; });
  const cv=document.getElementById('c');
  cv.addEventListener('mousedown',e=>{
    if(e.button!==0){ mouseDown=true; lastMX=e.clientX; lastMY=e.clientY; e.preventDefault(); }
  });
  cv.addEventListener('mousemove',e=>{
    if(mouseDown){
      camYaw  -= (e.clientX-lastMX)*0.005;
      camPitch = Math.max(0.04,Math.min(1.05,camPitch-(e.clientY-lastMY)*0.005));
      lastMX=e.clientX; lastMY=e.clientY;
    }
  });
  document.addEventListener('mouseup',()=>mouseDown=false);
  cv.addEventListener('contextmenu',e=>e.preventDefault());
  cv.addEventListener('wheel',e=>{ camDist=Math.max(5,Math.min(70,camDist+e.deltaY*0.02)); });

  if(isMobile){
    document.getElementById('mobileControls').style.display='block';
    const jz=document.getElementById('joystickZone');
    const jk=nipplejs.create({zone:jz,mode:'static',position:{left:'65px',bottom:'65px'},size:108,color:'rgba(193,68,14,0.65)'});
    jk.on('move',(_,d)=>{ joystickDir.x=Math.cos(d.angle.radian)*d.force*0.75; joystickDir.y=Math.sin(d.angle.radian)*d.force*0.75; });
    jk.on('end',()=>{ joystickDir.x=0; joystickDir.y=0; });
    let tlId=-1,tlX=0,tlY=0;
    const tl=document.getElementById('touchLook');
    tl.addEventListener('touchstart',e=>{ const t=e.changedTouches[0]; tlId=t.identifier; tlX=t.clientX; tlY=t.clientY; },{passive:true});
    tl.addEventListener('touchmove',e=>{ for(const t of e.changedTouches){ if(t.identifier===tlId){ camYaw-=(t.clientX-tlX)*0.006; camPitch=Math.max(0.04,Math.min(1.05,camPitch-(t.clientY-tlY)*0.006)); tlX=t.clientX; tlY=t.clientY; } } },{passive:true});
  }
}

// ================================================================
//  GAME LOOP
// ================================================================
function startGame(){
  document.getElementById('gameContainer').style.display='block';
  clock.getDelta();
  gameStartTime=Date.now();
  // Initial chunk build
  updateChunks();
  loop();
}

let chunkUpdateTimer = 0;
function loop(){
  animId=requestAnimationFrame(loop);
  const dt=Math.min(clock.getDelta(), 0.05);

  tickRover(dt);
  tickMinerals(dt);
  tickDust(dt);
  updateCamera();
  drawHUD();

  // Chunk LOD update — expensive, run every 200ms max
  chunkUpdateTimer += dt;
  if(chunkUpdateTimer > 0.2){ updateChunks(); chunkUpdateTimer=0; }

  if(isMP){ syncT+=dt; if(syncT>0.09){ sendSync(); syncT=0; } }
  renderer.render(scene, camera);
}

// ================================================================
//  ROVER TICK — spherical surface movement
// ================================================================
const _tmpFwd  = new THREE.Vector3();
const _tmpRight= new THREE.Vector3();
const _tmpUp   = new THREE.Vector3();

function tickRover(dt){
  // ── Input ──────────────────────────────────────────
  let mx=0, mz=0;
  if(keys['KeyW']||keys['ArrowUp'])    mz-=1;
  if(keys['KeyS']||keys['ArrowDown'])  mz+=1;
  if(keys['KeyA']||keys['ArrowLeft'])  mx-=1;
  if(keys['KeyD']||keys['ArrowRight']) mx+=1;
  if(isMobile){ mx+=joystickDir.x; mz-=joystickDir.y; }
  const inputLen=Math.hypot(mx,mz);
  if(inputLen>1){ mx/=inputLen; mz/=inputLen; }

  // ── Tangent frame at rover position ────────────────
  // Up = surface normal
  _tmpUp.copy(roverSurfacePos).normalize();

  // Camera forward projected onto surface plane
  const camFwdX=Math.sin(camYaw), camFwdZ=Math.cos(camYaw);
  // "Forward" on sphere tangent plane: align with camYaw but projected to surface
  _tmpFwd.set(camFwdX, 0, camFwdZ);
  // Remove component along up
  _tmpFwd.addScaledVector(_tmpUp, -_tmpFwd.dot(_tmpUp));
  if(_tmpFwd.lengthSq()<0.001) _tmpFwd.set(0,0,1);
  _tmpFwd.normalize();
  _tmpRight.crossVectors(_tmpFwd, _tmpUp).normalize();

  // ── Desired surface velocity (in world space) ────
  const desiredVelX = (-mz*_tmpFwd.x + mx*_tmpRight.x) * ROVER_SPEED;
  const desiredVelZ = (-mz*_tmpFwd.z + mx*_tmpRight.z) * ROVER_SPEED;

  // Simple damped velocity
  roverLatVel += (desiredVelX - roverLatVel) * Math.min(1, 8*dt);
  roverLonVel += (desiredVelZ - roverLonVel) * Math.min(1, 8*dt);
  roverLatVel *= Math.pow(ROVER_FRICTION, dt);
  roverLonVel *= Math.pow(ROVER_FRICTION, dt);

  roverSpeed = Math.hypot(roverLatVel, roverLonVel);

  // Convert world velocity to angular velocity on sphere
  // v_angular = v_surface / radius
  const angScale = 1.0 / PLANET_R;
  // Decompose world velocity into lat/lon angular change
  // Forward (north) = increasing lat, Right (east) = increasing lon / cos(lat)
  const fwdComp  = roverLatVel*_tmpFwd.x + roverLonVel*_tmpFwd.z;
  const rightComp= roverLatVel*_tmpRight.x + roverLonVel*_tmpRight.z;

  // Angular deltas — scale by world->angle
  const dLat = fwdComp  * angScale * dt;
  const dLon = rightComp * angScale * dt / Math.max(0.1, Math.cos(roverLat));

  roverLat = Math.max(-Math.PI/2+0.01, Math.min(Math.PI/2-0.01, roverLat - dLat));
  roverLon = ((roverLon + dLon + Math.PI*3) % (Math.PI*2)) - Math.PI;

  // ── Update 3D position ─────────────────────────────
  roverSurfacePos = roverWorldPos();
  roverUp.copy(roverSurfacePos).normalize();

  roverGroup.position.copy(roverSurfacePos);

  // Orient rover to sphere surface
  const upQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), roverUp);
  // Then rotate by facing angle around up axis
  if(roverSpeed > 0.5){
    const velWorld = new THREE.Vector3(roverLatVel, 0, roverLonVel);
    velWorld.addScaledVector(roverUp, -velWorld.dot(roverUp));
    if(velWorld.lengthSq() > 0.01){
      const targetFacing = Math.atan2(velWorld.x, velWorld.z);
      let d = targetFacing - roverFacing;
      while(d>Math.PI)d-=Math.PI*2; while(d<-Math.PI)d+=Math.PI*2;
      roverFacing += d * 0.14;
    }
  }
  const facingQ = new THREE.Quaternion().setFromAxisAngle(roverUp, roverFacing);
  roverGroup.quaternion.multiplyQuaternions(facingQ, upQ);

  // ── Mineral proximity check ─────────────────────────
  nearestMineral = null;
  let minD = Infinity;
  for(const m of minerals){
    if(m.userData.collected||collected.has(m.userData.id)) continue;
    const d = roverSurfacePos.distanceTo(m.position);
    if(d < minD){ minD=d; nearestMineral=m; }
  }
  const cp=document.getElementById('collectPrompt');
  if(nearestMineral && minD < 8){
    cp.style.display='flex';
    document.getElementById('collectText').textContent=
      nearestMineral.userData.type==='water'?'Collect Water Mineral':'Scan Iron Deposit';
  } else { nearestMineral=null; cp.style.display='none'; }
}

// ================================================================
//  MINERALS TICK
// ================================================================
function tickMinerals(dt){
  const t=clock.getElapsedTime();
  for(const m of minerals){
    if(m.userData.collected||collected.has(m.userData.id)){ m.visible=false; continue; }
    // Float up/down — move along radial direction
    const floatOffset = Math.sin(t*1.6+m.userData.seed)*0.28;
    const radial = m.position.clone().normalize();
    m.position.copy(radial.multiplyScalar(m.userData.baseR + floatOffset));
    m.rotation.y += dt*(m.userData.type==='water'?1.4:0.5);
    if(m.userData.type==='water'&&m.children[1]){
      m.children[1].rotation.y+=dt*2.2;
      if(m.children[2]) m.children[2].rotation.x+=dt*1.5;
    }
  }
}

// ================================================================
//  CAMERA — orbits around rover on sphere surface
// ================================================================
function updateCamera(){
  // Camera position: orbit around rover using local tangent frame
  const up = roverUp.clone();
  // Build camera tangent vectors
  const right = new THREE.Vector3().crossVectors(up, new THREE.Vector3(0,0,1));
  if(right.lengthSq()<0.01) right.set(1,0,0);
  right.normalize();
  const fwd = new THREE.Vector3().crossVectors(right, up).normalize();

  // Orbit offset in local frame
  const offFwd  = -Math.sin(camYaw)*Math.cos(camPitch)*camDist;
  const offRight =  Math.cos(camYaw)*Math.cos(camPitch)*camDist;
  const offUp   =  Math.sin(camPitch)*camDist + 2;

  const camPos = roverSurfacePos.clone()
    .addScaledVector(fwd,   offFwd)
    .addScaledVector(right, offRight)
    .addScaledVector(up,    offUp);

  camTarget.x += (roverSurfacePos.x - camTarget.x)*0.1;
  camTarget.y += (roverSurfacePos.y - camTarget.y)*0.1;
  camTarget.z += (roverSurfacePos.z - camTarget.z)*0.1;

  camera.position.copy(camPos);
  const lookAt = camTarget.clone().addScaledVector(up, 1.5);
  camera.lookAt(lookAt);

  // Sky dome follows camera
  if(skyMesh) skyMesh.position.copy(camera.position);
}

// ================================================================
//  HUD
// ================================================================
function drawHUD(){
  document.getElementById('ironCount').textContent=ironCount;
  document.getElementById('waterCount').textContent=waterCount;
  const pct=Math.round(waterCount/TOTAL_WATER*100);
  document.getElementById('missionFill').style.width=pct+'%';
  document.getElementById('missionPct').textContent=pct+'%';

  // Altitude = terrain height above base sphere
  const alt=Math.max(0,surfaceHeight(roverLat,roverLon)).toFixed(0);
  document.getElementById('altVal').textContent=alt+'m';
  document.getElementById('speedVal').textContent=roverSpeed.toFixed(1);

  // Compass — heading relative to north (increasing lat = north)
  const di=Math.round(((roverFacing%(Math.PI*2)+Math.PI*2)%(Math.PI*2))/Math.PI/2*8);
  document.getElementById('compassDir').textContent=['N','NE','E','SE','S','SW','W','NW','N'][di];

  drawRadar();
  drawMinimap();
}

// ================================================================
//  RADAR
// ================================================================
function drawRadar(){
  const cv=document.getElementById('radarCanvas');
  const ctx=cv.getContext('2d');
  const W=cv.width,H=cv.height,cx=W/2,cy=H/2,R=cx-3;
  ctx.clearRect(0,0,W,H);
  const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
  bg.addColorStop(0,'rgba(0,50,35,0.95)'); bg.addColorStop(1,'rgba(0,18,12,0.95)');
  ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(0,255,231,0.09)'; ctx.lineWidth=0.5;
  [1,2,3].forEach(i=>{ ctx.beginPath(); ctx.arc(cx,cy,R*i/3,0,Math.PI*2); ctx.stroke(); });
  ctx.beginPath();ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy+R);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.stroke();

  // Sweep line
  const sa=(Date.now()/1800)%(Math.PI*2);
  for(let i=0;i<10;i++){
    const a=sa-i*0.1;
    ctx.strokeStyle=`rgba(0,255,231,${Math.max(0,0.7-i*0.06)})`;
    ctx.lineWidth=i===0?1.5:0.8;
    ctx.beginPath();ctx.moveTo(cx,cy);
    ctx.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);ctx.stroke();
  }

  // Minerals on radar (using surface angular distance)
  const radarArcR = RADAR_R / PLANET_R;  // convert to radians
  for(const m of minerals){
    if(m.userData.collected||collected.has(m.userData.id)) continue;
    const dArc = gcDist(roverLat,roverLon, m.userData.lat, m.userData.lon);
    if(dArc > radarArcR) continue;

    // Bearing from rover to mineral
    const dLat = m.userData.lat - roverLat;
    const dLon = m.userData.lon - roverLon;
    const bearing = Math.atan2(dLon*Math.cos(roverLat), dLat) - roverFacing;
    const nr=(dArc/radarArcR)*R*0.88;
    const px=cx+Math.sin(bearing)*nr, py=cy-Math.cos(bearing)*nr;

    if(m.userData.type==='iron'){
      ctx.fillStyle='rgba(180,90,47,0.88)';
      ctx.beginPath();ctx.arc(px,py,2.3,0,Math.PI*2);ctx.fill();
    } else {
      ctx.shadowColor='#00ffe7';ctx.shadowBlur=5;
      ctx.fillStyle='rgba(0,255,231,0.95)';
      ctx.beginPath();ctx.arc(px,py,3.5,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
    }
  }

  // Self dot
  ctx.shadowColor='#00ff88';ctx.shadowBlur=8;
  ctx.fillStyle='#00ff88';
  ctx.beginPath();ctx.arc(cx,cy,4,0,Math.PI*2);ctx.fill();
  ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(0,255,231,0.38)';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.stroke();
}

// ================================================================
//  MINIMAP — shows patch of sphere as flat map
// ================================================================
function drawMinimap(){
  const cv=document.getElementById('minimapCanvas');
  const ctx=cv.getContext('2d');
  const W=cv.width,H=cv.height;
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='rgba(8,3,1,0.94)';ctx.fillRect(0,0,W,H);

  const VIEW_ARC=0.6; // radians visible on minimap
  const toMap=(lat,lon)=>({
    x: W/2+(lon-roverLon)/VIEW_ARC*(W/2),
    y: H/2-(lat-roverLat)/VIEW_ARC*(H/2)
  });

  // Olympus Mons marker
  const om=toMap(0.314,-2.29);
  if(om.x>0&&om.x<W&&om.y>0&&om.y<H){
    ctx.strokeStyle='rgba(255,200,100,0.5)';ctx.lineWidth=1;
    ctx.beginPath();ctx.arc(om.x,om.y,10,0,Math.PI*2);ctx.stroke();
    ctx.fillStyle='rgba(255,200,100,0.6)';ctx.font='7px Share Tech Mono';
    ctx.fillText('▲',om.x-4,om.y-12);
  }

  // Minerals
  for(const m of minerals){
    if(m.userData.collected||collected.has(m.userData.id)) continue;
    const p=toMap(m.userData.lat,m.userData.lon);
    if(p.x<0||p.x>W||p.y<0||p.y>H) continue;
    if(m.userData.type==='iron'){
      ctx.fillStyle='rgba(176,90,47,0.7)';ctx.fillRect(p.x-1,p.y-1,2,2);
    } else {
      ctx.shadowColor='#00ffe7';ctx.shadowBlur=4;
      ctx.fillStyle='rgba(0,255,231,0.92)';
      ctx.beginPath();ctx.arc(p.x,p.y,2.5,0,Math.PI*2);ctx.fill();
      ctx.shadowBlur=0;
    }
  }

  // Player
  ctx.shadowColor='#00ff88';ctx.shadowBlur=7;
  ctx.fillStyle='#00ff88';
  ctx.beginPath();ctx.arc(W/2,H/2,4,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#00ff88';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(W/2,H/2);
  ctx.lineTo(W/2+Math.sin(roverFacing)*8,H/2-Math.cos(roverFacing)*8);
  ctx.stroke();ctx.shadowBlur=0;
  ctx.strokeStyle='rgba(193,68,14,0.35)';ctx.lineWidth=1;ctx.strokeRect(0,0,W,H);
}

// ================================================================
//  COLLECT
// ================================================================
function collectNearest(){
  if(!nearestMineral) return;
  const m=nearestMineral;
  if(m.userData.collected||collected.has(m.userData.id)) return;
  m.userData.collected=true;
  collected.add(m.userData.id);
  if(m.userData.type==='iron'){
    ironCount++;
    toast('⬡ Iron deposit scanned — coordinates logged');
  } else {
    waterCount++;
    toast('◈ Water mineral secured! H₂O traces confirmed');
    if(waterCount>=TOTAL_WATER) setTimeout(missionComplete,1200);
  }
  sendCollect(m.userData.id, m.userData.type);
  spawnFX(m.position.clone(), m.userData.type==='water'?0x00ffe7:0xb05a2f);
}

function spawnFX(pos, color){
  const N=24;
  const geo=new THREE.BufferGeometry();
  const pa=new Float32Array(N*3);
  const va=new Float32Array(N*3);
  const up=pos.clone().normalize();
  for(let i=0;i<N;i++){
    pa[i*3]=pos.x;pa[i*3+1]=pos.y;pa[i*3+2]=pos.z;
    const rx=(Math.random()-0.5)*6, ry=Math.random()*5+1, rz=(Math.random()-0.5)*6;
    // Orient along surface
    const v3=new THREE.Vector3(rx,ry,rz);
    v3.addScaledVector(up, v3.dot(up)*0.5);
    va[i*3]=v3.x;va[i*3+1]=v3.y;va[i*3+2]=v3.z;
  }
  geo.setAttribute('position',new THREE.BufferAttribute(pa,3));
  const mat=new THREE.PointsMaterial({color,size:0.35,transparent:true,opacity:1});
  const pts=new THREE.Points(geo,mat);
  scene.add(pts);
  let life=0;
  const tick=()=>{
    life+=0.04;mat.opacity=Math.max(0,1-life);
    const p=pts.geometry.attributes.position;
    for(let i=0;i<N;i++){
      p.setX(i,p.getX(i)+va[i*3]*0.04);
      p.setY(i,p.getY(i)+va[i*3+1]*0.04);
      p.setZ(i,p.getZ(i)+va[i*3+2]*0.04);
    }
    p.needsUpdate=true;
    if(life<1) requestAnimationFrame(tick); else scene.remove(pts);
  };
  tick();
}

// ================================================================
//  TOAST
// ================================================================
let _toastTm=null;
function toast(msg){
  const el=document.getElementById('toast');
  el.textContent=msg;el.style.display='block';
  if(_toastTm) clearTimeout(_toastTm);
  _toastTm=setTimeout(()=>el.style.display='none',3200);
}

// ================================================================
//  MISSION COMPLETE
// ================================================================
function missionComplete(){
  if(animId){cancelAnimationFrame(animId);animId=null;}
  const elapsed=Math.round((Date.now()-gameStartTime)/1000);
  document.getElementById('mcIron').textContent=ironCount;
  document.getElementById('mcWater').textContent=waterCount;
  document.getElementById('mcTime').textContent=`${Math.floor(elapsed/60)}:${String(elapsed%60).padStart(2,'0')}`;
  document.getElementById('missionComplete').style.display='flex';
  saveScore(waterCount,ironCount,elapsed);
}


// ================================================================
//  MULTIPLAYER — Cloudflare Workers + Durable Objects WebSocket
// ================================================================

// ── Buat room via Worker REST, lalu buka WebSocket ke DO ──
async function createRoom(){
  const nm=document.getElementById('playerName').value.trim()||'ROVER-1';
  playerName=nm;
  const btnC=document.getElementById('btnCreateRoom');
  btnC.disabled=true;
  setMpStatus('Contacting mission control...');
  try{
    // 1. Buat room di Worker → dapat roomCode
    const res=await fetch(`${WORKER_URL}/api/room/create`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:nm})
    });
    if(!res.ok) throw new Error(`Server: ${res.status}`);
    const {roomCode:code}=await res.json();
    roomCode=code;
    document.getElementById('roomCodeDisplay').textContent=code;
    document.getElementById('roomDisplay').style.display='block';
    setMpStatus('');
    // 2. Buka WebSocket ke Durable Object room
    openWS(code, nm);
  }catch(e){
    setMpStatus('❌ Gagal membuat room: '+e.message);
    btnC.disabled=false;
  }
}

// ── Join room yang sudah ada ──
async function joinRoom(){
  const nm=document.getElementById('playerName').value.trim()||'ROVER-2';
  playerName=nm;
  const code=document.getElementById('roomCodeInput').value.trim().toUpperCase();
  if(code.length!==4){ setMpStatus('Masukkan kode 4 karakter'); return; }
  const btnJ=document.getElementById('btnJoinRoom');
  btnJ.disabled=true;
  setMpStatus('Menghubungkan ke misi...');
  roomCode=code;
  openWS(code, nm);
}

// ── Buka WebSocket native ke Cloudflare Durable Object ──
function openWS(code, name){
  const proto=location.protocol==='https:'?'wss':'ws';
  const host=WORKER_URL
    ? WORKER_URL.replace(/^https?/,proto)
    : `${proto}://${location.host}`;
  const url=`${host}/api/room/${code}/join?name=${encodeURIComponent(name)}`;
  ws=new WebSocket(url);

  ws.onopen=()=>{
    setMpStatus('✓ Terhubung ke server...');
  };

  ws.onmessage=evt=>{
    let msg; try{ msg=JSON.parse(evt.data); }catch{ return; }
    onServerMsg(msg);
  };

  ws.onerror=()=>{
    setMpStatus('❌ Koneksi gagal. Periksa kode room.');
    document.getElementById('btnCreateRoom').disabled=false;
    document.getElementById('btnJoinRoom').disabled=false;
  };

  ws.onclose=evt=>{
    if(isMP){
      document.getElementById('connIndicator').style.display='none';
      toast('Co-pilot terputus dari server');
      isMP=false;
    }
  };
}

// ── Handler pesan dari Durable Object ──
function onServerMsg(msg){
  switch(msg.type){

    case 'welcome':
      // Server konfirmasi koneksi — terima state awal
      mySid=msg.sid;
      myRole=msg.role;
      isMP=true;
      // Terapkan minerals yang sudah dikumpulkan di session ini
      if(msg.gameState && msg.gameState.collected){
        msg.gameState.collected.forEach(id=>{
          collected.add(id);
          const m=minerals.find(mi=>mi.userData.id===id);
          if(m) m.userData.collected=true;
        });
      }
      if(msg.role==='host'){
        document.getElementById('waitingStatus').textContent='⌛ Menunggu co-pilot...';
        setMpStatus('Room siap — bagikan kode!');
      }
      break;

    case 'player_joined':
      document.getElementById('waitingStatus').textContent=`✓ ${msg.name} bergabung!`;
      setMpStatus(`Pemain ${msg.totalPlayers}/2 terhubung`);
      break;

    case 'game_start':
      // Kedua pemain siap → mulai game
      setTimeout(()=>{ hideMpPanel(); startMPGame(); }, 600);
      break;

    case 'pos':
      // Update posisi rover lawan
      if(remoteGroup){
        remoteGroup.visible=true;
        remoteGroup.position.set(msg.x, msg.y, msg.z);
        remoteGroup.rotation.set(msg.rx, msg.ry, msg.rz);
      }
      break;

    case 'collect_confirm':
      // Server authoritative: konfirmasi collect dari siapapun
      if(!collected.has(msg.id)){
        collected.add(msg.id);
        const m=minerals.find(mi=>mi.userData.id===msg.id);
        if(m) m.userData.collected=true;
        if(msg.collectorSid!==mySid){
          // Co-pilot yang collect
          if(msg.mineralType==='water'){
            waterCount++;
            toast('◈ Co-pilot menemukan Water Mineral!');
            if(waterCount>=TOTAL_WATER) setTimeout(missionComplete,1200);
          } else {
            ironCount++;
          }
        }
        // Jika collectorSid===mySid berarti ini konfirmasi collect kita sendiri
        // (sudah di-handle di collectNearest sebelum kirim ke server)
      }
      break;

    case 'player_left':
      document.getElementById('connIndicator').style.display='none';
      toast(`${msg.name} meninggalkan misi`);
      if(remoteGroup) remoteGroup.visible=false;
      break;

    case 'pong':
      break;
  }
}

// ── Kirim posisi rover ke server setiap 90ms ──
function sendSync(){
  if(ws && ws.readyState===WebSocket.OPEN){
    ws.send(JSON.stringify({
      type:'pos',
      x:roverPos.x, y:roverPos.y, z:roverPos.z,
      rx:roverGroup.rotation.x, ry:roverGroup.rotation.y, rz:roverGroup.rotation.z
    }));
  }
}

// ── Kirim collect event ke server (server validate + broadcast) ──
function sendCollect(id, mineralType){
  if(ws && ws.readyState===WebSocket.OPEN){
    ws.send(JSON.stringify({type:'collect', id, mineralType}));
  }
}

function setMpStatus(msg){ document.getElementById('mpStatus').textContent=msg; }

function startMPGame(){
  document.getElementById('mpBadge').style.display='block';
  document.getElementById('connIndicator').style.display='flex';
  if(remoteGroup) remoteGroup.visible=true;
  startGame();
}

// ── Leaderboard (KV) ──────────────────────────────────────────
async function showLeaderboard(){
  document.getElementById('mainMenu').style.display='none';
  document.getElementById('lbPanel').style.display='flex';
  document.getElementById('lbContent').innerHTML='<div class="lb-loading">◈ Memuat data misi...</div>';
  try{
    const res=await fetch(`${WORKER_URL}/api/leaderboard`);
    if(!res.ok) throw new Error(res.status);
    const data=await res.json();
    renderLeaderboard(data);
  }catch(e){
    document.getElementById('lbContent').innerHTML=
      '<div class="lb-empty">Tidak dapat terhubung ke server.<br>Pastikan Worker sudah di-deploy.</div>';
  }
}

function renderLeaderboard(rows){
  if(!rows||rows.length===0){
    document.getElementById('lbContent').innerHTML='<div class="lb-empty">Belum ada misi selesai.<br>Jadilah yang pertama!</div>';
    return;
  }
  const medals=['🥇','🥈','🥉'];
  const fmt=s=>{ const m=Math.floor(s/60),sc=String(s%60).padStart(2,'0'); return `${m}:${sc}`; };
  const rows_html=rows.slice(0,15).map((r,i)=>`
    <tr>
      <td class="lb-rank">${medals[i]||'#'+(i+1)}</td>
      <td class="lb-name">${escHtml(r.name)}</td>
      <td class="lb-water">◈ ${r.water}</td>
      <td class="lb-iron">⬡ ${r.iron}</td>
      <td class="lb-time">${fmt(r.time)}</td>
      <td class="lb-time" style="opacity:.4">${r.mp?'CO-OP':''}</td>
    </tr>`).join('');
  document.getElementById('lbContent').innerHTML=`
    <table class="lb-table">
      <thead><tr>
        <th>#</th><th>Pilot</th><th>H₂O</th><th>Fe</th><th>Waktu</th><th></th>
      </tr></thead>
      <tbody>${rows_html}</tbody>
    </table>`;
}

function escHtml(s){ return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function hideLb(){
  document.getElementById('lbPanel').style.display='none';
  document.getElementById('mainMenu').style.display='block';
}

// ── Simpan skor ke KV setelah mission complete ──
async function saveScore(water, iron, time){
  try{
    await fetch(`${WORKER_URL}/api/leaderboard`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ name:playerName, water, iron, time, mp:isMP })
    });
  }catch(_){}  // silent fail — game tetap jalan
}


// ================================================================
//  MENU NAV
// ================================================================
function showMenu(){
  document.getElementById('mainMenu').style.display='block';
  animMenuStars();
}

function startSinglePlayer(){
  document.getElementById('mainMenu').style.display='none';
  isMP=false;
  // Reset state
  ironCount=0; waterCount=0;
  collected.clear();
  minerals.forEach(m=>{ m.userData.collected=false; m.visible=true; });
  roverLat=0; roverLon=0; roverLatVel=0; roverLonVel=0; roverFacing=0;
  roverSurfacePos=roverWorldPos();
  if(roverGroup) roverGroup.position.copy(roverSurfacePos);
  startGame();
}

function showMpPanel(){
  document.getElementById('mainMenu').style.display='none';
  document.getElementById('mpPanel').style.display='flex';
}

function hideMpPanel(){
  document.getElementById('mpPanel').style.display='none';
  if(document.getElementById('gameContainer').style.display==='none')
    document.getElementById('mainMenu').style.display='block';
}

function switchMpTab(tab){
  document.querySelectorAll('.mp-tab').forEach((t,i)=>t.classList.toggle('active',i===(tab==='create'?0:1)));
  document.getElementById('mpCreate').classList.toggle('active',tab==='create');
  document.getElementById('mpJoin').classList.toggle('active',tab==='join');
}

function returnToMenu(){
  if(animId){cancelAnimationFrame(animId);animId=null;}
  document.getElementById('gameContainer').style.display='none';
  document.getElementById('missionComplete').style.display='none';
  document.getElementById('mpBadge').style.display='none';
  document.getElementById('connIndicator').style.display='none';
  if(ws){try{ws.close();}catch(e){} ws=null;}
  isMP=false; mySid=-1;
  // Clean chunks
  for(const[,mesh] of chunkMap){ scene.remove(mesh); mesh.geometry.dispose(); }
  chunkMap.clear();
  // Reset minerals
  minerals.forEach(m=>{ m.userData.collected=false; m.visible=true; });
  collected.clear(); ironCount=0; waterCount=0;
  roverLat=0; roverLon=0; roverLatVel=0; roverLonVel=0; roverFacing=0;
  roverSurfacePos=roverWorldPos();
  if(roverGroup) roverGroup.position.copy(roverSurfacePos);
  if(remoteGroup) remoteGroup.visible=false;
  showMenu();
}

// ================================================================
//  MENU STAR ANIMATION
// ================================================================
let menuAnimRunning=false;
function animMenuStars(){
  const cv=document.getElementById('menuStars');
  if(!cv) return;
  cv.width=window.innerWidth; cv.height=window.innerHeight;
  const ctx=cv.getContext('2d');
  if(menuAnimRunning) return;
  menuAnimRunning=true;
  const stars=Array.from({length:220},()=>({
    x:Math.random()*cv.width, y:Math.random()*cv.height,
    r:Math.random()*1.4+0.2, phase:Math.random()*Math.PI*2, speed:Math.random()*0.5+0.2
  }));
  const draw=()=>{
    if(document.getElementById('mainMenu').style.display==='none'){menuAnimRunning=false;return;}
    ctx.clearRect(0,0,cv.width,cv.height);
    const t=Date.now()/1000;
    for(const s of stars){
      const o=0.25+0.75*(0.5+0.5*Math.sin(t*s.speed+s.phase));
      ctx.globalAlpha=o; ctx.fillStyle='#fff';
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;
    requestAnimationFrame(draw);
  };
  draw();
}

// ================================================================
//  LEADERBOARD HELPERS (no D1 — KV only)
// ================================================================
async function showLeaderboard(){
  document.getElementById('mainMenu').style.display='none';
  document.getElementById('lbPanel').style.display='flex';
  document.getElementById('lbContent').innerHTML='<div class="lb-loading">◈ Memuat data misi...</div>';
  try{
    const res=await fetch(`${WORKER_URL}/api/leaderboard`);
    if(!res.ok) throw new Error(res.status);
    renderLeaderboard(await res.json());
  }catch(e){
    document.getElementById('lbContent').innerHTML=
      '<div class="lb-empty">Tidak dapat terhubung ke server.<br>Pastikan Worker sudah di-deploy.</div>';
  }
}

function renderLeaderboard(rows){
  if(!rows||rows.length===0){
    document.getElementById('lbContent').innerHTML='<div class="lb-empty">Belum ada misi selesai.<br>Jadilah yang pertama!</div>';
    return;
  }
  const medals=['🥇','🥈','🥉'];
  const fmt=s=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
  const rows_html=rows.slice(0,15).map((r,i)=>`
    <tr>
      <td class="lb-rank">${medals[i]||'#'+(i+1)}</td>
      <td class="lb-name">${escHtml(r.name)}</td>
      <td class="lb-water">◈ ${r.water}</td>
      <td class="lb-iron">⬡ ${r.iron}</td>
      <td class="lb-time">${fmt(r.time)}</td>
      <td class="lb-time" style="opacity:.4">${r.mp?'CO-OP':''}</td>
    </tr>`).join('');
  document.getElementById('lbContent').innerHTML=`
    <table class="lb-table">
      <thead><tr><th>#</th><th>Pilot</th><th>H₂O</th><th>Fe</th><th>Waktu</th><th></th></tr></thead>
      <tbody>${rows_html}</tbody>
    </table>`;
}

function escHtml(s){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

function hideLb(){
  document.getElementById('lbPanel').style.display='none';
  document.getElementById('mainMenu').style.display='block';
}

async function saveScore(water,iron,time){
  try{
    await fetch(`${WORKER_URL}/api/leaderboard`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name:playerName,water,iron,time,mp:isMP})
    });
  }catch(_){}
}

// ================================================================
//  BOOT
// ================================================================
window.addEventListener('load', bootGame);

</script>
</body>
</html>
