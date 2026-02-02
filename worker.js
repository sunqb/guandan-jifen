/**
 * 掼蛋记分器 - Cloudflare Workers 版本
 * 红蓝两方对战，扑克牌比分系统 (2-A)
 */

const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>掼蛋记分器</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      -webkit-tap-highlight-color: transparent;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      color: #fff;
    }
    
    .title {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 30px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      letter-spacing: 4px;
    }
    
    .scoreboard {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .team {
      background: rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 30px 40px;
      text-align: center;
      backdrop-filter: blur(10px);
      border: 3px solid transparent;
      transition: all 0.3s ease;
      min-width: 180px;
    }
    
    .team.red {
      border-color: #ff4757;
      box-shadow: 0 0 30px rgba(255,71,87,0.3);
    }
    
    .team.blue {
      border-color: #3742fa;
      box-shadow: 0 0 30px rgba(55,66,250,0.3);
    }
    
    .team-name {
      font-size: 1.5rem;
      font-weight: bold;
      margin-bottom: 20px;
      letter-spacing: 2px;
    }
    
    .team.red .team-name {
      color: #ff4757;
    }
    
    .team.blue .team-name {
      color: #3742fa;
    }
    
    .score {
      font-size: 5rem;
      font-weight: bold;
      margin: 20px 0;
      min-width: 100px;
      display: inline-block;
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
      gap: 10px;
      justify-content: center;
      margin-top: 15px;
    }
    
    .btn {
      padding: 12px 24px;
      font-size: 1.2rem;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: bold;
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
    
    .actions {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      justify-content: center;
    }
    
    .btn-reset {
      background: linear-gradient(135deg, #9b59b6, #8e44ad);
      color: white;
      padding: 15px 40px;
      font-size: 1.1rem;
    }
    
    .btn-reset:hover {
      background: linear-gradient(135deg, #8e44ad, #7d3c98);
    }
    
    /* 比分刻度显示 */
    .score-scale {
      display: flex;
      justify-content: center;
      gap: 8px;
      margin-top: 20px;
      flex-wrap: wrap;
      max-width: 100%;
    }
    
    .scale-item {
      width: 35px;
      height: 35px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      font-weight: bold;
      font-size: 0.9rem;
      background: rgba(255,255,255,0.1);
      color: rgba(255,255,255,0.5);
      transition: all 0.3s ease;
    }
    
    .scale-item.active-red {
      background: linear-gradient(135deg, #ff4757, #ff6b7a);
      color: white;
      box-shadow: 0 0 15px rgba(255,71,87,0.5);
    }
    
    .scale-item.active-blue {
      background: linear-gradient(135deg, #3742fa, #5a67f2);
      color: white;
      box-shadow: 0 0 15px rgba(55,66,250,0.5);
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
      padding: 30px 40px;
      border-radius: 20px;
      text-align: center;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
      max-width: 90%;
    }
    
    .modal h3 {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #f39c12;
    }
    
    .modal p {
      margin-bottom: 25px;
      color: #bdc3c7;
    }
    
    .modal-buttons {
      display: flex;
      gap: 15px;
      justify-content: center;
    }
    
    .btn-confirm {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
      padding: 12px 30px;
    }
    
    .btn-cancel {
      background: linear-gradient(135deg, #95a5a6, #7f8c8d);
      color: white;
      padding: 12px 30px;
    }
    
    /* 胜利提示 */
    .winner-banner {
      display: none;
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      padding: 40px 60px;
      border-radius: 20px;
      font-size: 2rem;
      font-weight: bold;
      z-index: 100;
      animation: pulse 0.5s ease-in-out infinite alternate;
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
    
    /* 响应式 */
    @media (max-width: 500px) {
      .title {
        font-size: 1.5rem;
      }
      
      .team {
        padding: 20px 25px;
        min-width: 150px;
      }
      
      .score {
        font-size: 3.5rem;
      }
      
      .btn {
        padding: 10px 18px;
        font-size: 1rem;
      }
      
      .scale-item {
        width: 28px;
        height: 28px;
        font-size: 0.8rem;
      }
    }
  </style>
</head>
<body>
  <h1 class="title">掼蛋记分器</h1>
  
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
  
  <div class="actions" style="margin-top: 30px;">
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
    }
    
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
    function checkWinner() {
      const banner = document.getElementById('winner-banner');
      
      if (state.red === SCORES.length - 1) {
        banner.textContent = '红方获胜！';
        banner.className = 'winner-banner show red';
      } else if (state.blue === SCORES.length - 1) {
        banner.textContent = '蓝方获胜！';
        banner.className = 'winner-banner show blue';
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
