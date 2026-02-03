/**
 * 掼蛋记分器 - Cloudflare Workers 版本
 * 红蓝两方对战，扑克牌比分系统 (2-A)
 */

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>掼蛋记分器</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    
    html, body {
      height: 100%;
      overflow: hidden;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 10px;
      color: #fff;
    }
    
    /* 顶部栏：时间 + 全屏按钮 */
    .header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px 10px;
    }
    
    .clock {
      font-size: clamp(1rem, 4vw, 1.5rem);
      font-weight: bold;
      color: #f1c40f;
      text-shadow: 1px 1px 3px rgba(0,0,0,0.3);
      font-variant-numeric: tabular-nums;
    }
    
    .btn-fullscreen {
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.3);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-size: clamp(0.7rem, 2.5vw, 0.9rem);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    
    .btn-fullscreen:hover {
      background: rgba(255,255,255,0.25);
    }
    
    .btn-fullscreen:active {
      transform: scale(0.95);
    }
    
    .fullscreen-icon {
      width: 16px;
      height: 16px;
    }
    
    .title {
      font-size: clamp(1.2rem, 5vw, 2rem);
      font-weight: bold;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 2px;
      text-align: center;
    }
    
    /* 主内容区 */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      gap: 15px;
    }
    
    .scoreboard {
      display: flex;
      gap: clamp(10px, 3vw, 20px);
      justify-content: center;
      align-items: stretch;
      width: 100%;
      max-width: 800px;
    }
    
    .team {
      background: rgba(255,255,255,0.1);
      border-radius: clamp(12px, 3vw, 20px);
      padding: clamp(15px, 4vw, 30px) clamp(15px, 5vw, 40px);
      text-align: center;
      backdrop-filter: blur(10px);
      border: 3px solid transparent;
      transition: all 0.3s ease;
      flex: 1;
      max-width: 45%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .team.red {
      border-color: #ff4757;
      box-shadow: 0 0 20px rgba(255,71,87,0.3);
    }
    
    .team.blue {
      border-color: #3742fa;
      box-shadow: 0 0 20px rgba(55,66,250,0.3);
    }
    
    .team-name {
      font-size: clamp(1rem, 4vw, 1.5rem);
      font-weight: bold;
      margin-bottom: clamp(8px, 2vw, 20px);
      letter-spacing: 2px;
    }
    
    .team.red .team-name {
      color: #ff4757;
    }
    
    .team.blue .team-name {
      color: #3742fa;
    }
    
    .score {
      font-size: clamp(3rem, 15vw, 6rem);
      font-weight: bold;
      margin: clamp(5px, 2vw, 20px) 0;
      line-height: 1;
      text-shadow: 3px 3px 6px rgba(0,0,0,0.4);
    }
    
    .team.red .score {
      color: #ff6b7a;
    }
    
    .team.blue .score {
      color: #5a67f2;
    }
    
    .controls {
      display: flex;
      gap: clamp(8px, 2vw, 15px);
      justify-content: center;
      margin-top: clamp(8px, 2vw, 15px);
    }
    
    .btn {
      padding: clamp(8px, 2.5vw, 15px) clamp(16px, 5vw, 30px);
      font-size: clamp(1rem, 4vw, 1.5rem);
      border: none;
      border-radius: clamp(8px, 2vw, 12px);
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: bold;
      touch-action: manipulation;
    }
    
    .btn:active {
      transform: scale(0.95);
    }
    
    .btn-up {
      background: linear-gradient(135deg, #2ecc71, #27ae60);
      color: white;
    }
    
    .btn-up:hover {
      background: linear-gradient(135deg, #27ae60, #1e8449);
    }
    
    .btn-down {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
    }
    
    .btn-down:hover {
      background: linear-gradient(135deg, #c0392b, #a93226);
    }
    
    /* 比分刻度显示 */
    .score-scale {
      display: flex;
      justify-content: center;
      gap: clamp(4px, 1.5vw, 8px);
      flex-wrap: wrap;
      max-width: 100%;
      padding: 0 10px;
    }
    
    .scale-item {
      width: clamp(24px, 6vw, 35px);
      height: clamp(24px, 6vw, 35px);
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: clamp(5px, 1.5vw, 8px);
      font-weight: bold;
      font-size: clamp(0.7rem, 2.5vw, 0.9rem);
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.5);
      transition: all 0.3s ease;
    }
    
    .scale-item.active-red {
      background: linear-gradient(135deg, #ff4757, #ff6b7a);
      color: white;
      box-shadow: 0 0 10px rgba(255,71,87,0.5);
    }
    
    .scale-item.active-blue {
      background: linear-gradient(135deg, #3742fa, #5a67f2);
      color: white;
      box-shadow: 0 0 10px rgba(55,66,250,0.5);
    }
    
    /* 底部操作区 */
    .footer {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 10px;
    }
    
    .btn-reset {
      background: linear-gradient(135deg, #9b59b6, #8e44ad);
      color: white;
      padding: clamp(10px, 3vw, 15px) clamp(25px, 8vw, 50px);
      font-size: clamp(0.9rem, 3vw, 1.1rem);
    }
    
    .btn-reset:hover {
      background: linear-gradient(135deg, #8e44ad, #7d3c98);
    }
    
    /* 确认对话框 */
    .modal-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 1000;
      align-items: center;
      justify-content: center;
    }
    
    .modal-overlay.show {
      display: flex;
    }
    
    .modal {
      background: linear-gradient(135deg, #2d3436, #1e272e);
      padding: clamp(20px, 5vw, 30px) clamp(25px, 6vw, 40px);
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      max-width: 90%;
      width: 320px;
    }
    
    .modal h3 {
      font-size: clamp(1.2rem, 4vw, 1.5rem);
      margin-bottom: 15px;
      color: #f39c12;
    }
    
    .modal p {
      margin-bottom: 20px;
      color: #bdc3c7;
      font-size: clamp(0.9rem, 3vw, 1rem);
    }
    
    .modal-buttons {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    
    .btn-confirm {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
      padding: clamp(10px, 2.5vw, 12px) clamp(20px, 5vw, 30px);
    }
    
    .btn-cancel {
      background: linear-gradient(135deg, #95a5a6, #7f8c8d);
      color: white;
      padding: clamp(10px, 2.5vw, 12px) clamp(20px, 5vw, 30px);
    }
    
    /* 胜利提示 */
    .winner-banner {
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: clamp(25px, 6vw, 40px) clamp(35px, 10vw, 60px);
      border-radius: 20px;
      font-size: clamp(1.5rem, 6vw, 2.5rem);
      font-weight: bold;
      z-index: 100;
      animation: pulse 0.5s ease-in-out infinite alternate;
      text-align: center;
    }
    
    .winner-banner.show {
      display: block;
    }
    
    .winner-banner.red {
      background: linear-gradient(135deg, #ff4757, #ff6b7a);
      box-shadow: 0 0 50px rgba(255,71,87,0.7);
    }
    
    .winner-banner.blue {
      background: linear-gradient(135deg, #3742fa, #5a67f2);
      box-shadow: 0 0 50px rgba(55,66,250,0.7);
    }
    
    @keyframes pulse {
      from { transform: translate(-50%, -50%) scale(1); }
      to { transform: translate(-50%, -50%) scale(1.05); }
    }
    
    /* 横屏自适应 */
    @media (orientation: landscape) and (max-height: 500px) {
      html, body {
        overflow: auto;
      }
      
      body {
        padding: 5px 15px;
        min-height: auto;
        height: auto;
        justify-content: flex-start;
      }
      
      .header {
        padding: 2px 10px;
      }
      
      .title {
        font-size: clamp(0.9rem, 4vh, 1.3rem);
        margin-bottom: 5px;
      }
      
      .main-content {
        flex-direction: column;
        gap: 8px;
        width: 100%;
        flex: none;
      }
      
      .scoreboard {
        gap: clamp(10px, 3vw, 20px);
      }
      
      .score-scale {
        flex-direction: row;
        flex-wrap: wrap;
        gap: 5px;
        padding: 5px 10px;
      }
      
      .scale-item {
        width: clamp(24px, 4vw, 32px);
        height: clamp(24px, 4vw, 32px);
        font-size: clamp(0.65rem, 1.8vw, 0.85rem);
        border-radius: 5px;
      }
      
      .team {
        padding: clamp(8px, 2vh, 12px) clamp(15px, 4vw, 25px);
        border-radius: clamp(10px, 2vh, 15px);
        border-width: 2px;
        min-width: auto;
        max-width: none;
      }
      
      .team-name {
        font-size: clamp(0.9rem, 3vh, 1.2rem);
        margin-bottom: clamp(3px, 1vh, 8px);
      }
      
      .score {
        font-size: clamp(2.5rem, 18vh, 5rem);
        margin: clamp(3px, 1vh, 10px) 0;
      }
      
      .controls {
        margin-top: clamp(3px, 1vh, 8px);
        gap: clamp(8px, 2vw, 15px);
      }
      
      .controls .btn {
        padding: clamp(6px, 1.5vh, 10px) clamp(15px, 4vw, 25px);
        font-size: clamp(0.9rem, 3vh, 1.2rem);
        border-radius: clamp(6px, 1.5vh, 10px);
      }
      
      .footer {
        padding: 8px 10px;
        margin-top: 5px;
      }
      
      .btn-reset {
        padding: clamp(8px, 2vh, 12px) clamp(25px, 6vw, 40px);
        font-size: clamp(0.85rem, 2.5vh, 1rem);
      }
    }
    
    /* 超小屏幕 (< 360px) */
    @media (max-width: 359px) {
      .team {
        padding: 12px 10px;
      }
      
      .score {
        font-size: 2.5rem;
      }
      
      .controls .btn {
        padding: 8px 14px;
        font-size: 0.9rem;
      }
      
      .scale-item {
        width: 22px;
        height: 22px;
        font-size: 0.65rem;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="clock" id="clock">--:--:--</div>
    <button class="btn-fullscreen" id="btn-fullscreen" onclick="toggleFullscreen()">
      <svg class="fullscreen-icon" id="fullscreen-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
      </svg>
      <span id="fullscreen-text">全屏</span>
    </button>
  </div>
  
  <h1 class="title">掼蛋记分器</h1>
  
  <div class="main-content">
    <div class="scoreboard">
      <div class="team red">
        <div class="team-name">红方</div>
        <div class="score" id="red-score">2</div>
        <div class="controls">
          <button class="btn btn-down" onclick="changeScore('red', -1)">-</button>
          <button class="btn btn-up" onclick="changeScore('red', 1)">+</button>
        </div>
      </div>
      
      <div class="team blue">
        <div class="team-name">蓝方</div>
        <div class="score" id="blue-score">2</div>
        <div class="controls">
          <button class="btn btn-down" onclick="changeScore('blue', -1)">-</button>
          <button class="btn btn-up" onclick="changeScore('blue', 1)">+</button>
        </div>
      </div>
    </div>
    
    <div class="score-scale" id="score-scale"></div>
  </div>
  
  <div class="footer">
    <button class="btn btn-reset" onclick="showResetConfirm()">重置比分</button>
  </div>
  
  <!-- 确认对话框 -->
  <div class="modal-overlay" id="modal-overlay">
    <div class="modal">
      <h3>确认重置</h3>
      <p>确定要重置双方比分吗？<br>此操作无法撤销！</p>
      <div class="modal-buttons">
        <button class="btn btn-cancel" onclick="hideResetConfirm()">取消</button>
        <button class="btn btn-confirm" onclick="resetScores()">确认重置</button>
      </div>
    </div>
  </div>
  
  <!-- 胜利横幅 -->
  <div class="winner-banner" id="winner-banner"></div>
  
  <script>
    // 扑克牌比分序列
    const SCORES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    // 当前比分索引
    let state = {
      red: 0,
      blue: 0
    };
    
    // 初始化
    function init() {
      // 尝试从 localStorage 恢复
      const saved = localStorage.getItem('guandan-scores');
      if (saved) {
        try {
          state = JSON.parse(saved);
        } catch (e) {
          state = { red: 0, blue: 0 };
        }
      }
      renderScoreScale();
      updateDisplay();
      startClock();
      updateFullscreenButton();
    }
    
    // 时钟功能 (24小时制)
    function startClock() {
      function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        document.getElementById('clock').textContent = hours + ':' + minutes + ':' + seconds;
      }
      updateClock();
      setInterval(updateClock, 1000);
    }
    
    // 全屏功能
    function toggleFullscreen() {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        // 进入全屏
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }
    
    function updateFullscreenButton() {
      const isFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
      const text = document.getElementById('fullscreen-text');
      const icon = document.getElementById('fullscreen-icon');
      
      if (isFullscreen) {
        text.textContent = '退出';
        icon.innerHTML = '<path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>';
      } else {
        text.textContent = '全屏';
        icon.innerHTML = '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>';
      }
    }
    
    // 监听全屏变化
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    
    // 渲染比分刻度
    function renderScoreScale() {
      const container = document.getElementById('score-scale');
      container.innerHTML = SCORES.map((s, i) => 
        '<div class="scale-item" data-index="' + i + '">' + s + '</div>'
      ).join('');
    }
    
    // 更新显示
    function updateDisplay() {
      document.getElementById('red-score').textContent = SCORES[state.red];
      document.getElementById('blue-score').textContent = SCORES[state.blue];
      
      // 更新刻度高亮
      document.querySelectorAll('.scale-item').forEach((item, index) => {
        item.classList.remove('active-red', 'active-blue');
        if (index === state.red) {
          item.classList.add('active-red');
        }
        if (index === state.blue) {
          item.classList.add('active-blue');
        }
      });
      
      // 保存到 localStorage
      localStorage.setItem('guandan-scores', JSON.stringify(state));
      
      // 检查胜利
      checkWinner();
    }
    
    // 修改比分
    function changeScore(team, delta) {
      const newIndex = state[team] + delta;
      if (newIndex >= 0 && newIndex < SCORES.length) {
        state[team] = newIndex;
        updateDisplay();
      }
    }
    
    // 检查胜利
    let bannerTimer = null;
    function checkWinner() {
      const banner = document.getElementById('winner-banner');
      
      // 清除之前的定时器
      if (bannerTimer) {
        clearTimeout(bannerTimer);
        bannerTimer = null;
      }
      
      if (state.red === SCORES.length - 1) {
        banner.textContent = '红方即将获胜！';
        banner.className = 'winner-banner show red';
        bannerTimer = setTimeout(() => {
          banner.className = 'winner-banner';
        }, 3000);
      } else if (state.blue === SCORES.length - 1) {
        banner.textContent = '蓝方即将获胜！';
        banner.className = 'winner-banner show blue';
        bannerTimer = setTimeout(() => {
          banner.className = 'winner-banner';
        }, 3000);
      } else {
        banner.className = 'winner-banner';
      }
    }
    
    // 显示重置确认
    function showResetConfirm() {
      document.getElementById('modal-overlay').classList.add('show');
    }
    
    // 隐藏重置确认
    function hideResetConfirm() {
      document.getElementById('modal-overlay').classList.remove('show');
    }
    
    // 重置比分
    function resetScores() {
      state = { red: 0, blue: 0 };
      updateDisplay();
      hideResetConfirm();
    }
    
    // 点击遮罩关闭
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
      if (e.target === this) {
        hideResetConfirm();
      }
    });
    
    // 点击胜利横幅关闭
    document.getElementById('winner-banner').addEventListener('click', function() {
      this.className = 'winner-banner';
    });
    
    // 初始化
    init();
  </script>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
};
