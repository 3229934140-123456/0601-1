const GiftModule = (() => {
  let chartType = 'income';
  let timeRange = 'week';
  let filterType = 'all';
  let eventsBound = false;

  function init() {
    bindEvents();
  }

  function render() {
    const container = document.getElementById('module-gift');
    if (!container) return;

    const state = store.getState();
    const giftCount = state.giftHistory.reduce((sum, g) => sum + g.count, 0);
    const giftTypes = new Set(state.giftHistory.map(g => g.giftId)).size;

    container.innerHTML = `
      <div class="gift-header">
        <h1 class="gift-header__title">礼物收益</h1>
        <button class="btn btn--secondary btn--sm" id="exportBtn">
          📊 导出报表
        </button>
      </div>
      
      <div class="gift-stats-row">
        <div class="gift-stat-card">
          <div class="gift-stat-card__label">今日收益</div>
          <div class="gift-stat-card__value">¥${state.todayIncome.toFixed(2)}</div>
          <div class="gift-stat-card__trend up">
            <span>↑</span>
            <span>较昨日 +12.5%</span>
          </div>
        </div>
        <div class="gift-stat-card">
          <div class="gift-stat-card__label">累计收益</div>
          <div class="gift-stat-card__value">¥${state.totalIncome.toLocaleString()}</div>
          <div class="gift-stat-card__trend up">
            <span>↑</span>
            <span>本月 +¥2,340</span>
          </div>
        </div>
        <div class="gift-stat-card">
          <div class="gift-stat-card__label">礼物数量</div>
          <div class="gift-stat-card__value">${giftCount}</div>
          <div class="gift-stat-card__trend up">
            <span>↑</span>
            <span>今日收到</span>
          </div>
        </div>
        <div class="gift-stat-card">
          <div class="gift-stat-card__label">礼物种类</div>
          <div class="gift-stat-card__value">${giftTypes}</div>
          <div class="gift-stat-card__trend">
            <span>🎁</span>
            <span>不同礼物</span>
          </div>
        </div>
      </div>
      
      <div class="gift-main-grid">
        <div class="gift-chart-section">
          <div class="gift-chart-section__header">
            <span class="gift-chart-section__title">收益趋势</span>
            <div class="gift-chart-tabs">
              <button class="gift-chart-tab active" data-range="day">今日</button>
              <button class="gift-chart-tab" data-range="week">本周</button>
              <button class="gift-chart-tab" data-range="month">本月</button>
            </div>
          </div>
          <div class="gift-chart-container">
            <canvas id="incomeChart"></canvas>
          </div>
        </div>
        
        <div class="gift-ranking">
          <div class="gift-ranking__header">
            <span class="gift-ranking__title">🏆 贡献榜</span>
          </div>
          <div class="gift-ranking__list" id="rankingList">
            ${renderRankingList()}
          </div>
        </div>
      </div>
      
      <div class="gift-detail-section">
        <div class="gift-detail-section__header">
          <span class="gift-detail-section__title">礼物明细</span>
          <div class="gift-detail-filters">
            <button class="filter-btn active" data-filter="all">全部</button>
            <button class="filter-btn" data-filter="high-value">高价值</button>
            <button class="filter-btn" data-filter="today">今日</button>
          </div>
        </div>
        <div class="gift-table-container">
          <table class="gift-table">
            <thead>
              <tr>
                <th>礼物</th>
                <th>送礼人</th>
                <th>数量</th>
                <th>价值</th>
                <th>时间</th>
              </tr>
            </thead>
            <tbody id="giftTableBody">
              ${renderGiftTable()}
            </tbody>
          </table>
        </div>
      </div>
    `;

    renderChart();
  }

  function renderRankingList() {
    return mockData.giftRanking.map(item => {
      const avatarColor = utils.getAvatarColor(item.userName);
      const avatarText = utils.getInitials(item.userName);
      return `
        <div class="gift-ranking-item">
          <span class="rank-number">${item.rank}</span>
          <div class="ranking-avatar" style="background: ${avatarColor}">${avatarText}</div>
          <div class="ranking-info">
            <div class="ranking-name">${item.userName}</div>
            <div class="ranking-level">LV.${item.level}</div>
          </div>
          <span class="ranking-value">¥${item.totalValue}</span>
        </div>
      `;
    }).join('');
  }

  function renderGiftTable() {
    const state = store.getState();
    let gifts = [...state.giftHistory].reverse();

    if (filterType === 'high-value') {
      gifts = gifts.filter(g => g.value >= 50);
    } else if (filterType === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStart = today.getTime();
      gifts = gifts.filter(g => g.time >= todayStart);
    }

    if (gifts.length === 0) {
      return `
        <tr>
          <td colspan="5" style="text-align:center;padding:40px;color:var(--text-muted);">
            暂无礼物记录
          </td>
        </tr>
      `;
    }

    return gifts.slice(0, 50).map(gift => {
      const avatarColor = utils.getAvatarColor(gift.sender);
      const avatarText = utils.getInitials(gift.sender);
      return `
        <tr>
          <td>
            <div class="gift-table__gift">
              <span class="gift-table__icon">${gift.icon || '🎁'}</span>
              <span class="gift-table__name">${gift.name}</span>
            </div>
          </td>
          <td>
            <div class="gift-table__gift">
              <div class="ranking-avatar" style="width:28px;height:28px;font-size:11px;background:${avatarColor}">${avatarText}</div>
              <span>${gift.sender}</span>
            </div>
          </td>
          <td><span class="gift-table__count">x${gift.count}</span></td>
          <td><span class="gift-table__value">¥${(gift.value * gift.count).toFixed(2)}</span></td>
          <td><span class="gift-table__time">${utils.formatDate(gift.time)}</span></td>
        </tr>
      `;
    }).join('');
  }

  function renderChart() {
    const canvas = document.getElementById('incomeChart');
    if (!canvas) return;

    chart.drawLineChart(canvas, mockData.incomeTrend);
  }

  function bindEvents() {
    if (eventsBound) return;
    eventsBound = true;

    document.addEventListener('click', (e) => {
      const chartTab = e.target.closest('.gift-chart-tab');
      if (chartTab) {
        const range = chartTab.dataset.range;
        setTimeRange(range);
      }

      const filterBtn = e.target.closest('.filter-btn');
      if (filterBtn) {
        const filter = filterBtn.dataset.filter;
        setFilter(filter);
      }

      if (e.target.id === 'exportBtn') {
        exportReport();
      }
    });

    store.on('gift:new', () => {
      updateStats();
      updateGiftTable();
    });
  }

  function setTimeRange(range) {
    timeRange = range;
    
    const tabs = document.querySelectorAll('.gift-chart-tab');
    tabs.forEach(tab => {
      tab.classList.toggle('active', tab.dataset.range === range);
    });

    const canvas = document.getElementById('incomeChart');
    if (canvas) {
      const data = generateChartData(range);
      chart.drawLineChart(canvas, data);
    }
  }

  function generateChartData(range) {
    if (range === 'day') {
      const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '23:59'];
      return hours.map(h => ({ day: h, value: utils.randomInt(50, 200) }));
    }
    if (range === 'month') {
      const days = ['第1周', '第2周', '第3周', '第4周'];
      return days.map(d => ({ day: d, value: utils.randomInt(1000, 3000) }));
    }
    return mockData.incomeTrend;
  }

  function setFilter(type) {
    filterType = type;
    
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === type);
    });

    updateGiftTable();
  }

  function updateStats() {
    const state = store.getState();
    const cards = document.querySelectorAll('.gift-stat-card__value');
    
    if (cards[0]) {
      cards[0].textContent = '¥' + state.todayIncome.toFixed(2);
    }
    
    const giftCount = state.giftHistory.reduce((sum, g) => sum + g.count, 0);
    if (cards[2]) {
      cards[2].textContent = giftCount;
    }
    
    const giftTypes = new Set(state.giftHistory.map(g => g.giftId)).size;
    if (cards[3]) {
      cards[3].textContent = giftTypes;
    }
  }

  function updateGiftTable() {
    const tbody = document.getElementById('giftTableBody');
    if (tbody) {
      tbody.innerHTML = renderGiftTable();
    }
  }

  function exportReport() {
    const state = store.getState();
    const report = {
      date: utils.formatDate(Date.now()),
      todayIncome: state.todayIncome,
      totalIncome: state.totalIncome,
      giftCount: state.giftHistory.length,
      gifts: state.giftHistory
    };
    
    console.log('导出报表:', report);
    utils.showNotification('导出成功', '收益报表已导出', 'success');
  }

  function show() {
    render();
  }

  function hide() {
  }

  return {
    init,
    render,
    show,
    hide
  };
})();

window.GiftModule = GiftModule;
